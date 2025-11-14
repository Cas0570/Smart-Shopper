import { describe, it, expect } from 'vitest'
import { parseItemsFromText, categorizeItem, sanitizeItemName } from '@/utils/categorization'

describe('Rule 1.2: Quick text entry', () => {
  describe('parseItemsFromText', () => {
    it('should parse comma-separated items', () => {
      const result = parseItemsFromText('milk, bread, eggs')

      expect(result).toHaveLength(3)
      expect(result[0]).toBe('milk')
      expect(result[1]).toBe('bread')
      expect(result[2]).toBe('eggs')
    })

    it('should handle items with "and" separator', () => {
      const result = parseItemsFromText('apples, oranges and bananas')

      expect(result).toHaveLength(3)
      expect(result).toContain('apples')
      expect(result).toContain('oranges')
      expect(result).toContain('bananas')
    })

    it('should handle newline-separated items', () => {
      const result = parseItemsFromText('milk\nbread\neggs')

      expect(result).toHaveLength(3)
      expect(result[0]).toBe('milk')
      expect(result[1]).toBe('bread')
      expect(result[2]).toBe('eggs')
    })

    it('should handle empty input gracefully', () => {
      const result = parseItemsFromText('')
      expect(result).toHaveLength(0)
    })

    it('should trim whitespace from items', () => {
      const result = parseItemsFromText('  milk  ,  bread  ')

      expect(result[0]).toBe('milk')
      expect(result[1]).toBe('bread')
    })
  })

  describe('sanitizeItemName', () => {
    it('should trim whitespace', () => {
      expect(sanitizeItemName('  eggs  ')).toBe('eggs')
      expect(sanitizeItemName('  milk and bread  ')).toBe('milk and bread')
    })

    it('should collapse multiple spaces', () => {
      expect(sanitizeItemName('milk    bread')).toBe('milk bread')
    })

    it('should handle empty strings', () => {
      expect(sanitizeItemName('')).toBe('')
      expect(sanitizeItemName('   ')).toBe('')
    })
  })

  describe('categorizeItem', () => {
    it('should categorize dairy products', () => {
      expect(categorizeItem('Milk')).toBe('dairy')
      expect(categorizeItem('Cheese')).toBe('dairy')
      expect(categorizeItem('Yogurt')).toBe('dairy')
    })

    it('should categorize bakery items', () => {
      expect(categorizeItem('Bread')).toBe('bakery')
      expect(categorizeItem('Bagels')).toBe('bakery')
    })

    it('should categorize produce', () => {
      expect(categorizeItem('Apples')).toBe('produce')
      expect(categorizeItem('Bananas')).toBe('produce')
      expect(categorizeItem('Carrots')).toBe('produce')
    })

    it('should handle unknown items', () => {
      const category = categorizeItem('Unknown Item XYZ')
      expect(category).toBe('other')
    })

    it('should be case-insensitive', () => {
      expect(categorizeItem('MILK')).toBe('dairy')
      expect(categorizeItem('milk')).toBe('dairy')
      expect(categorizeItem('MiLk')).toBe('dairy')
    })
  })
})
