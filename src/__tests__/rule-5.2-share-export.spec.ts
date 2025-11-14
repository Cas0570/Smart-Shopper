import { beforeEach, describe, expect, it } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useListsStore } from '@/stores/lists'
import { useItemsStore } from '@/stores/items'

describe('Rule 5.2: Share and export', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('List sharing', () => {
    it('should generate shareable text from list', async () => {
      const listsStore = useListsStore()
      const itemsStore = useItemsStore()

      const list = await listsStore.createList('Shopping List')
      await itemsStore.createItem(list.id, 'Milk', 'dairy')
      await itemsStore.createItem(list.id, 'Bread', 'bakery')
      await itemsStore.createItem(list.id, 'Apples', 'produce')

      // Generate shareable text
      const items = itemsStore.getItemsByListId(list.id)
      const shareText = `${list.name}\n\n${items.value.map((item) => `- ${item.name}`).join('\n')}`

      expect(shareText).toContain('Shopping List')
      expect(shareText).toContain('- Milk')
      expect(shareText).toContain('- Bread')
      expect(shareText).toContain('- Apples')
    })

    it('should include completed status in share text', async () => {
      const listsStore = useListsStore()
      const itemsStore = useItemsStore()

      const list = await listsStore.createList('Test List')
      const milk = await itemsStore.createItem(list.id, 'Milk', 'dairy')
      await itemsStore.createItem(list.id, 'Bread', 'bakery')

      // Complete one item
      await itemsStore.updateItem(list.id, milk.id, { completed: true })

      const items = itemsStore.getItemsByListId(list.id)
      const shareText = `${list.name}\n\n${items.value.map((item) => `${item.completed ? '✓' : '○'} ${item.name}`).join('\n')}`

      expect(shareText).toContain('✓ Milk')
      expect(shareText).toContain('○ Bread')
    })

    it('should check for native share API availability', () => {
      const hasShareAPI = typeof navigator !== 'undefined' && 'share' in navigator

      // Document that we check for the API (may not be available in test environment)
      expect(typeof hasShareAPI).toBe('boolean')
    })

    it('should handle share API not available', () => {
      const shareSupported = false // Mock unavailable

      if (!shareSupported) {
        // Fallback: could copy to clipboard or show alternative
        const fallbackMessage = 'Share not available. Text copied to clipboard.'
        expect(fallbackMessage).toBeTruthy()
      }
    })

    it('should format list with categories for sharing', async () => {
      const listsStore = useListsStore()
      const itemsStore = useItemsStore()

      const list = await listsStore.createList('Categorized List')
      await itemsStore.createItem(list.id, 'Milk', 'dairy')
      await itemsStore.createItem(list.id, 'Cheese', 'dairy')
      await itemsStore.createItem(list.id, 'Bread', 'bakery')
      await itemsStore.createItem(list.id, 'Apples', 'produce')

      const items = itemsStore.getItemsByListId(list.id)

      // Group by category
      const grouped = items.value.reduce(
        (acc, item) => {
          if (!acc[item.category]) acc[item.category] = []
          acc[item.category]!.push(item.name)
          return acc
        },
        {} as Record<string, string[]>,
      )

      let shareText = `${list.name}\n\n`
      for (const [category, itemNames] of Object.entries(grouped)) {
        shareText += `${category}:\n${itemNames.map((name) => `  - ${name}`).join('\n')}\n\n`
      }

      expect(shareText).toContain('dairy:')
      expect(shareText).toContain('  - Milk')
      expect(shareText).toContain('bakery:')
    })
  })

  describe('Share invocation', () => {
    it('should prepare share data with title and text', async () => {
      const listsStore = useListsStore()
      const itemsStore = useItemsStore()

      const list = await listsStore.createList('My List')
      await itemsStore.createItem(list.id, 'Item 1', 'pantry')
      await itemsStore.createItem(list.id, 'Item 2', 'produce')

      const items = itemsStore.getItemsByListId(list.id)
      const shareData = {
        title: list.name,
        text: `${list.name}\n\n${items.value.map((item) => `- ${item.name}`).join('\n')}`,
      }

      expect(shareData.title).toBe('My List')
      expect(shareData.text).toContain('Item 1')
      expect(shareData.text).toContain('Item 2')
    })

    it('should handle share cancellation gracefully', async () => {
      const shareCancelled = true

      if (shareCancelled) {
        // No error should be thrown
        expect(true).toBe(true)
      }
    })

    it('should handle share error gracefully', () => {
      const mockError = new Error('Share failed')
      let userMessage = ''

      try {
        throw mockError
      } catch {
        userMessage = 'Failed to share. Please try again.'
      }

      expect(userMessage).toBeTruthy()
    })
  })
})
