import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useListsStore } from '@/stores/lists'
import { useItemsStore } from '@/stores/items'

describe('Rule 2.1: Offline access and edits', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Offline List Visibility', () => {
    it('should keep all items visible in store', async () => {
      const listsStore = useListsStore()
      const itemsStore = useItemsStore()

      // Load existing lists
      await listsStore.loadLists()

      // Create a list with 10 items
      const list = await listsStore.createList('Grocery Shopping')
      const listId = list.id

      // Add 10 items
      const itemPromises = []
      for (let i = 1; i <= 10; i++) {
        itemPromises.push(itemsStore.createItem(listId, `Item ${i}`, 'other'))
      }
      await Promise.all(itemPromises)

      // Load items for this list
      await itemsStore.loadItems(listId)

      // Verify all items are accessible from store (simulating offline access)
      const items = itemsStore.getItemsByListId(listId).value
      expect(items).toHaveLength(10)
      expect(items.every((item) => item.name.startsWith('Item'))).toBe(true)
    })

    it('should allow editing items through store', async () => {
      const listsStore = useListsStore()
      const itemsStore = useItemsStore()

      await listsStore.loadLists()

      const list = await listsStore.createList('Shopping List')
      const listId = list.id

      const item = await itemsStore.createItem(listId, 'Milk', 'dairy')
      await itemsStore.loadItems(listId)

      // Edit item (store persists to IndexedDB automatically)
      await itemsStore.updateItem(listId, item.id, { name: 'Whole Milk' })

      // Reload to verify persistence
      await itemsStore.loadItems(listId)
      const items = itemsStore.getItemsByListId(listId).value
      const updatedItem = items.find((i) => i.id === item.id)

      expect(updatedItem?.name).toBe('Whole Milk')
      expect(updatedItem?.category).toBe('dairy')
    })
  })

  describe('Offline Item Management', () => {
    it('should persist items added to store', async () => {
      const listsStore = useListsStore()
      const itemsStore = useItemsStore()

      await listsStore.loadLists()

      const list = await listsStore.createList('Offline List')
      const listId = list.id

      // Add 3 items
      const item1 = await itemsStore.createItem(listId, 'Bread', 'bakery')
      const item2 = await itemsStore.createItem(listId, 'Eggs', 'dairy')
      const item3 = await itemsStore.createItem(listId, 'Apples', 'produce')

      await itemsStore.loadItems(listId)

      // Items should be in the store
      const items = itemsStore.getItemsByListId(listId).value
      expect(items).toHaveLength(3)

      // Verify each item persisted
      const itemIds = [item1.id, item2.id, item3.id]
      itemIds.forEach((id) => {
        const item = items.find((i) => i.id === id)
        expect(item).toBeDefined()
      })
    })

    it('should persist checked-off items', async () => {
      const listsStore = useListsStore()
      const itemsStore = useItemsStore()

      await listsStore.loadLists()

      const list = await listsStore.createList('Shopping')
      const listId = list.id

      const item = await itemsStore.createItem(listId, 'Milk', 'dairy')
      await itemsStore.loadItems(listId)

      // Check off item
      await itemsStore.updateItem(listId, item.id, { completed: true })

      // Reload items
      await itemsStore.loadItems(listId)
      const items = itemsStore.getItemsByListId(listId).value
      const completedItem = items.find((i) => i.id === item.id)

      expect(completedItem?.completed).toBe(true)
    })

    it('should maintain changes across store instances', async () => {
      const listsStore = useListsStore()
      const itemsStore = useItemsStore()

      await listsStore.loadLists()

      const list = await listsStore.createList('Persistent List')
      const listId = list.id

      const item1 = await itemsStore.createItem(listId, 'Milk', 'dairy')
      const item2 = await itemsStore.createItem(listId, 'Bread', 'bakery')

      // Check off one item
      await itemsStore.updateItem(listId, item1.id, { completed: true })

      // Get current state
      await itemsStore.loadItems(listId)
      const originalItems = itemsStore.getItemsByListId(listId).value
      expect(originalItems).toHaveLength(2)

      // Create new store instances (simulating app reopen)
      const newListsStore = useListsStore()
      const newItemsStore = useItemsStore()

      await newListsStore.loadLists()
      await newItemsStore.loadItems(listId)

      // Data should persist from IndexedDB
      const restoredList = newListsStore.getListById(listId)
      expect(restoredList).toBeDefined()

      const restoredItems = newItemsStore.getItemsByListId(listId).value
      expect(restoredItems).toHaveLength(2)

      const restoredItem1 = restoredItems.find((i) => i.id === item1.id)
      const restoredItem2 = restoredItems.find((i) => i.id === item2.id)

      expect(restoredItem1?.completed).toBe(true)
      expect(restoredItem2?.completed).toBe(false)
    })
  })

  describe('Offline Data Storage', () => {
    it('should provide completed and total counts', async () => {
      const listsStore = useListsStore()
      const itemsStore = useItemsStore()

      await listsStore.loadLists()

      const list = await listsStore.createList('Count Test')
      const listId = list.id

      await itemsStore.createItem(listId, 'Item 1', 'other')
      await itemsStore.createItem(listId, 'Item 2', 'other')
      const item3 = await itemsStore.createItem(listId, 'Item 3', 'other')

      await itemsStore.loadItems(listId)

      // Check off one item
      await itemsStore.updateItem(listId, item3.id, { completed: true })
      await itemsStore.loadItems(listId)

      const totalCount = itemsStore.getTotalCount(listId)
      const completedCount = itemsStore.getCompletedCount(listId)

      expect(totalCount).toBe(3)
      expect(completedCount).toBe(1)
    })

    it('should handle empty lists', async () => {
      const listsStore = useListsStore()
      const itemsStore = useItemsStore()

      await listsStore.loadLists()

      const list = await listsStore.createList('Empty List')
      const listId = list.id

      await itemsStore.loadItems(listId)

      const items = itemsStore.getItemsByListId(listId).value
      expect(items).toEqual([])

      const totalCount = itemsStore.getTotalCount(listId)
      const completedCount = itemsStore.getCompletedCount(listId)

      expect(totalCount).toBe(0)
      expect(completedCount).toBe(0)
    })
  })
})
