<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useListsStore } from '@/stores/lists'
import { useItemsStore } from '@/stores/items'
import { useProductsStore } from '@/stores/products'
import { useCategoriesStore } from '@/stores/categories'
import { useToastNotifications } from '@/composables/useToastNotifications'
import { useListCategories } from '@/composables/useListCategories'
import { categorizeItem, parseItemsFromText, sanitizeItemName } from '@/utils/categorization'
import { useShare } from '@/composables/useShare'
import { darkenColor, DEFAULT_LIST_COLOR } from '@/utils/colors'
import type { ScanResult } from '@/composables/useBarcodeScanner'
import {
  BackButton,
  BaseCard,
  BaseInput,
  BaseButton,
  BaseToast,
  LoadingSpinner,
  EmptyState,
  ConfirmDialog,
  IconButton,
  CategorySection,
  CreateCategoryDialog,
  BarcodeScannerModal,
  VoiceInputModal,
} from '@/components'
import type { ShoppingItem } from '@/db'

const route = useRoute()
const router = useRouter()
const listsStore = useListsStore()
const itemsStore = useItemsStore()
const productsStore = useProductsStore()
const categoriesStore = useCategoriesStore()
const { shareList, exportListAsJSON, downloadJSON } = useShare()
const toastStore = useToastNotifications()

const listId = route.params.id as string
const {
  showCreateCategory,
  getPreferredCategory,
  handleChangeCategory,
  handleCreateCategoryRequest,
  handleCreateCategory,
} = useListCategories(listId)

const list = computed(() => listsStore.getListById(listId))
const items = itemsStore.getItemsByListId(listId)

const quickAddInput = ref('')
const isRenaming = ref(false)
const newListName = ref('')
const newListColor = ref(DEFAULT_LIST_COLOR)
const showClearConfirm = ref(false)
const showScanner = ref(false)
const showVoice = ref(false)
const scannerModalRef = ref<InstanceType<typeof BarcodeScannerModal> | null>(null)

// Computed colors based on list color
const listColor = computed(() => list.value?.color || DEFAULT_LIST_COLOR)
const listColorDark = computed(() => darkenColor(listColor.value))

onMounted(async () => {
  if (!listsStore.lists.length) {
    await listsStore.loadLists()
  }
  await itemsStore.loadItems(listId)
  await categoriesStore.loadCustomCategories()
  await productsStore.loadProducts() // Load products for offline barcode lookup

  // Check if we just imported this list
  if (route.query.imported === 'true') {
    toastStore.showSuccess('List imported successfully!')
    router.replace({ query: {} })
  }

  // Check if we just created this list
  if (route.query.created === 'true') {
    const listName = route.query.name as string
    toastStore.showSuccess(`List "${listName}" created successfully!`)
    router.replace({ query: {} })
  }

  // Check if we just duplicated this list
  if (route.query.duplicated === 'true') {
    const originalName = route.query.name as string
    toastStore.showSuccess(`List "${originalName}" duplicated successfully!`)
    router.replace({ query: {} })
  }

  // Handle PWA shortcuts
  if (route.query.action === 'add') {
    // Focus on quick add input when launched via "Add Items" shortcut
    setTimeout(() => {
      const input = document.querySelector('#quick-add-input') as HTMLInputElement
      if (input) input.focus()
    }, 100)
    router.replace({ query: {} })
  } else if (route.query.action === 'voice') {
    // Open voice modal when launched via "Voice Input" shortcut
    setTimeout(() => {
      showVoice.value = true
    }, 100)
    router.replace({ query: {} })
  }

  if (!list.value) {
    router.push('/')
  }
})

const itemsByCategory = computed(() => {
  const grouped: Record<string, ShoppingItem[]> = {}

  items.value.forEach((item) => {
    if (!grouped[item.category]) {
      grouped[item.category] = []
    }
    grouped[item.category]!.push(item)
  })

  // Sort items within each category: incomplete items first, completed items last
  Object.keys(grouped).forEach((category) => {
    grouped[category] = grouped[category]!.sort((a, b) => {
      // If completion status is different, incomplete items come first
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }
      // If both have same completion status, maintain original order (by addedAt)
      return a.addedAt - b.addedAt
    })
  })

  // Return categories in sorted order from store
  return categoriesStore.sortedCategories.reduce(
    (acc: Record<string, ShoppingItem[]>, category) => {
      if (grouped[category.id]) {
        acc[category.id] = grouped[category.id]!
      }
      return acc
    },
    {} as Record<string, ShoppingItem[]>,
  )
})

