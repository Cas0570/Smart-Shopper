/**
 * Database Seeding Script
 *
 * This script generates a sample data JSON file that can be imported into the app.
 * Run with: npm run dev:seed
 *
 * The generated file can be imported via:
 * 1. Run the app (npm run dev)
 * 2. Go to Settings
 * 3. Click "Import Backup"
 * 4. Select the generated public/sample-data.json file
 */

import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { v4 as uuidv4 } from 'uuid'
import { CATEGORIES } from '../src/constants/categories.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Define interfaces matching the app's data structure
interface ShoppingList {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  archived: boolean
  color?: string
}

interface ShoppingItem {
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

interface Category {
  id: string
  name: string
  icon?: string
  sortOrder?: number
}

interface Product {
  barcode: string
  name: string
  category: string
  lastUsed: number
}

interface CategoryPreference {
  itemName: string
  category: string
  learnedAt: number
}

interface BackupData {
  version: string
  timestamp: number
  lists: ShoppingList[]
  items: ShoppingItem[]
  customCategories: Category[]
  products: Product[]
  categoryPreferences: Record<string, string>
  categoryOrder: string[]
}

// Sample data
const now = Date.now()
const yesterday = now - 24 * 60 * 60 * 1000
const lastWeek = now - 7 * 24 * 60 * 60 * 1000

// Create sample lists
const sampleLists: ShoppingList[] = [
  {
    id: uuidv4(),
    name: 'Weekly Groceries',
    createdAt: lastWeek,
    updatedAt: now,
    archived: false,
    color: '#10b981',
  },
  {
    id: uuidv4(),
    name: 'Party Supplies',
    createdAt: yesterday,
    updatedAt: yesterday,
    archived: false,
    color: '#f59e0b',
  },
  {
    id: uuidv4(),
    name: 'Thanksgiving Dinner',
    createdAt: lastWeek - 7 * 24 * 60 * 60 * 1000,
    updatedAt: lastWeek,
    archived: true,
    color: '#ef4444',
  },
]

// Create sample items for each list
const createItemsForList = (listId: string, listName: string): ShoppingItem[] => {
  if (listName === 'Weekly Groceries') {
    return [
      {
        id: uuidv4(),
        listId,
        name: 'Milk',
        quantity: 1,
        unit: 'gallon',
        category: 'dairy',
        completed: false,
        addedAt: lastWeek,
        barcode: '078000113464',
      },
      {
        id: uuidv4(),
        listId,
        name: 'Whole Wheat Bread',
        quantity: 1,
        category: 'bakery',
        completed: true,
        addedAt: lastWeek,
        completedAt: yesterday,
        barcode: '004900007993',
      },
      {
        id: uuidv4(),
        listId,
        name: 'Apples',
        quantity: 6,
        category: 'produce',
        completed: false,
        addedAt: lastWeek,
        notes: 'Fuji or Gala',
      },
      {
        id: uuidv4(),
        listId,
        name: 'Bananas',
        quantity: 1,
        unit: 'bunch',
        category: 'produce',
        completed: true,
        addedAt: lastWeek,
        completedAt: yesterday,
      },
      {
        id: uuidv4(),
        listId,
        name: 'Chicken Breast',
        quantity: 2,
        unit: 'lb',
        category: 'meat',
        completed: false,
        addedAt: lastWeek,
      },
      {
        id: uuidv4(),
        listId,
        name: 'Ground Beef',
        quantity: 1,
        unit: 'lb',
        category: 'meat',
        completed: false,
        addedAt: lastWeek,
      },
      {
        id: uuidv4(),
        listId,
        name: 'Eggs',
        quantity: 1,
        unit: 'dozen',
        category: 'dairy',
        completed: true,
        addedAt: lastWeek,
        completedAt: yesterday,
        barcode: '007874217216',
      },
      {
        id: uuidv4(),
        listId,
        name: 'Orange Juice',
        quantity: 1,
        category: 'beverages',
        completed: false,
        addedAt: lastWeek,
      },
      {
        id: uuidv4(),
        listId,
        name: 'Pasta',
        quantity: 2,
        unit: 'boxes',
        category: 'pantry',
        completed: false,
        addedAt: lastWeek,
      },
      {
        id: uuidv4(),
        listId,
        name: 'Tomato Sauce',
        quantity: 3,
        unit: 'jars',
        category: 'pantry',
        completed: false,
        addedAt: lastWeek,
      },
      {
        id: uuidv4(),
        listId,
        name: 'Frozen Pizza',
        quantity: 2,
        category: 'frozen',
        completed: false,
        addedAt: yesterday,
      },
      {
        id: uuidv4(),
        listId,
        name: 'Paper Towels',
        quantity: 1,
        unit: 'pack',
        category: 'household',
        completed: false,
        addedAt: yesterday,
      },
      {
        id: uuidv4(),
        listId,
        name: 'Dish Soap',
        quantity: 1,
        category: 'household',
        completed: false,
        addedAt: yesterday,
      },
    ]
  } else if (listName === 'Party Supplies') {
    return [
      {
        id: uuidv4(),
        listId,
        name: 'Potato Chips',
        quantity: 3,
        unit: 'bags',
        category: 'snacks',
        completed: false,
        addedAt: yesterday,
      },
      {
        id: uuidv4(),
        listId,
        name: 'Soda',
        quantity: 2,
        unit: '2-liter bottles',
        category: 'beverages',
        completed: false,
        addedAt: yesterday,
      },
      {
        id: uuidv4(),
        listId,
        name: 'Cookies',
        quantity: 2,
        unit: 'packages',
        category: 'snacks',
        completed: false,
        addedAt: yesterday,
      },
      {
        id: uuidv4(),
        listId,
        name: 'Ice Cream',
        quantity: 2,
        unit: 'tubs',
        category: 'frozen',
        completed: false,
        addedAt: yesterday,
      },
      {
        id: uuidv4(),
        listId,
        name: 'Paper Plates',
        quantity: 1,
        unit: 'pack',
        category: 'household',
        completed: false,
        addedAt: yesterday,
      },
      {
        id: uuidv4(),
        listId,
        name: 'Plastic Cups',
        quantity: 1,
        unit: 'pack',
        category: 'household',
        completed: false,
        addedAt: yesterday,
      },
    ]
  } else if (listName === 'Thanksgiving Dinner') {
    return [
      {
        id: uuidv4(),
        listId,
        name: 'Turkey',
        quantity: 1,
        unit: '15 lb',
        category: 'meat',
        completed: true,
        addedAt: lastWeek - 7 * 24 * 60 * 60 * 1000,
        completedAt: lastWeek,
      },
      {
        id: uuidv4(),
        listId,
        name: 'Potatoes',
        quantity: 5,
        unit: 'lbs',
        category: 'produce',
        completed: true,
        addedAt: lastWeek - 7 * 24 * 60 * 60 * 1000,
        completedAt: lastWeek,
      },
      {
        id: uuidv4(),
        listId,
        name: 'Green Beans',
        quantity: 2,
        unit: 'lbs',
        category: 'produce',
        completed: true,
        addedAt: lastWeek - 7 * 24 * 60 * 60 * 1000,
        completedAt: lastWeek,
      },
      {
        id: uuidv4(),
        listId,
        name: 'Cranberry Sauce',
        quantity: 2,
        unit: 'cans',
        category: 'pantry',
        completed: true,
        addedAt: lastWeek - 7 * 24 * 60 * 60 * 1000,
        completedAt: lastWeek,
      },
      {
        id: uuidv4(),
        listId,
        name: 'Pumpkin Pie',
        quantity: 2,
        category: 'bakery',
        completed: true,
        addedAt: lastWeek - 7 * 24 * 60 * 60 * 1000,
        completedAt: lastWeek,
      },
    ]
  }
  return []
}

// Generate all items
const sampleItems: ShoppingItem[] = sampleLists.flatMap((list) =>
  createItemsForList(list.id, list.name),
)

// Sample products (for barcode database)
const sampleProducts: Product[] = [
  {
    barcode: '078000113464',
    name: 'Milk',
    category: 'dairy',
    lastUsed: lastWeek,
  },
  {
    barcode: '004900007993',
    name: 'Whole Wheat Bread',
    category: 'bakery',
    lastUsed: yesterday,
  },
  {
    barcode: '007874217216',
    name: 'Eggs',
    category: 'dairy',
    lastUsed: yesterday,
  },
  {
    barcode: '012000161155',
    name: 'Coca-Cola',
    category: 'beverages',
    lastUsed: yesterday,
  },
  {
    barcode: '028400006712',
    name: 'Cheerios',
    category: 'pantry',
    lastUsed: lastWeek,
  },
  {
    barcode: '052000009187',
    name: "Lay's Classic Potato Chips",
    category: 'snacks',
    lastUsed: yesterday,
  },
  {
    barcode: '041196403268',
    name: 'Frozen Pizza',
    category: 'frozen',
    lastUsed: yesterday,
  },
  {
    barcode: '037000184034',
    name: 'Tide Laundry Detergent',
    category: 'household',
    lastUsed: lastWeek,
  },
  {
    barcode: '030000010310',
    name: 'Philadelphia Cream Cheese',
    category: 'dairy',
    lastUsed: lastWeek,
  },
  {
    barcode: '020000016108',
    name: 'Tropicana Orange Juice',
    category: 'beverages',
    lastUsed: lastWeek,
  },
]

// Sample category preferences (manual categorization learning)
const samplePreferences: CategoryPreference[] = [
  {
    itemName: 'almond milk',
    category: 'dairy',
    learnedAt: lastWeek,
  },
  {
    itemName: 'oat milk',
    category: 'dairy',
    learnedAt: lastWeek,
  },
  {
    itemName: 'sparkling water',
    category: 'beverages',
    learnedAt: yesterday,
  },
]

// Convert preferences array to Record format
const categoryPreferencesRecord: Record<string, string> = {}
samplePreferences.forEach((pref) => {
  categoryPreferencesRecord[pref.itemName] = pref.category
})

// Seed function - generates JSON file
function generateSeedData() {
  try {
    console.log('🌱 Generating sample data...')

    // Create backup data structure
    const backupData: BackupData = {
      version: '1.0.0',
      timestamp: now,
      lists: sampleLists,
      items: sampleItems,
      customCategories: [],
      products: sampleProducts,
      categoryPreferences: categoryPreferencesRecord,
      categoryOrder: CATEGORIES.map((c) => c.id),
    }

    // Write to file
    const outputPath = join(__dirname, '../public/sample-data.json')
    writeFileSync(outputPath, JSON.stringify(backupData, null, 2), 'utf-8')

    console.log('\n✨ Sample data generated successfully!')
    console.log(`📁 File location: ${outputPath}`)
    console.log('\n📊 Summary:')
    console.log(`   - ${sampleLists.length} shopping lists`)
    console.log(`   - ${sampleItems.length} shopping items`)
    console.log(`   - ${sampleProducts.length} products in database`)
    console.log(`   - ${Object.keys(categoryPreferencesRecord).length} category preferences`)
    console.log(`   - ${CATEGORIES.length} category order entries`)

    console.log('\n🚀 To use this data:')
    console.log('   1. Run: npm run dev')
    console.log('   2. Open http://localhost:5173')
    console.log('   3. Go to Settings → Import Backup')
    console.log('   4. Select public/sample-data.json')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error generating sample data:', error)
    process.exit(1)
  }
}

// Run generator
generateSeedData()
