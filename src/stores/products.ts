import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Product } from '@/db'
import { useDB } from '@/composables/useDB'

export const useProductsStore = defineStore('products', () => {
  const productsDB = useDB().useProductsDB()
  const products = ref<Product[]>([])

  /**
   * Load all products from the database
   */
  const loadProducts = async () => {
    products.value = await productsDB.getAll()
  }

  /**
   * Get a product by barcode
   * First checks local state, then queries database if not found
   */
  const getProductByBarcode = async (barcode: string): Promise<Product | undefined> => {
    // Check local state first for immediate availability (important for offline)
    const localProduct = products.value.find((p) => p.barcode === barcode)
    if (localProduct) {
      return localProduct
    }

    // If not in local state, query database
    const dbProduct = await productsDB.getByBarcode(barcode)

    // If found in database but not in local state, add it to local state
    if (dbProduct && !products.value.find((p) => p.barcode === barcode)) {
      products.value.push(dbProduct)
    }

    return dbProduct
  }

  /**
   * Save a new product or update existing one
   */
  const saveProduct = async (product: Omit<Product, 'lastUsed'>) => {
    const newProduct: Product = {
      ...product,
      lastUsed: Date.now(),
    }
    await productsDB.save(newProduct)
    // Update local state
    const index = products.value.findIndex((p) => p.barcode === product.barcode)
    if (index >= 0) {
      products.value[index] = newProduct
    } else {
      products.value.push(newProduct)
    }
    return newProduct
  }

  /**
   * Update the lastUsed timestamp for a product
   */
  const updateLastUsed = async (barcode: string) => {
    const product = await getProductByBarcode(barcode)
    if (product) {
      const updated = { ...product, lastUsed: Date.now() }
      await productsDB.save(updated)
      const index = products.value.findIndex((p) => p.barcode === barcode)
      if (index >= 0) {
        products.value[index] = updated
      }
    }
  }

  /**
   * Delete a product by barcode
   */
  const deleteProduct = async (barcode: string) => {
    await productsDB.delete(barcode)
    products.value = products.value.filter((p) => p.barcode !== barcode)
  }

  /**
   * Clear all products
   */
  const clearProducts = async () => {
    await productsDB.clear()
    products.value = []
  }

  return {
    products,
    loadProducts,
    getProductByBarcode,
    saveProduct,
    updateLastUsed,
    deleteProduct,
    clearProducts,
  }
})
