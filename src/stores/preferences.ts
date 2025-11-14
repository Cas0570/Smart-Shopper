import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db, type CategoryPreference } from '@/db'

/**
 * Store for user category preferences and learning
 * Tracks manual category overrides to improve auto-categorization
 */
export const usePreferencesStore = defineStore('preferences', () => {
  // State
  const preferences = ref<Map<string, string>>(new Map())
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Normalize item name for consistent lookups
   */
  const normalizeItemName = (name: string): string => {
    return name.toLowerCase().trim()
  }

  /**
   * Load all category preferences from database
   */
  const loadPreferences = async () => {
    loading.value = true
    error.value = null
    try {
      const prefs = await db.categoryPreferences.toArray()
      preferences.value.clear()
      prefs.forEach((pref) => {
        preferences.value.set(pref.itemName, pref.category)
      })
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load preferences'
      console.error('Failed to load category preferences:', e)
    } finally {
      loading.value = false
    }
  }

  /**
   * Get preferred category for an item name
   * @param itemName - The item name to look up
   * @returns The preferred category, or null if none exists
   */
  const getPreferredCategory = (itemName: string): string | null => {
    const normalized = normalizeItemName(itemName)
    return preferences.value.get(normalized) || null
  }

  /**
   * Save a category preference for an item
   * @param itemName - The item name
   * @param category - The preferred category
   */
  const savePreference = async (itemName: string, category: string) => {
    loading.value = true
    error.value = null
    try {
      const normalized = normalizeItemName(itemName)
      const preference: CategoryPreference = {
        itemName: normalized,
        category,
        learnedAt: Date.now(),
      }

      await db.categoryPreferences.put(preference)
      preferences.value.set(normalized, category)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to save preference'
      console.error('Failed to save category preference:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Remove a category preference
   * @param itemName - The item name to remove preference for
   */
  const removePreference = async (itemName: string) => {
    loading.value = true
    error.value = null
    try {
      const normalized = normalizeItemName(itemName)
      await db.categoryPreferences.delete(normalized)
      preferences.value.delete(normalized)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to remove preference'
      console.error('Failed to remove category preference:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Clear all category preferences
   */
  const clearAll = async () => {
    loading.value = true
    error.value = null
    try {
      await db.categoryPreferences.clear()
      preferences.value.clear()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to clear preferences'
      console.error('Failed to clear category preferences:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    preferences,
    loading,
    error,
    // Actions
    loadPreferences,
    getPreferredCategory,
    savePreference,
    removePreference,
    clearAll,
  }
})
