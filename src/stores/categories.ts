import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db, type Category } from '@/db'
import { CATEGORIES as DEFAULT_CATEGORIES } from '@/constants/categories'

/**
 * Store for managing shopping categories (default + custom)
 */
export const useCategoriesStore = defineStore('categories', () => {
  // State
  const customCategories = ref<Category[]>([])
  const categoryOrder = ref<string[]>([]) // Custom order of category IDs
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters - combine default and custom categories
  const allCategories = computed(() => {
    return [...DEFAULT_CATEGORIES, ...customCategories.value]
  })

  /**
   * Get all categories sorted by custom order (if set) or default sortOrder
   */
  const sortedCategories = computed(() => {
    if (categoryOrder.value.length === 0) {
      // No custom order, use default sortOrder
      return [...allCategories.value].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    }

    // Sort by custom order
    const orderMap = new Map(categoryOrder.value.map((id, index) => [id, index]))
    return [...allCategories.value].sort((a, b) => {
      const orderA = orderMap.get(a.id) ?? 9999
      const orderB = orderMap.get(b.id) ?? 9999
      return orderA - orderB
    })
  })

  const getCategoryById = (id: string) => {
    return allCategories.value.find((cat) => cat.id === id)
  }

  const getCategoryDisplay = (categoryId: string): string => {
    const category = getCategoryById(categoryId)
    if (!category) {
      // Fallback to 'Other' if category not found
      const otherCat = getCategoryById('other')
      return otherCat ? `${otherCat.icon} ${otherCat.name}` : '📦 Other'
    }
    return `${category.icon} ${category.name}`
  }

  /**
   * Load custom categories from database
   */
  const loadCustomCategories = async () => {
    loading.value = true
    error.value = null
    try {
      const categories = await db.categories.toArray()
      // Sort by sortOrder
      customCategories.value = categories.sort((a, b) => a.sortOrder - b.sortOrder)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load custom categories'
      console.error('Failed to load custom categories:', e)
    } finally {
      loading.value = false
    }

    // Load custom category order from localStorage (outside try-catch to always run)
    const savedOrder = localStorage.getItem('categoryOrder')
    if (savedOrder) {
      try {
        categoryOrder.value = JSON.parse(savedOrder)
      } catch {
        // Invalid JSON, ignore
        categoryOrder.value = []
      }
    }
  }

  /**
   * Save custom category order
   */
  const saveCategoryOrder = (newOrder: string[]) => {
    categoryOrder.value = newOrder
    localStorage.setItem('categoryOrder', JSON.stringify(newOrder))
  }

  /**
   * Reset category order to default
   */
  const resetCategoryOrder = () => {
    categoryOrder.value = []
    localStorage.removeItem('categoryOrder')
  }

  /**
   * Create a new custom category
   */
  const createCategory = async (name: string, icon: string) => {
    loading.value = true
    error.value = null
    try {
      // Generate ID from name (lowercase, no spaces)
      const id = `custom_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`

      // Get the highest sortOrder and add 1
      const maxSortOrder = Math.max(
        ...allCategories.value.map((cat) => cat.sortOrder || 0),
        DEFAULT_CATEGORIES.length,
      )

      const category: Category = {
        id,
        name,
        icon,
        sortOrder: maxSortOrder + 1,
      }

      await db.categories.add(category)
      customCategories.value.push(category)

      return category
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create category'
      console.error('Failed to create category:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Update an existing custom category
   */
  const updateCategory = async (id: string, updates: Partial<Category>) => {
    loading.value = true
    error.value = null
    try {
      await db.categories.update(id, updates)
      const category = customCategories.value.find((cat) => cat.id === id)
      if (category) {
        Object.assign(category, updates)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update category'
      console.error('Failed to update category:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete a custom category
   */
  const deleteCategory = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      await db.categories.delete(id)
      customCategories.value = customCategories.value.filter((cat) => cat.id !== id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete category'
      console.error('Failed to delete category:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    customCategories,
    categoryOrder,
    loading,
    error,
    // Getters
    allCategories,
    sortedCategories,
    getCategoryById,
    getCategoryDisplay,
    // Actions
    loadCustomCategories,
    saveCategoryOrder,
    resetCategoryOrder,
    createCategory,
    updateCategory,
    deleteCategory,
  }
})
