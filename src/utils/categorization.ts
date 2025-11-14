/**
 * Auto-categorization utility
 * Maps item names to categories based on keywords
 */

const categoryKeywords: Record<string, string[]> = {
  produce: [
    'tomato',
    'lettuce',
    'cucumber',
    'carrot',
    'potato',
    'onion',
    'garlic',
    'apple',
    'banana',
    'orange',
    'grape',
    'berry',
    'lemon',
    'lime',
    'avocado',
    'spinach',
    'broccoli',
    'pepper',
    'mushroom',
    'salad',
    'fruit',
    'vegetable',
  ],
  dairy: [
    'milk',
    'cheese',
    'yogurt',
    'butter',
    'cream',
    'eggs',
    'ice cream',
    'sour cream',
    'cottage cheese',
    'mozzarella',
    'cheddar',
    'parmesan',
  ],
  meat: [
    'chicken',
    'beef',
    'pork',
    'fish',
    'salmon',
    'tuna',
    'shrimp',
    'turkey',
    'ham',
    'bacon',
    'sausage',
    'steak',
    'ground beef',
    'lamb',
  ],
  bakery: ['bread', 'baguette', 'roll', 'bagel', 'croissant', 'muffin', 'cake', 'pastry', 'donut'],
  frozen: ['frozen', 'popsicle', 'frozen pizza', 'frozen vegetables', 'frozen meals'],
  pantry: [
    'pasta',
    'rice',
    'flour',
    'sugar',
    'salt',
    'pepper',
    'oil',
    'vinegar',
    'sauce',
    'can',
    'jar',
    'cereal',
    'oatmeal',
    'beans',
    'soup',
    'tomato sauce',
  ],
  beverages: [
    'water',
    'juice',
    'soda',
    'coffee',
    'tea',
    'beer',
    'wine',
    'drink',
    'beverage',
    'cola',
  ],
  snacks: [
    'chips',
    'cookie',
    'candy',
    'chocolate',
    'popcorn',
    'crackers',
    'nuts',
    'pretzels',
    'snack',
  ],
  household: [
    'soap',
    'shampoo',
    'toothpaste',
    'paper towel',
    'toilet paper',
    'detergent',
    'cleaner',
    'dish soap',
    'trash bags',
    'tissue',
  ],
}

/**
 * Auto-categorize an item based on its name
 * Uses keyword matching to determine the best category
 * @param itemName - The name of the item to categorize
 * @param preferredCategory - Optional user preference to override auto-categorization
 * @returns The category ID
 */
export function categorizeItem(itemName: string, preferredCategory?: string | null): string {
  // Use preferred category if provided
  if (preferredCategory) {
    return preferredCategory
  }

  // Fall back to keyword matching
  const normalized = itemName.toLowerCase().trim()

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (normalized.includes(keyword)) {
        return category
      }
    }
  }

  return 'other'
}

/**
 * Parse a text input into multiple items
 * Supports comma-separated, "and"-separated, and line-separated items
 * Also handles natural language patterns like "add X", "I need X", "get some X"
 * @param input - The text to parse
 * @returns Array of item names
 */
export function parseItemsFromText(input: string): string[] {
  if (!input.trim()) return []

  let processedInput = input

  // Handle patterns like "a dozen eggs" -> "eggs" (before splitting)
  processedInput = processedInput.replace(/\b(a\s+)?dozen\s+/gi, '')

  // Handle patterns like "2 bottles of milk" -> "milk" (before splitting)
  processedInput = processedInput.replace(
    /\b\d+\s+(bottles?|cans?|boxes?|bags?|jars?)\s+of\s+/gi,
    '',
  )

  // Handle patterns like "a bottle of milk" -> "milk" (before splitting)
  processedInput = processedInput.replace(/\b(a|an|the)\s+(bottle|can|box|bag|jar)\s+of\s+/gi, '')

  // Split by commas, newlines, or "and"
  const items = processedInput
    .split(/[,\n]|(?:\s+and\s+)/gi)
    .map((item) => {
      let trimmed = item.trim()

      // Strip common voice input prefixes from each item (case insensitive)
      trimmed = trimmed.replace(/^(add|get|buy|need|want|purchase|pick up|grab)\s+/gi, '')
      trimmed = trimmed.replace(
        /^(i need|i want|i'm getting|im getting|i'd like|id like|please add|please get)\s+/gi,
        '',
      )

      // Strip leading articles and quantifiers from each item
      trimmed = trimmed.replace(/^(a|an|the|some)\s+/gi, '')

      return trimmed
    })
    .filter((item) => item.length > 0)

  // Remove duplicates
  return [...new Set(items)]
}

/**
 * Sanitize item name
 * @param name - The item name to sanitize
 * @returns Sanitized name
 */
export function sanitizeItemName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}
