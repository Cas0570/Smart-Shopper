import Dexie, { type EntityTable } from 'dexie'

export interface ShoppingList {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  archived: boolean
  color?: string
}

export interface ShoppingItem {
  id: string
  listId: string
  name: string
  quantity: number
  unit?: string
  category: string
  completed: boolean
  addedAt: number
  completedAt?: number
  barcode?: string
  notes?: string
}

export interface Category {
  id: string
  name: string
  icon?: string
  sortOrder: number
}

export interface Product {
  barcode: string
  name: string
  category: string
  lastUsed: number
}

export interface CategoryPreference {
  itemName: string // normalized lowercase name
  category: string
  learnedAt: number
}

const db = new Dexie('SmartShoppingDB') as Dexie & {
  lists: EntityTable<ShoppingList, 'id'>
  items: EntityTable<ShoppingItem, 'id'>
  categories: EntityTable<Category, 'id'>
  products: EntityTable<Product, 'barcode'>
  categoryPreferences: EntityTable<CategoryPreference, 'itemName'>
}

// Schema definition
db.version(2).stores({
  lists: 'id, name, createdAt, archived',
  items: 'id, listId, name, category, completed, addedAt',
  categories: 'id, name, sortOrder',
  products: 'barcode, name, category, lastUsed',
  categoryPreferences: 'itemName, category, learnedAt',
})

export { db }
