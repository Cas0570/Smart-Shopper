import { ref } from 'vue'
import { usePreferencesStore } from '@/stores/preferences'
import { useCategoriesStore } from '@/stores/categories'
import { useItemsStore } from '@/stores/items'
import { useToastNotifications } from './useToastNotifications'

/**
 * Composable for managing category-related operations in list views
 * Handles category changes, category creation, and preference learning
 */
export function useListCategories(listId: string) {
  const preferencesStore = usePreferencesStore()
  const categoriesStore = useCategoriesStore()
  const itemsStore = useItemsStore()
  const toastStore = useToastNotifications()

  const showCreateCategory = ref(false)

  /**
   * Get the user's preferred category for an item name
   */
  const getPreferredCategory = (itemName: string) => {
    return preferencesStore.getPreferredCategory(itemName)
  }

  /**
   * Handle changing an item's category and save the preference
   * This will update ALL items with the same name across all lists
   */
  const handleChangeCategory = async (itemId: string, newCategory: string) => {
    try {
      const items = itemsStore.getItemsByListId(listId).value
      const item = items.find((i) => i.id === itemId)

      if (!item) return

      // Save the preference for future categorization
      await preferencesStore.savePreference(item.name, newCategory)

      // Update ALL items with the same name across all lists
      const count = await itemsStore.updateItemsByName(item.name, { category: newCategory })

      // Show toast notification
      const categoryName = categoriesStore.getCategoryDisplay(newCategory)
      if (count > 1) {
        toastStore.showSuccess(
          `Will remember "${item.name}" → ${categoryName} (${count} items updated)`,
        )
      } else {
        toastStore.showSuccess(`Will remember "${item.name}" → ${categoryName}`)
      }
    } catch (error) {
      console.error('Failed to change category:', error)
    }
  }

  /**
   * Open the create category dialog
   */
  const handleCreateCategoryRequest = () => {
    showCreateCategory.value = true
  }

  /**
   * Create a new custom category
   */
  const handleCreateCategory = async (name: string, icon: string) => {
    try {
      await categoriesStore.createCategory(name, icon)
      toastStore.showSuccess(`Created category "${name}" ${icon}`)
    } catch (error) {
      console.error('Failed to create category:', error)
    }
  }

  return {
    showCreateCategory,
    getPreferredCategory,
    handleChangeCategory,
    handleCreateCategoryRequest,
    handleCreateCategory,
  }
}
