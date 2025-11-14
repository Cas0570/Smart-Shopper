<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useListsStore } from '@/stores/lists'
import { useItemsStore } from '@/stores/items'
import { useShare } from '@/composables/useShare'
import { useToastNotifications } from '@/composables/useToastNotifications'
import {
  ViewHeader,
  BaseToast,
  LoadingSpinner,
  EmptyState,
  ConfirmDialog,
  ListCard,
  CreateListDialog,
  BaseButton,
} from '@/components'

const router = useRouter()
const listsStore = useListsStore()
const itemsStore = useItemsStore()
const { importListFromJSON } = useShare()
const toastStore = useToastNotifications()

const showCreateDialog = ref(false)
const showArchived = ref(false)
const showDeleteConfirm = ref(false)
const listToDelete = ref<string | null>(null)

onMounted(async () => {
  await listsStore.loadLists()

  // Load items for all lists to show correct counts
  const allLists = [...listsStore.activeLists, ...listsStore.archivedLists]
  await Promise.all(allLists.map((list) => itemsStore.loadItems(list.id)))
})

const handleCreateList = async (name: string, color: string) => {
  try {
    const list = await listsStore.createList(name, color)
    router.push(`/list/${list.id}?created=true&name=${encodeURIComponent(name)}`)
  } catch (error) {
    console.error('Failed to create list:', error)
  }
}

const handleDuplicateList = async (id: string) => {
  try {
    const originalList = listsStore.getListById(id)
    const newList = await listsStore.duplicateList(id)
    router.push(
      `/list/${newList.id}?duplicated=true&name=${encodeURIComponent(originalList?.name || '')}`,
    )
  } catch (error) {
    console.error('Failed to duplicate list:', error)
  }
}

const handleArchiveList = async (id: string) => {
  try {
    const list = listsStore.getListById(id)
    await listsStore.archiveList(id)
    toastStore.showSuccess(`List "${list?.name}" archived successfully!`)
  } catch (error) {
    console.error('Failed to archive list:', error)
  }
}

const handleUnarchiveList = async (id: string) => {
  try {
    const list = listsStore.getListById(id)
    await listsStore.unarchiveList(id)
    toastStore.showSuccess(`List "${list?.name}" unarchived successfully!`)
  } catch (error) {
    console.error('Failed to unarchive list:', error)
  }
}

const handleDeleteList = async (id: string) => {
  listToDelete.value = id
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  if (!listToDelete.value) return

  try {
    const list = listsStore.getListById(listToDelete.value)
    await listsStore.deleteList(listToDelete.value)
    toastStore.showSuccess(`List "${list?.name}" deleted successfully!`)
    listToDelete.value = null
  } catch (error) {
    console.error('Failed to delete list:', error)
  }
}

const cancelDelete = () => {
  listToDelete.value = null
}

const handleImport = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  try {
    const content = await file.text()
    const { list, items } = await importListFromJSON(content)

    // Create the imported list
    const importedList = await listsStore.createList(
      `${list.name} (imported)`,
      list.color || '#4CAF50',
    )

    // Create all items for this list
    for (const item of items) {
      await itemsStore.createItem(
        importedList.id,
        item.name,
        item.category,
        item.quantity,
        item.unit,
      )
    }

    // Navigate to imported list with success query param
    router.push(`/list/${importedList.id}?imported=true`)
  } catch (error) {
    console.error('Failed to import list:', error)
    toastStore.showError(
      error instanceof Error ? error.message : 'Failed to import list. Please check the file.',
    )
  } finally {
    // Reset file input
    input.value = ''
  }
}

const navigateToSettings = () => {
  router.push('/settings')
}
</script>

<template>
  <div class="w-full animate-[fadeIn_0.3s_ease-out]">
    <!-- Header -->
    <ViewHeader title="My Lists" subtitle="Organize your shopping efficiently">
      <template #action>
        <div class="flex gap-2 flex-wrap max-md:flex-col max-md:w-full">
          <BaseButton @click="showCreateDialog = true" class="max-md:w-full">
            <span class="text-lg">+</span>
            New List
          </BaseButton>
          <BaseButton as="label" variant="secondary" class="max-md:w-full">
            <input
              type="file"
              accept=".json"
              @change="handleImport"
              class="hidden"
              aria-label="Import list from JSON"
            />
            <span class="text-lg">📥</span>
            Import JSON
          </BaseButton>
          <BaseButton @click="navigateToSettings" variant="secondary" title="Settings">
            <span class="text-lg">⚙️</span>
            Settings
          </BaseButton>
        </div>
      </template>
    </ViewHeader>

    <!-- Notifications -->
    <BaseToast
      v-for="toast in toastStore.toasts"
      :key="toast.id"
      v-model="toast.visible"
      :message="toast.message"
      :variant="toast.variant"
    />

    <!-- Create List Dialog -->
    <CreateListDialog v-model="showCreateDialog" @create="handleCreateList" />

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog
      v-model="showDeleteConfirm"
      title="Delete List?"
      message="Are you sure you want to delete this list? This action cannot be undone and all items will be permanently removed."
      confirm-text="Delete"
      cancel-text="Cancel"
      confirm-variant="danger"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />

    <!-- Loading State -->
    <LoadingSpinner v-if="listsStore.loading" message="Loading your lists..." />

    <!-- Empty State -->
    <EmptyState
      v-else-if="listsStore.activeLists.length === 0"
      icon="🛒"
      title="No lists yet"
      description="Create your first shopping list to get started!"
    >
      <template #action>
        <BaseButton @click="showCreateDialog = true">
          <span class="text-lg">+</span>
          Create Your First List
        </BaseButton>
      </template>
    </EmptyState>

    <!-- Lists Grid -->
    <div
      v-else
      class="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6 mb-8 max-md:grid-cols-1 max-md:gap-4"
    >
      <ListCard
        v-for="list in listsStore.activeLists"
        :key="list.id"
        :list="list"
        :total-items="itemsStore.getTotalCount(list.id)"
        :completed-items="itemsStore.getCompletedCount(list.id)"
        variant="active"
        @click="router.push(`/list/${list.id}`)"
        @duplicate="handleDuplicateList(list.id)"
        @archive="handleArchiveList(list.id)"
        @delete="handleDeleteList(list.id)"
      />
    </div>

    <!-- Archived Lists Section -->
    <div v-if="listsStore.archivedLists.length > 0" class="mt-12 pt-8 border-t-2 border-border">
      <button
        class="flex items-center gap-2 w-full text-left p-4 rounded-xl transition-all duration-200 text-text-secondary font-semibold hover:bg-background hover:text-text mb-6"
        @click="showArchived = !showArchived"
      >
        <span class="text-sm transition-transform">{{ showArchived ? '▼' : '▶' }}</span>
        <span class="flex-1">Archived Lists</span>
        <span
          class="bg-background text-text-secondary px-2 py-1 rounded-full text-sm font-semibold min-w-[24px] text-center"
        >
          {{ listsStore.archivedLists.length }}
        </span>
      </button>

      <div
        v-if="showArchived"
        class="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6 animate-[slideDown_0.3s_ease-out] max-md:grid-cols-1 max-md:gap-4"
      >
        <ListCard
          v-for="list in listsStore.archivedLists"
          :key="list.id"
          :list="list"
          :total-items="0"
          :completed-items="0"
          variant="archived"
          @unarchive="handleUnarchiveList(list.id)"
          @delete="handleDeleteList(list.id)"
        />
      </div>
    </div>
  </div>
</template>