const completedCount = computed(() => itemsStore.getCompletedCount(listId))
const totalCount = computed(() => itemsStore.getTotalCount(listId))
const progressPercentage = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((completedCount.value / totalCount.value) * 100)
})

const handleQuickAdd = async () => {
  const input = quickAddInput.value.trim()
  if (!input) return

  try {
    const itemNames = parseItemsFromText(input)

    for (const name of itemNames) {
      const sanitized = sanitizeItemName(name)
      // Check user preferences first, then fall back to auto-categorization
      const preferredCategory = getPreferredCategory(sanitized)
      const category = categorizeItem(sanitized, preferredCategory)
      await itemsStore.createItem(listId, sanitized, category)
    }

    quickAddInput.value = ''
  } catch (error) {
    console.error('Failed to add items:', error)
  }
}

const handleScan = async (result: ScanResult) => {
  try {
    // Check if product exists in local database
    const product = await productsStore.getProductByBarcode(result.barcode)

    if (product) {
      // Check if user has a preferred category for this item (from manual changes)
      const preferredCategory = getPreferredCategory(product.name)
      const categoryToUse = preferredCategory || product.category

      // Known product - add to list with preferred/saved category
      await itemsStore.createItem(listId, product.name, categoryToUse)
      await productsStore.updateLastUsed(product.barcode)
      toastStore.showSuccess(`Added "${product.name}" from barcode`)

      // Update product's category if user has changed preference
      if (preferredCategory && preferredCategory !== product.category) {
        await productsStore.saveProduct({
          barcode: product.barcode,
          name: product.name,
          category: preferredCategory,
        })
      }

      // Close scanner on success
      showScanner.value = false
    } else {
      // Unknown barcode - tell modal to show error state
      scannerModalRef.value?.handleBarcodeNotFound()
    }
  } catch (error) {
    console.error('Failed to process barcode:', error)
    toastStore.showError('Failed to process barcode')
  }
}

const handleManualEntry = async (name: string, category: string) => {
  try {
    const sanitized = sanitizeItemName(name)
    await itemsStore.createItem(listId, sanitized, category)
    toastStore.showSuccess(`Added "${sanitized}"`)

    // If we have a last scanned barcode, save it to products database for future use
    const lastBarcode = scannerModalRef.value?.lastScannedBarcode
    if (lastBarcode) {
      await productsStore.saveProduct({
        barcode: lastBarcode,
        name: sanitized,
        category,
      })
    }

    // Close scanner after successful manual entry
    showScanner.value = false
  } catch (error) {
    console.error('Failed to add item:', error)
    toastStore.showError('Failed to add item')
  }
}

const handleVoiceInput = async (transcript: string) => {
  try {
    // Parse the transcript into items (handles natural language like "milk and eggs")
    const parsedItems = parseItemsFromText(transcript)

    if (parsedItems.length === 0) {
      toastStore.showError('Could not parse any items from voice input')
      return
    }

    // Add each parsed item
    for (const itemText of parsedItems) {
      const sanitized = sanitizeItemName(itemText)
      const category = categorizeItem(sanitized)
      await itemsStore.createItem(listId, sanitized, category)
    }

    // Close voice modal
    showVoice.value = false

    // Show success message
    const itemCount = parsedItems.length
    const itemWord = itemCount === 1 ? 'item' : 'items'
    toastStore.showSuccess(`Added ${itemCount} ${itemWord}`)
  } catch (error) {
    console.error('Failed to add voice items:', error)
    toastStore.showError('Failed to add items from voice input')
  }
}

const handleToggleItem = async (itemId: string) => {
  try {
    await itemsStore.toggleItemComplete(listId, itemId)
  } catch (error) {
    console.error('Failed to toggle item:', error)
  }
}

const handleDeleteItem = async (itemId: string) => {
  try {
    await itemsStore.deleteItem(listId, itemId)
  } catch (error) {
    console.error('Failed to delete item:', error)
  }
}

const handleRemoveCompleted = async () => {
  showClearConfirm.value = true
}

const confirmClearCompleted = async () => {
  try {
    const completedCount = itemsStore.getCompletedCount(listId)
    await itemsStore.removeCompletedItems(listId)
    toastStore.showSuccess(
      `Removed ${completedCount} completed ${completedCount === 1 ? 'item' : 'items'}`,
    )
  } catch (error) {
    console.error('Failed to remove completed items:', error)
    toastStore.showError('Failed to remove completed items')
  }
}

