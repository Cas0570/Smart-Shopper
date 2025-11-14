import { beforeEach, describe, expect, it } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProductsStore } from '@/stores/products'

describe('Rule 4.2: Build local product database', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Database growth', () => {
    it('should save 20 products to local database', async () => {
      const productsStore = useProductsStore()

      // Simulate scanning and saving 20 products over time
      const products = []
      for (let i = 1; i <= 20; i++) {
        products.push(
          await productsStore.saveProduct({
            barcode: `barcode-${i.toString().padStart(3, '0')}`,
            name: `Product ${i}`,
            category: i % 5 === 0 ? 'dairy' : i % 3 === 0 ? 'produce' : 'pantry',
          }),
        )
      }

      expect(products).toHaveLength(20)

      // Load all products
      await productsStore.loadProducts()
      expect(productsStore.products).toHaveLength(20)
    })

    it('should return results instantly from local DB for saved products', async () => {
      const productsStore = useProductsStore()

      // Save multiple products
      const savedProducts = []
      for (let i = 1; i <= 10; i++) {
        savedProducts.push(
          await productsStore.saveProduct({
            barcode: `instant-${i}`,
            name: `Instant Product ${i}`,
            category: 'beverages',
          }),
        )
      }

      // Load into local state
      await productsStore.loadProducts()

      // Measure retrieval time (should be instant from local state)
      const startTime = performance.now()
      const product = await productsStore.getProductByBarcode('instant-5')
      const endTime = performance.now()

      expect(product).toBeDefined()
      expect(product?.name).toBe('Instant Product 5')

      // Should be very fast (< 10ms from local state)
      const retrievalTime = endTime - startTime
      expect(retrievalTime).toBeLessThan(10)
    })

    it('should handle large product database efficiently', async () => {
      const productsStore = useProductsStore()

      // Save 100 products
      for (let i = 1; i <= 100; i++) {
        await productsStore.saveProduct({
          barcode: `large-db-${i}`,
          name: `Product ${i}`,
          category: 'pantry',
        })
      }

      await productsStore.loadProducts()
      expect(productsStore.products.length).toBe(100)

      // Should still retrieve quickly
      const product50 = await productsStore.getProductByBarcode('large-db-50')
      const product100 = await productsStore.getProductByBarcode('large-db-100')

      expect(product50?.name).toBe('Product 50')
      expect(product100?.name).toBe('Product 100')
    })
  })

  describe('Product metadata', () => {
    it('should track lastUsed timestamp for products', async () => {
      const productsStore = useProductsStore()

      const product = await productsStore.saveProduct({
        barcode: 'timestamp-test',
        name: 'Timestamp Product',
        category: 'dairy',
      })

      expect(product.lastUsed).toBeDefined()
      expect(product.lastUsed).toBeGreaterThan(Date.now() - 1000) // Within last second
    })

    it('should update lastUsed when product is scanned again', async () => {
      const productsStore = useProductsStore()

      await productsStore.saveProduct({
        barcode: 'reuse-test',
        name: 'Reuse Product',
        category: 'produce',
      })

      const first = await productsStore.getProductByBarcode('reuse-test')
      const firstTime = first!.lastUsed

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 10))

      // Update lastUsed (simulating a new scan)
      await productsStore.updateLastUsed('reuse-test')

      const second = await productsStore.getProductByBarcode('reuse-test')
      expect(second!.lastUsed).toBeGreaterThan(firstTime)
    })

    it('should store product category for auto-categorization', async () => {
      const productsStore = useProductsStore()

      await productsStore.saveProduct({
        barcode: 'category-test',
        name: 'Test Product',
        category: 'frozen',
      })

      const product = await productsStore.getProductByBarcode('category-test')
      expect(product?.category).toBe('frozen')
    })
  })

  describe('Database operations', () => {
    it('should allow deleting a product', async () => {
      const productsStore = useProductsStore()

      await productsStore.saveProduct({
        barcode: 'delete-test',
        name: 'Delete Me',
        category: 'snacks',
      })

      let product = await productsStore.getProductByBarcode('delete-test')
      expect(product).toBeDefined()

      // Delete the product
      await productsStore.deleteProduct('delete-test')

      product = await productsStore.getProductByBarcode('delete-test')
      expect(product).toBeUndefined()
    })

    it('should allow clearing all products', async () => {
      const productsStore = useProductsStore()

      // Add several products
      for (let i = 1; i <= 5; i++) {
        await productsStore.saveProduct({
          barcode: `clear-${i}`,
          name: `Product ${i}`,
          category: 'pantry',
        })
      }

      await productsStore.loadProducts()
      expect(productsStore.products.length).toBeGreaterThanOrEqual(5)

      // Clear all
      await productsStore.clearProducts()
      expect(productsStore.products).toHaveLength(0)

      // Verify they're gone from DB too
      const product = await productsStore.getProductByBarcode('clear-1')
      expect(product).toBeUndefined()
    })

    it('should handle concurrent saves', async () => {
      const productsStore = useProductsStore()

      // Save multiple products concurrently
      const promises = []
      for (let i = 1; i <= 10; i++) {
        promises.push(
          productsStore.saveProduct({
            barcode: `concurrent-${i}`,
            name: `Concurrent Product ${i}`,
            category: 'beverages',
          }),
        )
      }

      const results = await Promise.all(promises)
      expect(results).toHaveLength(10)

      // All should be saved
      await productsStore.loadProducts()
      expect(productsStore.products.length).toBeGreaterThanOrEqual(10)
    })
  })

  describe('Product search and retrieval', () => {
    it('should find product by exact barcode match', async () => {
      const productsStore = useProductsStore()

      await productsStore.saveProduct({
        barcode: '1234567890123',
        name: 'Exact Match Product',
        category: 'dairy',
      })

      const product = await productsStore.getProductByBarcode('1234567890123')
      expect(product).toBeDefined()
      expect(product?.name).toBe('Exact Match Product')
    })

    it('should return undefined for non-existent barcode', async () => {
      const productsStore = useProductsStore()

      const product = await productsStore.getProductByBarcode('non-existent-barcode')
      expect(product).toBeUndefined()
    })

    it('should retrieve from database if not in local state', async () => {
      const productsStore = useProductsStore()

      // Save product
      await productsStore.saveProduct({
        barcode: 'db-retrieval',
        name: 'DB Product',
        category: 'meat',
      })

      // Create new store instance (empty local state)
      setActivePinia(createPinia())
      const newProductsStore = useProductsStore()

      // Should still retrieve from DB (not in local state)
      const product = await newProductsStore.getProductByBarcode('db-retrieval')
      expect(product).toBeDefined()
      expect(product?.name).toBe('DB Product')

      // Should now be in local state too
      expect(newProductsStore.products).toContainEqual(product)
    })
  })
})
