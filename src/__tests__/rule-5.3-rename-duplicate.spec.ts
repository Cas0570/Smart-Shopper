import { beforeEach, describe, expect, it } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useListsStore } from '@/stores/lists'
import { useItemsStore } from '@/stores/items'

describe('Rule 5.3: Rename and duplicate lists', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('List duplication', () => {
    it('should duplicate a list with new name', async () => {
      const listsStore = useListsStore()

      const original = await listsStore.createList('Weekly')
      const duplicated = await listsStore.duplicateList(original.id)

      expect(duplicated.name).toMatch(/Weekly.*copy/i)
      expect(duplicated.id).not.toBe(original.id)

      await listsStore.loadLists()
      expect(listsStore.lists.length).toBeGreaterThanOrEqual(2)
    })

    it('should create independent duplicate list', async () => {
      const listsStore = useListsStore()
      const itemsStore = useItemsStore()

      const original = await listsStore.createList('Original')
      await itemsStore.createItem(original.id, 'Item 1', 'dairy')
      await itemsStore.createItem(original.id, 'Item 2', 'produce')
      await itemsStore.createItem(original.id, 'Item 3', 'bakery')

      const originalItems = itemsStore.getItemsByListId(original.id)
      expect(originalItems.value).toHaveLength(3)

      const duplicated = await listsStore.duplicateList(original.id)

      // Duplicated list should be separate (may or may not have items copied)
      expect(duplicated.id).not.toBe(original.id)
      expect(duplicated.name).toMatch(/copy/i)

      // Original list should be unaffected
      const stillOriginalItems = itemsStore.getItemsByListId(original.id)
      expect(stillOriginalItems.value).toHaveLength(3)
    })

    it('should handle duplicating empty list', async () => {
      const listsStore = useListsStore()

      const original = await listsStore.createList('Empty List')
      const duplicated = await listsStore.duplicateList(original.id)

      expect(duplicated.id).not.toBe(original.id)
      expect(duplicated.name).toMatch(/Empty List.*copy/i)
    })

    it('should allow multiple duplications', async () => {
      const listsStore = useListsStore()

      const original = await listsStore.createList('Multi Dup')
      const dup1 = await listsStore.duplicateList(original.id)
      const dup2 = await listsStore.duplicateList(original.id)

      expect(dup1.id).not.toBe(original.id)
      expect(dup2.id).not.toBe(original.id)
      expect(dup1.id).not.toBe(dup2.id)
    })
  })

  describe('List renaming', () => {
    it('should rename a list', async () => {
      const listsStore = useListsStore()

      const list = await listsStore.createList('Party')
      expect(list.name).toBe('Party')

      await listsStore.updateList(list.id, { name: 'Birthday Party' })

      const renamed = listsStore.getListById(list.id)
      expect(renamed?.name).toBe('Birthday Party')
    })

    it('should persist renamed list', async () => {
      const listsStore = useListsStore()

      const list = await listsStore.createList('Old Name')
      await listsStore.updateList(list.id, { name: 'New Name' })

      // Simulate app restart
      setActivePinia(createPinia())
      const newListsStore = useListsStore()
      await newListsStore.loadLists()

      const found = newListsStore.lists.find((l) => l.id === list.id)
      expect(found?.name).toBe('New Name')
    })

    it('should reflect renamed list in home view', async () => {
      const listsStore = useListsStore()

      await listsStore.createList('List A')
      const listB = await listsStore.createList('List B')
      await listsStore.createList('List C')

      await listsStore.updateList(listB.id, { name: 'Renamed B' })
      await listsStore.loadLists()

      const allNames = listsStore.lists.map((l) => l.name)
      expect(allNames).toContain('Renamed B')
      expect(allNames).not.toContain('List B')
    })

    it('should allow renaming to same name', async () => {
      const listsStore = useListsStore()

      const list = await listsStore.createList('Same Name')
      await listsStore.updateList(list.id, { name: 'Same Name' })

      const updated = listsStore.getListById(list.id)
      expect(updated?.name).toBe('Same Name')
    })

    it('should allow duplicate names across lists', async () => {
      const listsStore = useListsStore()

      const list1 = await listsStore.createList('Shopping')
      const list2 = await listsStore.createList('Weekly Shopping')
      await listsStore.updateList(list2.id, { name: 'Shopping' })

      const lists = [listsStore.getListById(list1.id), listsStore.getListById(list2.id)]

      expect(lists[0]?.name).toBe('Shopping')
      expect(lists[1]?.name).toBe('Shopping')
      expect(lists[0]?.id).not.toBe(lists[1]?.id)
    })
  })

  describe('Combined operations', () => {
    it('should allow renaming a duplicated list', async () => {
      const listsStore = useListsStore()

      const original = await listsStore.createList('Original')
      const duplicated = await listsStore.duplicateList(original.id)

      expect(duplicated.name).toMatch(/copy/i)

      await listsStore.updateList(duplicated.id, { name: 'Custom Name' })

      const renamed = listsStore.getListById(duplicated.id)
      expect(renamed?.name).toBe('Custom Name')
    })

    it('should allow duplicating a renamed list', async () => {
      const listsStore = useListsStore()

      const original = await listsStore.createList('First')
      await listsStore.updateList(original.id, { name: 'Renamed' })

      const duplicated = await listsStore.duplicateList(original.id)
      expect(duplicated.name).toMatch(/Renamed.*copy/i)
    })
  })
})