const startRenaming = () => {
  if (list.value) {
    newListName.value = list.value.name
    newListColor.value = list.value.color || DEFAULT_LIST_COLOR
    isRenaming.value = true
  }
}

const handleRename = async () => {
  if (!newListName.value.trim() || !list.value) return

  try {
    const oldName = list.value.name
    await listsStore.renameList(listId, newListName.value.trim(), newListColor.value)
    toastStore.showSuccess(`List renamed from "${oldName}" to "${newListName.value.trim()}"!`)
    isRenaming.value = false
  } catch (error) {
    console.error('Failed to rename list:', error)
  }
}

const handleShare = async () => {
  if (!list.value) return

  try {
    const success = await shareList(list.value, items.value)
    if (success) {
      toastStore.showSuccess('List shared/copied successfully!')
    }
  } catch (error) {
    console.error('Failed to share list:', error)
    toastStore.showError('Failed to share list. Please try again.')
  }
}

const handleExport = () => {
  if (!list.value) return

  try {
    const json = exportListAsJSON(list.value, items.value)
    const filename = `${list.value.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.json`
    downloadJSON(filename, json)
    toastStore.showSuccess('List exported successfully!')
  } catch (error) {
    console.error('Failed to export list:', error)
    toastStore.showError('Failed to export list. Please try again.')
  }
}
</script>

