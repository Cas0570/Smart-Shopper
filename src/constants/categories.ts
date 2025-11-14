/**
 * Category definitions with icons and display names
 * This file centralizes category configuration for easy editing and future expansion
 */

export interface Category {
  id: string
  name: string
  icon: string
  sortOrder?: number
}

/**
 * All available shopping categories
 * Add or modify categories here to update them throughout the app
 */
export const CATEGORIES: Category[] = [
  { id: 'produce', name: 'Produce', icon: '🥬', sortOrder: 1 },
  { id: 'dairy', name: 'Dairy', icon: '🥛', sortOrder: 2 },
  { id: 'meat', name: 'Meat & Seafood', icon: '🥩', sortOrder: 3 },
  { id: 'bakery', name: 'Bakery', icon: '🍞', sortOrder: 4 },
  { id: 'frozen', name: 'Frozen Foods', icon: '🧊', sortOrder: 5 },
  { id: 'pantry', name: 'Pantry', icon: '🥫', sortOrder: 6 },
  { id: 'beverages', name: 'Beverages', icon: '🥤', sortOrder: 7 },
  { id: 'snacks', name: 'Snacks', icon: '🍪', sortOrder: 8 },
  { id: 'household', name: 'Household', icon: '🧹', sortOrder: 9 },
  { id: 'other', name: 'Other', icon: '📦', sortOrder: 10 },
]

/**
 * Category lookup map for quick access by ID
 */
export const CATEGORY_MAP = CATEGORIES.reduce(
  (acc, cat) => {
    acc[cat.id] = cat
    return acc
  },
  {} as Record<string, Category>,
)

/**
 * Get formatted category display name with icon
 */
export const getCategoryDisplay = (categoryId: string): string => {
  const category = CATEGORY_MAP[categoryId] ?? CATEGORY_MAP.other!
  return `${category.icon} ${category.name}`
}

/**
 * Get category object by ID
 */
export const getCategory = (categoryId: string): Category => {
  return CATEGORY_MAP[categoryId] ?? CATEGORY_MAP.other!
}
