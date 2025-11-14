import type { ShoppingList, ShoppingItem } from '@/db'

/**
 * Composable for sharing and exporting lists
 */
export function useShare() {
  /**
   * Format a shopping list as plain text
   */
  const formatListAsText = (list: ShoppingList, items: ShoppingItem[]): string => {
    let text = `${list.name}\n`
    text += `${'='.repeat(list.name.length)}\n\n`

    // Group items by category
    const itemsByCategory: Record<string, ShoppingItem[]> = {}
    items.forEach((item) => {
      if (!itemsByCategory[item.category]) {
        itemsByCategory[item.category] = []
      }
      itemsByCategory[item.category]!.push(item)
    })

    // Sort categories
    const categories = Object.keys(itemsByCategory).sort()

    // Format items by category
    categories.forEach((category) => {
      const categoryItems = itemsByCategory[category]!
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1)
      text += `${categoryName}:\n`

      categoryItems.forEach((item) => {
        const checkbox = item.completed ? '☑' : '☐'
        const quantity = item.quantity && item.quantity > 1 ? ` (${item.quantity})` : ''
        text += `  ${checkbox} ${item.name}${quantity}\n`
      })
      text += '\n'
    })

    // Add summary
    const completedCount = items.filter((i) => i.completed).length
    text += `\n---\n`
    text += `Total: ${items.length} items\n`
    text += `Completed: ${completedCount}/${items.length}\n`

    return text
  }

  /**
   * Share a list using Web Share API or fallback to clipboard
   */
  const shareList = async (list: ShoppingList, items: ShoppingItem[]): Promise<boolean> => {
    const text = formatListAsText(list, items)

    // Try Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: list.name,
          text: text,
        })
        return true
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name === 'AbortError') {
          return false
        }
        // Fall through to clipboard
        console.warn('Share API failed, falling back to clipboard:', error)
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      return false
    }
  }

  /**
   * Export a list as JSON
   */
  const exportListAsJSON = (list: ShoppingList, items: ShoppingItem[]): string => {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      list,
      items,
    }
    return JSON.stringify(exportData, null, 2)
  }

  /**
   * Download JSON file
   */
  const downloadJSON = (filename: string, content: string): void => {
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Import a list from JSON
   */
  const importListFromJSON = async (
    jsonContent: string,
  ): Promise<{ list: ShoppingList; items: ShoppingItem[] }> => {
    try {
      const data = JSON.parse(jsonContent)

      if (!data.version || !data.list || !data.items) {
        throw new Error('Invalid JSON format')
      }

      return {
        list: data.list,
        items: data.items,
      }
    } catch (error) {
      console.error('Failed to parse JSON:', error)
      throw new Error('Invalid JSON file')
    }
  }

  return {
    formatListAsText,
    shareList,
    exportListAsJSON,
    downloadJSON,
    importListFromJSON,
  }
}
