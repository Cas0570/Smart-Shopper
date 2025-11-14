import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBackup } from '@/composables/useBackup'
import { useListsStore } from '@/stores/lists'
import { useItemsStore } from '@/stores/items'
import type { BackupData } from '@/composables/useBackup'

describe('Rule 2.3: Local backup and restore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Backup Export', () => {
    it('should export lists to backup data', async () => {
      const listsStore = useListsStore()
      const itemsStore = useItemsStore()
      const backup = useBackup()

      await listsStore.loadLists()

      // Create a list with items
      const list = await listsStore.createList('Grocery List')
      await itemsStore.createItem(list.id, 'Milk', 'dairy')
      await itemsStore.createItem(list.id, 'Bread', 'bakery')

      // Export backup
      const backupData = await backup.exportBackup()

      expect(backupData).toBeDefined()
      expect(backupData.version).toBeDefined()
      expect(backupData.timestamp).toBeGreaterThan(0)
      expect(backupData.lists).toBeDefined()
      expect(backupData.items).toBeDefined()
      expect(Array.isArray(backupData.lists)).toBe(true)
      expect(Array.isArray(backupData.items)).toBe(true)
    })

    it('should include all items in backup', async () => {
      const listsStore = useListsStore()
      const itemsStore = useItemsStore()
      const backup = useBackup()

      await listsStore.loadLists()

      const list = await listsStore.createList('Test List')
      await itemsStore.createItem(list.id, 'Item 1', 'other')
      await itemsStore.createItem(list.id, 'Item 2', 'other')
      await itemsStore.createItem(list.id, 'Item 3', 'other')

      const backupData = await backup.exportBackup()

      const exportedList = backupData.lists.find((l) => l.id === list.id)
      expect(exportedList).toBeDefined()

      const exportedItems = backupData.items.filter((i) => i.listId === list.id)
      expect(exportedItems).toHaveLength(3)
    })

    it('should preserve item categories in backup', async () => {
      const listsStore = useListsStore()
      const itemsStore = useItemsStore()
      const backup = useBackup()

      await listsStore.loadLists()

      const list = await listsStore.createList('Category Test')
      await itemsStore.createItem(list.id, 'Milk', 'dairy')
      await itemsStore.createItem(list.id, 'Apples', 'produce')
      await itemsStore.createItem(list.id, 'Bread', 'bakery')

      const backupData = await backup.exportBackup()

      const items = backupData.items.filter((i) => i.listId === list.id)
      expect(items.find((i) => i.name === 'Milk')?.category).toBe('dairy')
      expect(items.find((i) => i.name === 'Apples')?.category).toBe('produce')
      expect(items.find((i) => i.name === 'Bread')?.category).toBe('bakery')
    })

    it('should preserve completed state in backup', async () => {
      const listsStore = useListsStore()
      const itemsStore = useItemsStore()
      const backup = useBackup()

      await listsStore.loadLists()

      const list = await listsStore.createList('Completion Test')
      const item1 = await itemsStore.createItem(list.id, 'Completed Item', 'other')
      const item2 = await itemsStore.createItem(list.id, 'Incomplete Item', 'other')

      // Mark one as completed
      await itemsStore.updateItem(list.id, item1.id, { completed: true })
      await itemsStore.loadItems(list.id)

      const backupData = await backup.exportBackup()

      const items = backupData.items.filter((i) => i.listId === list.id)
      expect(items.find((i) => i.id === item1.id)?.completed).toBe(true)
      expect(items.find((i) => i.id === item2.id)?.completed).toBe(false)
    })
  })

  describe('Backup Validation', () => {
    it('should validate correct backup data', () => {
      const backup = useBackup()

      const validBackup: BackupData = {
        version: '1.0.0',
        timestamp: Date.now(),
        lists: [],
        items: [],
        customCategories: [],
        products: [],
        categoryPreferences: {},
        categoryOrder: [],
      }

      const result = backup.validateBackup(validBackup)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject invalid backup data', () => {
      const backup = useBackup()

      const invalidBackup = {
        // Missing required fields
        version: '1.0.0',
        // No timestamp, lists, items, etc.
      }

      const result = backup.validateBackup(invalidBackup)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should reject incompatible backup versions', () => {
      const backup = useBackup()

      const incompatibleBackup: BackupData = {
        version: '2.0.0', // Future version
        timestamp: Date.now(),
        lists: [],
        items: [],
        customCategories: [],
        products: [],
        categoryPreferences: {},
        categoryOrder: [],
      }

      const result = backup.validateBackup(incompatibleBackup)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('Incompatible'))).toBe(true)
    })

    it('should validate required fields', () => {
      const backup = useBackup()

      const result = backup.validateBackup(null)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('must be an object'))).toBe(true)
    })
  })

  describe('Backup Restore', () => {
    it('should restore lists from backup', async () => {
      const listsStore = useListsStore()
      const itemsStore = useItemsStore()
      const backup = useBackup()

      await listsStore.loadLists()

      // Create original data
      const originalList = await listsStore.createList('Original List')
      await itemsStore.createItem(originalList.id, 'Original Item', 'other')

      // Export backup
      const backupData = await backup.exportBackup()

      // Clear data
      await listsStore.deleteList(originalList.id)
      await listsStore.loadLists()
      expect(listsStore.lists).toHaveLength(0)

      // Restore from backup
      await backup.importBackup(backupData)

      // Verify restoration
      await listsStore.loadLists()
      expect(listsStore.lists.length).toBeGreaterThan(0)

      const restoredList = listsStore.lists.find((l) => l.name === 'Original List')
      expect(restoredList).toBeDefined()
    })

    it('should restore items with categories', async () => {
      const listsStore = useListsStore()
      const itemsStore = useItemsStore()
      const backup = useBackup()

      await listsStore.loadLists()

      // Create list with categorized items
      const list = await listsStore.createList('Categorized List')
      await itemsStore.createItem(list.id, 'Milk', 'dairy')
      await itemsStore.createItem(list.id, 'Bread', 'bakery')

      // Export backup
      const backupData = await backup.exportBackup()

      // Clear and restore
      await listsStore.deleteList(list.id)
      await backup.importBackup(backupData)

      // Verify items were restored with categories
      await listsStore.loadLists()
      const restoredList = listsStore.lists.find((l) => l.name === 'Categorized List')
      expect(restoredList).toBeDefined()

      await itemsStore.loadItems(restoredList!.id)
      const items = itemsStore.getItemsByListId(restoredList!.id).value

      expect(items.find((i) => i.name === 'Milk')?.category).toBe('dairy')
      expect(items.find((i) => i.name === 'Bread')?.category).toBe('bakery')
    })

    it('should restore completed state of items', async () => {
      const listsStore = useListsStore()
      const itemsStore = useItemsStore()
      const backup = useBackup()

      await listsStore.loadLists()

      // Create list with completed item
      const list = await listsStore.createList('Completion List')
      const item = await itemsStore.createItem(list.id, 'Completed Item', 'other')
      await itemsStore.updateItem(list.id, item.id, { completed: true })

      // Export, clear, restore
      const backupData = await backup.exportBackup()
      await listsStore.deleteList(list.id)
      await backup.importBackup(backupData)

      // Verify completed state
      await listsStore.loadLists()
      const restoredList = listsStore.lists.find((l) => l.name === 'Completion List')

      await itemsStore.loadItems(restoredList!.id)
      const items = itemsStore.getItemsByListId(restoredList!.id).value

      expect(items).toHaveLength(1)
      expect(items[0]?.completed).toBe(true)
    })

    it('should handle restore errors gracefully', async () => {
      const backup = useBackup()

      const invalidBackup = {
        version: '1.0.0',
        timestamp: Date.now(),
        // Missing required arrays
      } as unknown as BackupData

      await expect(backup.importBackup(invalidBackup)).rejects.toThrow()
    })
  })
})
