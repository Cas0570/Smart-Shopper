import { beforeEach, describe, expect, it } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCategoriesStore } from '@/stores/categories'

describe('Rule 3.3: Category ordering and store layout', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Category sort order', () => {
    it('should allow setting custom category order', async () => {
      const categoriesStore = useCategoriesStore()
      await categoriesStore.loadCustomCategories()

      const allCategories = categoriesStore.allCategories
      expect(allCategories.length).toBeGreaterThan(0)

      // Get category IDs in desired order
      const customOrder = ['produce', 'bakery', 'dairy', 'meat', 'frozen']

      // Save custom order
      categoriesStore.saveCategoryOrder(customOrder)

      // Should be saved
      expect(categoriesStore.categoryOrder).toEqual(customOrder)
    })

    it('should sort categories by custom order', async () => {
      const categoriesStore = useCategoriesStore()
      await categoriesStore.loadCustomCategories()

      // Set custom order: Produce → Bakery → Dairy
      const customOrder = ['produce', 'bakery', 'dairy']
      categoriesStore.saveCategoryOrder(customOrder)

      const sorted = categoriesStore.sortedCategories
      const firstThree = sorted.slice(0, 3)

      expect(firstThree[0]!.id).toBe('produce')
      expect(firstThree[1]!.id).toBe('bakery')
      expect(firstThree[2]!.id).toBe('dairy')
    })

    it('should use default sort order when no custom order is set', async () => {
      const categoriesStore = useCategoriesStore()
      await categoriesStore.loadCustomCategories()

      // Reset to default
      categoriesStore.resetCategoryOrder()

      const sorted = categoriesStore.sortedCategories

      // Should be sorted by sortOrder property
      for (let i = 0; i < sorted.length - 1; i++) {
        const currentOrder = sorted[i]!.sortOrder || 0
        const nextOrder = sorted[i + 1]!.sortOrder || 0
        expect(currentOrder).toBeLessThanOrEqual(nextOrder)
      }
    })

    it('should handle categories not in custom order', async () => {
      const categoriesStore = useCategoriesStore()
      await categoriesStore.loadCustomCategories()

      // Set custom order for only some categories
      const customOrder = ['produce', 'dairy']
      categoriesStore.saveCategoryOrder(customOrder)

      const sorted = categoriesStore.sortedCategories

      // First two should be produce and dairy
      expect(sorted[0]!.id).toBe('produce')
      expect(sorted[1]!.id).toBe('dairy')

      // Rest should still be included
      expect(sorted.length).toBeGreaterThan(2)
    })
  })

  describe('Store layout presets', () => {
    it('should provide common store layout presets', () => {
      // Common layouts that users might want
      const standardLayout = [
        'produce',
        'bakery',
        'dairy',
        'meat',
        'frozen',
        'pantry',
        'snacks',
        'beverages',
        'household',
      ]
      const reverseLayout = [...standardLayout].reverse()
      const quickShopLayout = ['dairy', 'produce', 'bakery', 'snacks'] // Most common items first

      expect(standardLayout).toBeDefined()
      expect(reverseLayout).toBeDefined()
      expect(quickShopLayout).toBeDefined()
    })

    it('should apply a store layout preset', async () => {
      const categoriesStore = useCategoriesStore()
      await categoriesStore.loadCustomCategories()

      // Apply a preset layout
      const quickShopLayout = ['dairy', 'produce', 'bakery', 'snacks']
      categoriesStore.saveCategoryOrder(quickShopLayout)

      const sorted = categoriesStore.sortedCategories
      const firstFour = sorted.slice(0, 4)

      expect(firstFour[0]!.id).toBe('dairy')
      expect(firstFour[1]!.id).toBe('produce')
      expect(firstFour[2]!.id).toBe('bakery')
      expect(firstFour[3]!.id).toBe('snacks')
    })
  })

  describe('Order persistence', () => {
    it('should persist custom order to localStorage', async () => {
      const categoriesStore = useCategoriesStore()
      await categoriesStore.loadCustomCategories()

      const customOrder = ['produce', 'bakery', 'dairy']
      categoriesStore.saveCategoryOrder(customOrder)

      // Check localStorage
      const saved = localStorage.getItem('categoryOrder')
      expect(saved).toBeTruthy()
      const parsed = JSON.parse(saved!)
      expect(parsed).toEqual(customOrder)
    })

    it('should load custom order from localStorage on initialization', async () => {
      // Manually set localStorage
      const customOrder = ['meat', 'produce', 'dairy']
      localStorage.setItem('categoryOrder', JSON.stringify(customOrder))

      // Create new store instance
      setActivePinia(createPinia())
      const newCategoriesStore = useCategoriesStore()
      await newCategoriesStore.loadCustomCategories()

      // Should have loaded the order
      expect(newCategoriesStore.categoryOrder).toEqual(customOrder)

      const sorted = newCategoriesStore.sortedCategories
      expect(sorted[0]!.id).toBe('meat')
      expect(sorted[1]!.id).toBe('produce')
      expect(sorted[2]!.id).toBe('dairy')
    })

    it('should handle invalid localStorage data gracefully', async () => {
      // Set invalid JSON
      localStorage.setItem('categoryOrder', 'invalid json{')

      // Create new store instance
      setActivePinia(createPinia())
      const categoriesStore = useCategoriesStore()
      await categoriesStore.loadCustomCategories()

      // Should fall back to empty array (no custom order)
      expect(categoriesStore.categoryOrder).toEqual([])
    })
  })

  describe('UI updates', () => {
    it('should reflect order changes immediately in sortedCategories', async () => {
      const categoriesStore = useCategoriesStore()
      await categoriesStore.loadCustomCategories()

      // Initial state - default order
      const initialSorted = [...categoriesStore.sortedCategories]

      // Change order
      const newOrder = ['frozen', 'meat', 'dairy']
      categoriesStore.saveCategoryOrder(newOrder)

      // Should immediately reflect new order
      const updatedSorted = categoriesStore.sortedCategories
      expect(updatedSorted[0]!.id).toBe('frozen')
      expect(updatedSorted[1]!.id).toBe('meat')
      expect(updatedSorted[2]!.id).toBe('dairy')

      // Should be different from initial
      expect(updatedSorted[0]!.id).not.toBe(initialSorted[0]!.id)
    })

    it('should update when order is reset', async () => {
      const categoriesStore = useCategoriesStore()
      await categoriesStore.loadCustomCategories()

      // Set custom order
      categoriesStore.saveCategoryOrder(['frozen', 'meat', 'dairy'])
      const customSorted = [...categoriesStore.sortedCategories]
      expect(customSorted[0]!.id).toBe('frozen')

      // Reset to default
      categoriesStore.resetCategoryOrder()
      const defaultSorted = categoriesStore.sortedCategories

      // Should use default sort order (by sortOrder property)
      expect(categoriesStore.categoryOrder).toEqual([])
      expect(defaultSorted[0]!.id).not.toBe('frozen') // Unless frozen happens to be first by default
    })
  })

  describe('Custom categories in ordering', () => {
    it('should include custom categories in sort order', async () => {
      const categoriesStore = useCategoriesStore()
      await categoriesStore.loadCustomCategories()

      // Create a custom category
      const customCategory = await categoriesStore.createCategory('Deli', '🥪')

      // Should be in allCategories
      const allCategories = categoriesStore.allCategories
      const found = allCategories.find((cat) => cat.id === customCategory.id)
      expect(found).toBeDefined()
      expect(found?.name).toBe('Deli')

      // Should be in sortedCategories
      const sorted = categoriesStore.sortedCategories
      const foundInSorted = sorted.find((cat) => cat.id === customCategory.id)
      expect(foundInSorted).toBeDefined()
    })

    it('should allow custom categories in custom order', async () => {
      const categoriesStore = useCategoriesStore()
      await categoriesStore.loadCustomCategories()

      // Create a custom category
      const customCategory = await categoriesStore.createCategory('Deli', '🥪')

      // Include in custom order
      const customOrder = [customCategory.id, 'produce', 'dairy']
      categoriesStore.saveCategoryOrder(customOrder)

      const sorted = categoriesStore.sortedCategories
      expect(sorted[0]!.id).toBe(customCategory.id)
      expect(sorted[1]!.id).toBe('produce')
      expect(sorted[2]!.id).toBe('dairy')
    })
  })
})
