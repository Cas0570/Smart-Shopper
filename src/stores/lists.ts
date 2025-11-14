import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useListsDB } from '@/composables/useDB'
import type { ShoppingList } from '@/db'

export const useListsStore = defineStore('lists', () => {
  const listsDB = useListsDB()

  // State
  const lists = ref<ShoppingList[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activeLists = computed(() => lists.value.filter((list) => !list.archived))
  const archivedLists = computed(() => lists.value.filter((list) => list.archived))

  const getListById = (id: string) => {
    return lists.value.find((list) => list.id === id)
  }

  // Actions
  const loadLists = async () => {
    loading.value = true
    error.value = null
    try {
      lists.value = await listsDB.getAll()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load lists'
      console.error('Failed to load lists:', e)
    } finally {
      loading.value = false
    }
  }

  const createList = async (name: string, color?: string) => {
    loading.value = true
    error.value = null
    try {
      const list = await listsDB.create(name, color)
      lists.value.push(list)
      return list
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create list'
      console.error('Failed to create list:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateList = async (id: string, updates: Partial<ShoppingList>) => {
    loading.value = true
    error.value = null
    try {
      await listsDB.update(id, updates)
      const list = lists.value.find((l) => l.id === id)
      if (list) {
        Object.assign(list, updates, { updatedAt: Date.now() })
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update list'
      console.error('Failed to update list:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const renameList = async (id: string, name: string, color?: string) => {
    const updates: Partial<{ name: string; color: string }> = { name }
    if (color) {
      updates.color = color
    }
    await updateList(id, updates)
  }

  const archiveList = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      await listsDB.archive(id)
      const list = lists.value.find((l) => l.id === id)
      if (list) {
        list.archived = true
        list.updatedAt = Date.now()
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to archive list'
      console.error('Failed to archive list:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const unarchiveList = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      await listsDB.unarchive(id)
      const list = lists.value.find((l) => l.id === id)
      if (list) {
        list.archived = false
        list.updatedAt = Date.now()
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to unarchive list'
      console.error('Failed to unarchive list:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteList = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      await listsDB.remove(id)
      lists.value = lists.value.filter((list) => list.id !== id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete list'
      console.error('Failed to delete list:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const duplicateList = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const newList = await listsDB.duplicate(id)
      lists.value.push(newList)
      return newList
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to duplicate list'
      console.error('Failed to duplicate list:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    lists,
    loading,
    error,
    // Getters
    activeLists,
    archivedLists,
    getListById,
    // Actions
    loadLists,
    createList,
    updateList,
    renameList,
    archiveList,
    unarchiveList,
    deleteList,
    duplicateList,
  }
})
