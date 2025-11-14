<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCategoriesStore } from '@/stores/categories'
import { BaseButton } from '@/components'

const categoriesStore = useCategoriesStore()

type CategoryItem = {
  id: string
  name: string
  icon?: string
  sortOrder: number
}

const localCategories = ref<CategoryItem[]>([])
const showSuccessMessage = ref(false)

onMounted(async () => {
  await categoriesStore.loadCustomCategories()
  localCategories.value = categoriesStore.sortedCategories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    sortOrder: cat.sortOrder ?? 0,
  }))
})

const hasChanges = computed(() => {
  if (localCategories.value.length !== categoriesStore.sortedCategories.length) {
    return true
  }
  return localCategories.value.some(
    (cat, index) => cat.id !== categoriesStore.sortedCategories[index]?.id,
  )
})

const moveUp = (index: number) => {
  if (index === 0) return
  const temp = localCategories.value[index]
  localCategories.value[index] = localCategories.value[index - 1]!
  localCategories.value[index - 1] = temp!
}

const moveDown = (index: number) => {
  if (index === localCategories.value.length - 1) return
  const temp = localCategories.value[index]
  localCategories.value[index] = localCategories.value[index + 1]!
  localCategories.value[index + 1] = temp!
}

const saveOrder = () => {
  const newOrder = localCategories.value.map((cat) => cat.id)
  categoriesStore.saveCategoryOrder(newOrder)
  showSuccessMessage.value = true
  setTimeout(() => {
    showSuccessMessage.value = false
  }, 3000)
}

const resetOrder = async () => {
  categoriesStore.resetCategoryOrder()
  await categoriesStore.loadCustomCategories()
  localCategories.value = categoriesStore.sortedCategories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    sortOrder: cat.sortOrder ?? 0,
  }))
  showSuccessMessage.value = true
  setTimeout(() => {
    showSuccessMessage.value = false
  }, 3000)
}
</script>

<template>
  <div class="w-full">
    <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 class="text-2xl font-bold mb-2 text-gray-900">Category Order</h2>
      <p class="text-gray-600 mb-6">
        Arrange categories to match your store's layout. Items will be grouped in this order on your
        shopping lists.
      </p>

      <div class="space-y-3 mb-6">
        <div
          v-for="(category, index) in localCategories"
          :key="category.id"
          class="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 transition-all"
        >
          <div class="flex flex-col gap-1">
            <button
              @click="moveUp(index)"
              :disabled="index === 0"
              class="p-1.5 rounded bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
              :title="`Move ${category.name} up`"
              :aria-label="`Move ${category.name} up`"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
            <button
              @click="moveDown(index)"
              :disabled="index === localCategories.length - 1"
              class="p-1.5 rounded bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
              :title="`Move ${category.name} down`"
              :aria-label="`Move ${category.name} down`"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>

          <div class="flex items-center gap-3 flex-1">
            <span class="text-3xl" role="img" :aria-label="category.name">{{
              category.icon || '📦'
            }}</span>
            <div class="flex-1">
              <div class="font-semibold text-gray-900 text-lg">
                {{ category.name }}
              </div>
              <div class="text-sm text-gray-500">
                Position {{ index + 1 }} of {{ localCategories.length }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <BaseButton @click="saveOrder" variant="primary" :disabled="!hasChanges" class="flex-1">
          <span class="text-lg">💾</span>
          Save Order
        </BaseButton>
        <BaseButton @click="resetOrder" variant="secondary" class="flex-1">
          <span class="text-lg">↺</span>
          Reset to Default
        </BaseButton>
      </div>

      <div
        v-if="showSuccessMessage"
        class="mt-4 p-4 bg-green-100 text-green-900 rounded-lg text-sm font-medium border border-green-200"
      >
        <span class="text-lg mr-2">✓</span>Category order saved successfully!
      </div>
    </div>
  </div>
</template>
