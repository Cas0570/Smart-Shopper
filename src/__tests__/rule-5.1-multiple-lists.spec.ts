import { beforeEach, describe, expect, it } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useListsStore } from '@/stores/lists'
import { useItemsStore } from '@/stores/items'

describe('Rule 5.1: Multiple lists CRUD', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Creating multiple lists', () => {
    it('should create two separate lists', async () => {
      const listsStore = useListsStore()

      const weekly = await listsStore.createList('Weekly')
      const party = await listsStore.createList('Party')

      expect(weekly.name).toBe('Weekly')
      expect(party.name).toBe('Party')
      expect(weekly.id).not.toBe(party.id)

      await listsStore.loadLists()
      expect(listsStore.lists.length).toBeGreaterThanOrEqual(2)
    })

    it('should create list with optional color', async () => {
      const listsStore = useListsStore()

      const list = await listsStore.createList('Colorful List', '#FF5733')
      expect(list.color).toBe('#FF5733')
    })

    it('should create multiple lists with different names', async () => {
      const listsStore = useListsStore()

      const names = ['Groceries', 'Hardware', 'Birthday', 'Vacation']
      const created = []

      for (const name of names) {
        created.push(await listsStore.createList(name))
      }

      expect(created).toHaveLength(4)
      created.forEach((list, i) => {
        expect(list.name).toBe(names[i])
      })
    })
  })

  describe('List isolation', () => {
    it('should keep items separate between lists', async () => {
      const listsStore = useListsStore()
      const itemsStore = useItemsStore()

      // Create two lists
      const weeklyList = await listsStore.createList('Weekly')
      const partyList = await listsStore.createList('Party')

      // Add items to Weekly
      await itemsStore.createItem(weeklyList.id, 'Milk', 'dairy')
      await itemsStore.createItem(weeklyList.id, 'Bread', 'bakery')

      // Add items to Party
      await itemsStore.createItem(partyList.id, 'Chips', 'snacks')
      await itemsStore.createItem(partyList.id, 'Soda', 'beverages')

      // Verify Weekly items
      const weeklyItems = itemsStore.getItemsByListId(weeklyList.id)
      expect(weeklyItems.value).toHaveLength(2)
      expect(weeklyItems.value.map((i) => i.name)).toContain('Milk')
      expect(weeklyItems.value.map((i) => i.name)).toContain('Bread')
      expect(weeklyItems.value.map((i) => i.name)).not.toContain('Chips')

      // Verify Party items
      const partyItems = itemsStore.getItemsByListId(partyList.id)
      expect(partyItems.value).toHaveLength(2)
      expect(partyItems.value.map((i) => i.name)).toContain('Chips')
      expect(partyItems.value.map((i) => i.name)).toContain('Soda')
      expect(partyItems.value.map((i) => i.name)).not.toContain('Milk')
    })

    it('should not affect other lists when modifying items', async () => {
      const listsStore = useListsStore()
      const itemsStore = useItemsStore()

      const list1 = await listsStore.createList('List 1')
      const list2 = await listsStore.createList('List 2')

      const item1 = await itemsStore.createItem(list1.id, 'Item 1', 'pantry')
      await itemsStore.createItem(list2.id, 'Item 2', 'produce')

      // Modify item in list 1
      await itemsStore.updateItem(list1.id, item1.id, { completed: true })

      // List 2 should be unaffected
      const list2Items = itemsStore.getItemsByListId(list2.id)
      expect(list2Items.value[0]!.completed).toBe(false)
    })

    it('should allow same item names in different lists', async () => {
      const listsStore = useListsStore()
      const itemsStore = useItemsStore()

      const list1 = await listsStore.createList('List 1')
      const list2 = await listsStore.createList('List 2')

      // Add "Milk" to both lists
      await itemsStore.createItem(list1.id, 'Milk', 'dairy')
      await itemsStore.createItem(list2.id, 'Milk', 'dairy')

      const list1Items = itemsStore.getItemsByListId(list1.id)
      const list2Items = itemsStore.getItemsByListId(list2.id)

      expect(list1Items.value).toHaveLength(1)
      expect(list2Items.value).toHaveLength(1)
      expect(list1Items.value[0]!.name).toBe('Milk')
      expect(list2Items.value[0]!.name).toBe('Milk')
      expect(list1Items.value[0]!.id).not.toBe(list2Items.value[0]!.id)
    })
  })

  describe('Archiving lists', () => {
    it('should archive a list', async () => {
      const listsStore = useListsStore()

      const list = await listsStore.createList('To Archive')
      expect(list.archived).toBe(false)

      await listsStore.archiveList(list.id)

      const archivedList = listsStore.getListById(list.id)
      expect(archivedList?.archived).toBe(true)
    })

    it('should move archived list to archived section', async () => {
      const listsStore = useListsStore()

      const list = await listsStore.createList('Archive Test')
      await listsStore.loadLists()

      const initialActive = listsStore.activeLists.length
      const initialArchived = listsStore.archivedLists.length

      await listsStore.archiveList(list.id)
      await listsStore.loadLists()

      expect(listsStore.activeLists.length).toBe(initialActive - 1)
      expect(listsStore.archivedLists.length).toBe(initialArchived + 1)
    })

    it('should not show archived list in active lists', async () => {
      const listsStore = useListsStore()

      const active = await listsStore.createList('Active List')
      const toArchive = await listsStore.createList('Will Archive')

      await listsStore.archiveList(toArchive.id)
      await listsStore.loadLists()

      const activeLists = listsStore.activeLists
      expect(activeLists.map((l) => l.id)).toContain(active.id)
      expect(activeLists.map((l) => l.id)).not.toContain(toArchive.id)
    })

    it('should preserve items when archiving list', async () => {
      const listsStore = useListsStore()
      const itemsStore = useItemsStore()

      const list = await listsStore.createList('With Items')
      await itemsStore.createItem(list.id, 'Item 1', 'pantry')
      await itemsStore.createItem(list.id, 'Item 2', 'produce')

      await listsStore.archiveList(list.id)

      // Items should still exist
      const items = itemsStore.getItemsByListId(list.id)
      expect(items.value).toHaveLength(2)
    })
  })

  describe('Unarchiving lists', () => {
    it('should unarchive a list', async () => {
      const listsStore = useListsStore()

      const list = await listsStore.createList('Test')
      await listsStore.archiveList(list.id)

      const archivedList = listsStore.getListById(list.id)
      expect(archivedList?.archived).toBe(true)

      await listsStore.unarchiveList(list.id)

      const unarchivedList = listsStore.getListById(list.id)
      expect(unarchivedList?.archived).toBe(false)
    })

    it('should move unarchived list back to active section', async () => {
      const listsStore = useListsStore()

      const list = await listsStore.createList('Unarchive Test')
      await listsStore.archiveList(list.id)
      await listsStore.loadLists()

      const archivedCount = listsStore.archivedLists.length
      const activeCount = listsStore.activeLists.length

      await listsStore.unarchiveList(list.id)
      await listsStore.loadLists()

      expect(listsStore.archivedLists.length).toBe(archivedCount - 1)
      expect(listsStore.activeLists.length).toBe(activeCount + 1)
    })
  })

  describe('Deleting lists', () => {
    it('should delete a list', async () => {
      const listsStore = useListsStore()

      const list = await listsStore.createList('To Delete')
      await listsStore.loadLists()

      const initialCount = listsStore.lists.length

      await listsStore.deleteList(list.id)
      await listsStore.loadLists()

      expect(listsStore.lists.length).toBe(initialCount - 1)
      expect(listsStore.getListById(list.id)).toBeUndefined()
    })

    it('should handle deleting list with items', async () => {
      const listsStore = useListsStore()
      const itemsStore = useItemsStore()

      const list = await listsStore.createList('Delete With Items')
      await itemsStore.createItem(list.id, 'Item 1', 'pantry')
      await itemsStore.createItem(list.id, 'Item 2', 'produce')

      const items = itemsStore.getItemsByListId(list.id)
      expect(items.value).toHaveLength(2)

      // Delete the list
      await listsStore.deleteList(list.id)

      // List should be gone
      expect(listsStore.getListById(list.id)).toBeUndefined()

      // Note: Items may or may not be cascade-deleted depending on implementation
      // This test just verifies the list is deleted successfully
    })
  })

  describe('Updating lists', () => {
    it('should update list name', async () => {
      const listsStore = useListsStore()

      const list = await listsStore.createList('Old Name')
      await listsStore.updateList(list.id, { name: 'New Name' })

      const updated = listsStore.getListById(list.id)
      expect(updated?.name).toBe('New Name')
    })

    it('should update list color', async () => {
      const listsStore = useListsStore()

      const list = await listsStore.createList('Color Test')
      await listsStore.updateList(list.id, { color: '#00FF00' })

      const updated = listsStore.getListById(list.id)
      expect(updated?.color).toBe('#00FF00')
    })

    it('should update multiple properties at once', async () => {
      const listsStore = useListsStore()

      const list = await listsStore.createList('Multi Update')
      await listsStore.updateList(list.id, {
        name: 'Updated Name',
        color: '#FF00FF',
      })

      const updated = listsStore.getListById(list.id)
      expect(updated?.name).toBe('Updated Name')
      expect(updated?.color).toBe('#FF00FF')
    })
  })

  describe('List persistence', () => {
    it('should persist lists across sessions', async () => {
      const listsStore = useListsStore()

      await listsStore.createList('Persistent List 1')
      await listsStore.createList('Persistent List 2')

      // Simulate app restart
      setActivePinia(createPinia())
      const newListsStore = useListsStore()
      await newListsStore.loadLists()

      expect(newListsStore.lists.length).toBeGreaterThanOrEqual(2)
      const names = newListsStore.lists.map((l) => l.name)
      expect(names).toContain('Persistent List 1')
      expect(names).toContain('Persistent List 2')
    })
  })
})