<template>
  <div v-if="list" class="w-full max-w-4xl mx-auto animate-[fadeIn_0.3s_ease-out]">
    <!-- Back Button -->
    <BackButton to="/" />

    <!-- Title Card with Gradient -->
    <BaseCard
      padding="lg"
      class="border-0! text-white max:p-6! mb-6"
      :style="{
        background: `linear-gradient(to bottom right, ${listColor}, ${listColorDark})`,
      }"
    >
      <!-- Title Display/Edit -->
      <div v-if="!isRenaming" class="flex items-center gap-4 mb-6">
        <h1 class="text-3xl md:text-4xl font-bold text-white flex-1 wrap-break-word">
          {{ list.name }}
        </h1>
        <IconButton variant="icon" icon="✏️" title="Edit list name" @click="startRenaming" />
      </div>

      <div v-else class="mb-6">
        <BaseInput
          v-model="newListName"
          class="text-xl! font-semibold! mb-4!"
          autofocus
          @keyup.enter="handleRename"
          @keyup.esc="isRenaming = false"
        />
        <div class="space-y-2 mb-4">
          <label for="edit-list-color" class="text-sm font-medium text-white block"
            >List Color</label
          >
          <div
            class="flex items-center gap-3 p-3 bg-white/10 rounded-xl border border-white/20 backdrop-blur-sm"
          >
            <div class="relative">
              <input
                id="edit-list-color"
                type="color"
                v-model="newListColor"
                class="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                title="Choose list color"
              />
              <div
                class="w-12 h-12 rounded-lg border-2 border-white/30 shadow-sm cursor-pointer transition-transform hover:scale-105"
                :style="{ backgroundColor: newListColor }"
              ></div>
            </div>
            <div class="flex-1">
              <div class="text-sm font-medium text-white">{{ newListColor.toUpperCase() }}</div>
              <div class="text-xs text-white/70">Click to change color</div>
            </div>
          </div>
        </div>
        <div class="flex gap-2 justify-end">
          <BaseButton variant="secondary" @click="isRenaming = false"> Cancel </BaseButton>
          <BaseButton @click="handleRename"> Save </BaseButton>
        </div>
      </div>

      <!-- Progress Section -->
      <div class="flex flex-col gap-4">
        <div class="flex justify-around gap-4">
          <div class="flex flex-col items-center gap-1">
            <span class="text-3xl font-bold text-white leading-none">{{ totalCount }}</span>
            <span class="text-sm text-white/90 uppercase tracking-wide">Total</span>
          </div>
          <div class="flex flex-col items-center gap-1">
            <span class="text-3xl font-bold text-white leading-none">{{ completedCount }}</span>
            <span class="text-sm text-white/90 uppercase tracking-wide">Done</span>
          </div>
          <div class="flex flex-col items-center gap-1">
            <span class="text-3xl font-bold text-white leading-none"
              >{{ progressPercentage }}%</span
            >
            <span class="text-sm text-white/90 uppercase tracking-wide">Complete</span>
          </div>
        </div>
        <div
          class="h-3 bg-white/30 rounded-full overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"
        >
          <div
            class="h-full bg-linear-to-r from-white to-white/90 rounded-full shadow-[0_2px_8px_rgba(255,255,255,0.3)] transition-all duration-500"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
      </div>
    </BaseCard>

    <!-- Quick Add Card -->
    <BaseCard padding="md" class="mb-6">
      <div class="flex items-center gap-2 mb-4">
        <span class="text-lg font-semibold text-text">Quick Add</span>
      </div>
      <div class="flex gap-2 max-md:flex-col">
        <BaseInput
          id="quick-add-input"
          v-model="quickAddInput"
          placeholder="e.g., milk, bread, eggs or type multiple items..."
          class="flex-1"
          @keyup.enter="handleQuickAdd"
        />
        <div class="flex gap-2 max-md:w-full max-md:flex-col">
          <div class="flex gap-2 max-md:flex-1">
            <BaseButton
              @click="showVoice = true"
              variant="secondary"
              class="whitespace-nowrap max-md:flex-1"
              title="Voice input"
            >
              <span class="text-lg">🎤</span>
              Voice
            </BaseButton>
            <BaseButton
              @click="showScanner = true"
              variant="secondary"
              class="whitespace-nowrap max-md:flex-1"
              title="Scan barcode"
            >
              <span class="text-lg">📷</span>
              Scan
            </BaseButton>
          </div>
          <BaseButton
            @click="handleQuickAdd"
            :disabled="!quickAddInput.trim()"
            class="whitespace-nowrap max-md:flex-1"
            :style="{
              background: `linear-gradient(to bottom right, ${listColor}, ${listColorDark})`,
            }"
          >
            Add Items
          </BaseButton>
        </div>
      </div>
    </BaseCard>

    <!-- Share and Export Actions -->
    <div class="mb-6 flex gap-2 flex-wrap max-sm:justify-between">
      <BaseButton variant="secondary" @click="handleShare" class="flex items-center gap-2">
        <span class="text-lg">📤</span>
        Share List
      </BaseButton>
      <BaseButton variant="secondary" @click="handleExport" class="flex items-center gap-2">
        <span class="text-lg">💾</span>
        Export JSON
      </BaseButton>
    </div>

    <!-- Notifications -->
    <BaseToast
      v-for="toast in toastStore.toasts"
      :key="toast.id"
      v-model="toast.visible"
      :message="toast.message"
      :variant="toast.variant"
    />

    <!-- Clear Completed Button -->
    <div v-if="completedCount > 0" class="mb-6 flex justify-end">
      <BaseButton variant="danger" @click="handleRemoveCompleted">
        <span class="text-lg">🗑️</span>
        Clear Completed ({{ completedCount }})
      </BaseButton>
    </div>

    <!-- Clear Completed Confirmation Dialog -->
    <ConfirmDialog
      v-model="showClearConfirm"
      title="Clear Completed Items?"
      message="Are you sure you want to remove all completed items? This action cannot be undone."
      confirm-text="Clear Items"
      cancel-text="Cancel"
      confirm-variant="danger"
      @confirm="confirmClearCompleted"
    />

    <!-- Create Category Dialog -->
    <CreateCategoryDialog v-model="showCreateCategory" @create="handleCreateCategory" />

    <!-- Empty State -->
    <EmptyState
      v-if="totalCount === 0"
      icon="📝"
      title="Start your shopping list"
      description="Add items using the quick add box above. You can add multiple items at once!"
    />

    <!-- Items by Category -->
    <div v-else class="flex flex-col gap-4">
      <CategorySection
        v-for="(categoryItems, categoryId) in itemsByCategory"
        :key="categoryId"
        :category-id="categoryId"
        :items="categoryItems"
        :list-color="listColor"
        @toggle-item="handleToggleItem"
        @delete-item="handleDeleteItem"
        @change-category="handleChangeCategory"
        @create-category="handleCreateCategoryRequest"
      />
    </div>

    <!-- Barcode Scanner Modal -->
    <BarcodeScannerModal
      ref="scannerModalRef"
      v-model="showScanner"
      @scan="handleScan"
      @manual-entry="handleManualEntry"
    />

    <!-- Voice Input Modal -->
    <VoiceInputModal v-model="showVoice" @confirm="handleVoiceInput" />
  </div>

  <!-- Loading State -->
  <LoadingSpinner v-else message="Loading list..." />
</template>
