import { describe, it, expect } from 'vitest'
import { parseItemsFromText, sanitizeItemName, categorizeItem } from '@/utils/categorization'

describe('Rule 1.4: Error handling for quick entry', () => {
  describe('Speech Recognition Error Handling', () => {
    it('should handle empty speech results', () => {
      const emptyInput = ''
      const items = parseItemsFromText(emptyInput)

      expect(items).toEqual([])
    })

    it('should handle speech with only whitespace', () => {
      const whitespaceInput = '   \n\t   '
      const items = parseItemsFromText(whitespaceInput)

      expect(items).toEqual([])
    })

    it('should handle speech with unclear words (gibberish)', () => {
      // Speech recognition might return unclear results as a single string
      const unclearInput = 'uh um er mmm'
      const items = parseItemsFromText(unclearInput)

      // Parser treats space-separated words as single item (no comma/newline separator)
      // Should still return something (user can delete if wrong)
      expect(items).toHaveLength(1)
      expect(items[0]).toBe('uh um er mmm')
    })
  })

  describe('Malformed Text Input Handling', () => {
    it('should handle text with excessive commas', () => {
      const malformedInput = 'milk,,,,bread,,,eggs'
      const items = parseItemsFromText(malformedInput)

      // Should skip empty strings from multiple commas
      expect(items).toEqual(['milk', 'bread', 'eggs'])
    })

    it('should handle text with mixed separators', () => {
      const mixedInput = 'apples, oranges\nbananas and grapes,strawberries'
      const items = parseItemsFromText(mixedInput)

      expect(items).toContain('apples')
      expect(items).toContain('oranges')
      expect(items).toContain('bananas')
      expect(items).toContain('grapes')
      expect(items).toContain('strawberries')
      expect(items).toHaveLength(5)
    })

    it('should handle text with special characters', () => {
      const specialInput = 'milk@bread#eggs$cheese'
      const items = parseItemsFromText(specialInput)

      // Special chars might break parsing, but should not crash
      expect(Array.isArray(items)).toBe(true)
    })

    it('should handle extremely long item names', () => {
      const longName = 'a'.repeat(1000)
      const sanitized = sanitizeItemName(longName)

      // Should truncate or handle gracefully
      expect(sanitized.length).toBeGreaterThan(0)
      expect(sanitized.length).toBeLessThanOrEqual(1000)
    })
  })

  describe('Input Sanitization', () => {
    it('should remove leading/trailing whitespace from items', () => {
      const sanitized = sanitizeItemName('  milk  ')

      expect(sanitized).toBe('milk')
    })

    it('should collapse multiple spaces within item names', () => {
      const sanitized = sanitizeItemName('whole    milk')

      expect(sanitized).toBe('whole milk')
    })

    it('should handle items with only special characters', () => {
      const sanitized = sanitizeItemName('!@#$%')

      // Should either remove or keep special chars gracefully
      expect(typeof sanitized).toBe('string')
    })

    it('should handle mixed case input consistently', () => {
      const upperItem = categorizeItem('MILK')
      const lowerItem = categorizeItem('milk')
      const mixedItem = categorizeItem('MiLk')

      // Categorization should be case-insensitive
      expect(upperItem).toBe(lowerItem)
      expect(lowerItem).toBe(mixedItem)
      expect(upperItem).toBe('dairy')
    })
  })

  describe('Categorization Fallback', () => {
    it('should assign "other" category to unknown items', () => {
      const unknownCategory = categorizeItem('quantum-flux-capacitor')

      expect(unknownCategory).toBe('other')
    })

    it('should handle empty string categorization', () => {
      const emptyCategory = categorizeItem('')

      expect(emptyCategory).toBe('other')
    })

    it('should handle numeric item names', () => {
      const numericCategory = categorizeItem('12345')

      expect(numericCategory).toBe('other')
    })
  })
})
