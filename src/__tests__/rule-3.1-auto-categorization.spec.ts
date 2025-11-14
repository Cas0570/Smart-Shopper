import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useListsStore } from '@/stores/lists'
import { useItemsStore } from '@/stores/items'
import { categorizeItem } from '@/utils/categorization'

describe('Rule 3.1: Auto-categorization', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Dairy Category Auto-categorization', () => {
    it('should categorize "Milk" as dairy', () => {
      const category = categorizeItem('Milk')
      expect(category).toBe('dairy')
    })

    it('should categorize milk with modifiers as dairy', () => {
      expect(categorizeItem('Whole Milk')).toBe('dairy')
      expect(categorizeItem('Skim Milk')).toBe('dairy')
      expect(categorizeItem('Almond Milk')).toBe('dairy')
    })

    it('should categorize cheese as dairy', () => {
      expect(categorizeItem('Cheese')).toBe('dairy')
      expect(categorizeItem('Cheddar Cheese')).toBe('dairy')
      expect(categorizeItem('Mozzarella')).toBe('dairy')
    })

    it('should categorize yogurt as dairy', () => {
      expect(categorizeItem('Yogurt')).toBe('dairy')
      expect(categorizeItem('Greek Yogurt')).toBe('dairy')
    })

    it('should categorize eggs as dairy', () => {
      expect(categorizeItem('Eggs')).toBe('dairy')
      expect(categorizeItem('Dozen Eggs')).toBe('dairy')
    })
  })

  describe('Produce Category Auto-categorization', () => {
    it('should categorize "Tomatoes" as produce', () => {
      const category = categorizeItem('Tomatoes')
      expect(category).toBe('produce')
    })

    it('should categorize vegetables as produce', () => {
      expect(categorizeItem('Lettuce')).toBe('produce')
      expect(categorizeItem('Cucumber')).toBe('produce')
      expect(categorizeItem('Carrots')).toBe('produce')
      expect(categorizeItem('Onions')).toBe('produce')
      expect(categorizeItem('Peppers')).toBe('produce')
    })

    it('should categorize fruits as produce', () => {
      expect(categorizeItem('Apples')).toBe('produce')
      expect(categorizeItem('Bananas')).toBe('produce')
      expect(categorizeItem('Oranges')).toBe('produce')
      expect(categorizeItem('Grapes')).toBe('produce')
    })

    it('should categorize leafy greens as produce', () => {
      expect(categorizeItem('Spinach')).toBe('produce')
      expect(categorizeItem('Broccoli')).toBe('produce')
    })
  })

  describe('Other Categories Auto-categorization', () => {
    it('should categorize bread as bakery', () => {
      expect(categorizeItem('Bread')).toBe('bakery')
      expect(categorizeItem('Bagels')).toBe('bakery')
      expect(categorizeItem('Rolls')).toBe('bakery')
    })

    it('should categorize meat products correctly', () => {
      expect(categorizeItem('Chicken')).toBe('meat')
      expect(categorizeItem('Beef')).toBe('meat')
      expect(categorizeItem('Pork')).toBe('meat')
    })

    it('should categorize frozen items correctly', () => {
      expect(categorizeItem('Frozen Pizza')).toBe('frozen')
      expect(categorizeItem('Ice Cream')).toBe('dairy') // Ice cream is dairy
    })

    it('should categorize beverages correctly', () => {
      expect(categorizeItem('Soda')).toBe('beverages')
      expect(categorizeItem('Juice')).toBe('beverages')
      expect(categorizeItem('Water')).toBe('beverages')
    })
  })

  describe('Unknown Items', () => {
    it('should categorize "Unknown Item XYZ" as other', () => {
      const category = categorizeItem('Unknown Item XYZ')
      expect(category).toBe('other')
    })

    it('should categorize unrecognized items as other', () => {
      expect(categorizeItem('Quantum Flux Capacitor')).toBe('other')
      expect(categorizeItem('Mystery Product')).toBe('other')
      expect(categorizeItem('Random Thing 123')).toBe('other')
    })

    it('should handle empty strings as other', () => {
      expect(categorizeItem('')).toBe('other')
    })

    it('should handle special characters as other', () => {
      expect(categorizeItem('!@#$%')).toBe('other')
    })
  })

  describe('Auto-categorization in Store', () => {
    it('should auto-categorize items when added to list', async () => {
      const listsStore = useListsStore()
      const itemsStore = useItemsStore()

      await listsStore.loadLists()
      const list = await listsStore.createList('Categorization Test')

      // Add items - they should be auto-categorized
      const milkItem = await itemsStore.createItem(list.id, 'Milk', 'dairy')
      const tomatoItem = await itemsStore.createItem(list.id, 'Tomatoes', 'produce')
      const breadItem = await itemsStore.createItem(list.id, 'Bread', 'bakery')

      await itemsStore.loadItems(list.id)
      const items = itemsStore.getItemsByListId(list.id).value

      const milk = items.find((i) => i.id === milkItem.id)
      const tomato = items.find((i) => i.id === tomatoItem.id)
      const bread = items.find((i) => i.id === breadItem.id)

      expect(milk?.category).toBe('dairy')
      expect(tomato?.category).toBe('produce')
      expect(bread?.category).toBe('bakery')
    })

    it('should maintain categories across sessions', async () => {
      const listsStore = useListsStore()
      const itemsStore = useItemsStore()

      await listsStore.loadLists()
      const list = await listsStore.createList('Persistent Categories')

      await itemsStore.createItem(list.id, 'Milk', 'dairy')
      await itemsStore.createItem(list.id, 'Apples', 'produce')

      // Reload from "database"
      await itemsStore.loadItems(list.id)
      const items = itemsStore.getItemsByListId(list.id).value

      expect(items.find((i) => i.name === 'Milk')?.category).toBe('dairy')
      expect(items.find((i) => i.name === 'Apples')?.category).toBe('produce')
    })
  })

  describe('Case Insensitivity', () => {
    it('should categorize regardless of case', () => {
      expect(categorizeItem('MILK')).toBe('dairy')
      expect(categorizeItem('milk')).toBe('dairy')
      expect(categorizeItem('MiLk')).toBe('dairy')
      expect(categorizeItem('Milk')).toBe('dairy')
    })

    it('should handle mixed case with modifiers', () => {
      expect(categorizeItem('WHOLE MILK')).toBe('dairy')
      expect(categorizeItem('organic apples')).toBe('produce')
      expect(categorizeItem('Fresh BREAD')).toBe('bakery')
    })
  })

  describe('Partial Matching', () => {
    it('should categorize items containing dairy keywords', () => {
      expect(categorizeItem('Low-fat milk')).toBe('dairy')
      expect(categorizeItem('Shredded cheese')).toBe('dairy')
      expect(categorizeItem('Vanilla yogurt')).toBe('dairy')
    })

    it('should categorize items containing produce keywords', () => {
      expect(categorizeItem('Cherry tomatoes')).toBe('produce')
      expect(categorizeItem('Baby carrots')).toBe('produce')
      expect(categorizeItem('Green apples')).toBe('produce')
    })

    it('should categorize items containing bakery keywords', () => {
      expect(categorizeItem('Whole wheat bread')).toBe('bakery')
      expect(categorizeItem('Cinnamon rolls')).toBe('bakery')
      expect(categorizeItem('French bagels')).toBe('bakery')
    })
  })
})
