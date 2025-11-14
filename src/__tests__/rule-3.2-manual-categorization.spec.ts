import { beforeEach, describe, expect, it } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useListsStore } from '@/stores/lists'
import { useItemsStore } from '@/stores/items'
import { usePreferencesStore } from '@/stores/preferences'
import { categorizeItem } from '@/utils/categorization'

describe('Rule 3.2: Manual categorization and learning', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Manual category override', () => {
    it('should allow moving an item to a different category', async () => {
      const listsStore = useListsStore()
      const itemsStore = useItemsStore()

      // Create a list and add milk (auto-categorized as dairy)
      const list = await listsStore.createList('Shopping')
      const item = await itemsStore.createItem(list.id, 'Milk', 'dairy')

      // Should auto-categorize as dairy
      expect(item.category).toBe('dairy')

      // User manually changes category to beverages
      await itemsStore.updateItem(list.id, item.id, { category: 'beverages' })

      const listItems = itemsStore.getItemsByListId(list.id)
      const updatedItem = listItems.value.find((i) => i.id === item.id)
      expect(updatedItem?.category).toBe('beverages')
    })

    it('should allow user to manually set category on creation', async () => {
      const listsStore = useListsStore()
      const itemsStore = useItemsStore()

      const list = await listsStore.createList('Shopping')

      // User creates item with explicit category (overriding auto-categorization)
      const item = await itemsStore.createItem(list.id, 'Milk', 'beverages')

      expect(item.category).toBe('beverages')
    })
  })

  describe('Learning user preferences', () => {
    it('should save user category preference for future use', async () => {
      const listsStore = useListsStore()
      const itemsStore = useItemsStore()
      const preferencesStore = usePreferencesStore()

      const list = await listsStore.createList('Shopping')

      // First time: User adds Milk and manually changes category to beverages
      const item1 = await itemsStore.createItem(list.id, 'Milk', 'dairy')
      await itemsStore.updateItem(list.id, item1.id, { category: 'beverages' })

      // Save this preference
      await preferencesStore.savePreference('milk', 'beverages')

      // Later: User adds milk again
      const preference = preferencesStore.getPreferredCategory('milk')
      expect(preference).toBe('beverages')

      // Should use saved preference
      const result = categorizeItem('Milk', preference)
      expect(result).toBe('beverages')
    })

    it('should use saved preferences for exact matches', async () => {
      const preferencesStore = usePreferencesStore()

      // User prefers yogurt in beverages (not typical)
      await preferencesStore.savePreference('yogurt', 'beverages')

      // Should return user preference
      const preference = preferencesStore.getPreferredCategory('yogurt')
      expect(preference).toBe('beverages')
      expect(categorizeItem('Yogurt', preference)).toBe('beverages')
    })

    it('should handle case-insensitive preference lookups', async () => {
      const preferencesStore = usePreferencesStore()

      await preferencesStore.savePreference('milk', 'beverages')

      // Should work regardless of case
      expect(preferencesStore.getPreferredCategory('Milk')).toBe('beverages')
      expect(preferencesStore.getPreferredCategory('MILK')).toBe('beverages')
      expect(preferencesStore.getPreferredCategory('milk')).toBe('beverages')
    })

    it('should return null for items without saved preferences', async () => {
      const preferencesStore = usePreferencesStore()

      // No preference set for this item
      const preference = preferencesStore.getPreferredCategory('Unknown Product')
      expect(preference).toBeNull()
    })
  })

  describe('Preference persistence', () => {
    it('should persist preferences in IndexedDB', async () => {
      const preferencesStore = usePreferencesStore()

      // Set preference
      await preferencesStore.savePreference('milk', 'beverages')

      // Should be retrievable
      const preference = preferencesStore.getPreferredCategory('milk')
      expect(preference).toBe('beverages')
    })

    it('should load preferences from IndexedDB on initialization', async () => {
      const preferencesStore = usePreferencesStore()

      // Set some preferences
      await preferencesStore.savePreference('milk', 'beverages')
      await preferencesStore.savePreference('eggs', 'bakery')

      // Create new store instance and load
      setActivePinia(createPinia())
      const newPreferencesStore = usePreferencesStore()
      await newPreferencesStore.loadPreferences()

      // Should have loaded preferences
      expect(newPreferencesStore.getPreferredCategory('milk')).toBe('beverages')
      expect(newPreferencesStore.getPreferredCategory('eggs')).toBe('bakery')
    })

    it('should allow updating existing preferences', async () => {
      const preferencesStore = usePreferencesStore()

      // Initial preference
      await preferencesStore.savePreference('milk', 'beverages')
      expect(preferencesStore.getPreferredCategory('milk')).toBe('beverages')

      // Change preference
      await preferencesStore.savePreference('milk', 'dairy')
      expect(preferencesStore.getPreferredCategory('milk')).toBe('dairy')
    })

    it('should allow removing preferences', async () => {
      const preferencesStore = usePreferencesStore()

      // Set then remove
      await preferencesStore.savePreference('milk', 'beverages')
      expect(preferencesStore.getPreferredCategory('milk')).toBe('beverages')

      await preferencesStore.removePreference('milk')
      expect(preferencesStore.getPreferredCategory('milk')).toBeNull()
    })
  })

  describe('Auto-categorization fallback', () => {
    it('should use auto-categorization when no preference exists', () => {
      const preferencesStore = usePreferencesStore()

      // No preference for tomatoes
      const preference = preferencesStore.getPreferredCategory('tomatoes')
      expect(preference).toBeNull()

      // Should fall back to auto-categorization
      const category = categorizeItem('Tomatoes', preference)
      expect(category).toBe('produce')
    })

    it('should prefer user preference over auto-categorization', async () => {
      const preferencesStore = usePreferencesStore()

      // User prefers eggs in bakery (unusual but valid)
      await preferencesStore.savePreference('eggs', 'bakery')
      const preference = preferencesStore.getPreferredCategory('eggs')

      // Should use preference, not auto-categorization
      const category = categorizeItem('Eggs', preference)
      expect(category).toBe('bakery')

      // Without preference, would be dairy
      const autoCategory = categorizeItem('Eggs', null)
      expect(autoCategory).toBe('dairy')
    })
  })
})
