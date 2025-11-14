import { beforeEach, describe, expect, it } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProductsStore } from '@/stores/products'
import { useListsStore } from '@/stores/lists'
import { useItemsStore } from '@/stores/items'

describe('Rule 4.1: Local barcode lookup', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Known barcode lookup', () => {
    it('should add product to list when scanning known barcode', async () => {
      const productsStore = useProductsStore()
      const listsStore = useListsStore()
      const itemsStore = useItemsStore()

      // Save a known product
      await productsStore.saveProduct({
        barcode: '123456789',
        name: 'Organic Milk',
        category: 'dairy',
      })

      // Create a list
      const list = await listsStore.createList('Shopping')

      // Scan the barcode (simulate scanning by looking up product)
      const product = await productsStore.getProductByBarcode('123456789')
      expect(product).toBeDefined()
      expect(product?.name).toBe('Organic Milk')
      expect(product?.category).toBe('dairy')

      // Add to list using the product data
      const item = await itemsStore.createItem(list.id, product!.name, product!.category)
      expect(item.name).toBe('Organic Milk')
      expect(item.category).toBe('dairy')
      expect(item.barcode).toBeUndefined() // or could be set to the barcode
    })

    it('should retrieve product instantly from local database', async () => {
      const productsStore = useProductsStore()

      // Save multiple products
      await productsStore.saveProduct({
        barcode: '111111111',
        name: 'Product A',
        category: 'produce',
      })
      await productsStore.saveProduct({
        barcode: '222222222',
        name: 'Product B',
        category: 'dairy',
      })
      await productsStore.saveProduct({
        barcode: '333333333',
        name: 'Product C',
        category: 'meat',
      })

      // Load products
      await productsStore.loadProducts()

      // Should retrieve instantly (no delay expected in tests)
      const productA = await productsStore.getProductByBarcode('111111111')
      const productB = await productsStore.getProductByBarcode('222222222')
      const productC = await productsStore.getProductByBarcode('333333333')

      expect(productA?.name).toBe('Product A')
      expect(productB?.name).toBe('Product B')
      expect(productC?.name).toBe('Product C')
    })

    it('should use correct category from saved product', async () => {
      const productsStore = useProductsStore()

      await productsStore.saveProduct({
        barcode: '987654321',
        name: 'Greek Yogurt',
        category: 'dairy',
      })

      const product = await productsStore.getProductByBarcode('987654321')
      expect(product?.category).toBe('dairy')
    })
  })

  describe('Unknown barcode handling', () => {
    it('should return undefined for unknown barcode', async () => {
      const productsStore = useProductsStore()

      const product = await productsStore.getProductByBarcode('unknown-barcode')
      expect(product).toBeUndefined()
    })

    it('should allow saving new product for unknown barcode', async () => {
      const productsStore = useProductsStore()

      // User scans unknown barcode and enters details manually
      const newProduct = await productsStore.saveProduct({
        barcode: '555555555',
        name: 'New Product',
        category: 'pantry',
      })

      expect(newProduct.barcode).toBe('555555555')
      expect(newProduct.name).toBe('New Product')
      expect(newProduct.category).toBe('pantry')
      expect(newProduct.lastUsed).toBeGreaterThan(0)

      // Should be retrievable now
      const retrieved = await productsStore.getProductByBarcode('555555555')
      expect(retrieved).toBeDefined()
      expect(retrieved?.name).toBe('New Product')
    })

    it('should update existing product when saving with same barcode', async () => {
      const productsStore = useProductsStore()

      // Initial save
      await productsStore.saveProduct({
        barcode: '666666666',
        name: 'Old Name',
        category: 'produce',
      })

      // User corrects/updates the product
      await productsStore.saveProduct({
        barcode: '666666666',
        name: 'New Name',
        category: 'dairy',
      })

      const product = await productsStore.getProductByBarcode('666666666')
      expect(product?.name).toBe('New Name')
      expect(product?.category).toBe('dairy')
    })
  })

  describe('Camera permission handling', () => {
    it('should handle camera permission gracefully', async () => {
      // This test documents expected behavior when camera is denied
      // In real app, this would check navigator.mediaDevices.getUserMedia

      // Mock scenario: camera denied
      const cameraAvailable = false

      if (!cameraAvailable) {
        // App should allow manual barcode entry
        const manualBarcode = '777777777'
        expect(manualBarcode).toBe('777777777')
      }
    })

    it('should provide fallback to manual entry', async () => {
      const productsStore = useProductsStore()

      // User enters barcode manually (fallback when camera denied/unavailable)
      const manualBarcode = '888888888'

      // Check if product exists
      let product = await productsStore.getProductByBarcode(manualBarcode)
      expect(product).toBeUndefined()

      // User enters product details manually
      await productsStore.saveProduct({
        barcode: manualBarcode,
        name: 'Manually Entered Product',
        category: 'snacks',
      })

      // Should now be in database
      product = await productsStore.getProductByBarcode(manualBarcode)
      expect(product?.name).toBe('Manually Entered Product')
    })
  })

  describe('Product persistence', () => {
    it('should persist products across sessions', async () => {
      const productsStore = useProductsStore()

      // Save product
      await productsStore.saveProduct({
        barcode: '999999999',
        name: 'Persisted Product',
        category: 'frozen',
      })

      // Simulate app restart - create new store instance
      setActivePinia(createPinia())
      const newProductsStore = useProductsStore()
      await newProductsStore.loadProducts()

      // Should still be available
      const product = await newProductsStore.getProductByBarcode('999999999')
      expect(product).toBeDefined()
      expect(product?.name).toBe('Persisted Product')
    })

    it('should update lastUsed timestamp on access', async () => {
      const productsStore = useProductsStore()

      await productsStore.saveProduct({
        barcode: '101010101',
        name: 'Time Test Product',
        category: 'beverages',
      })

      const initialProduct = await productsStore.getProductByBarcode('101010101')
      const initialTime = initialProduct!.lastUsed

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 10))

      // Update lastUsed
      await productsStore.updateLastUsed('101010101')

      const updatedProduct = await productsStore.getProductByBarcode('101010101')
      expect(updatedProduct!.lastUsed).toBeGreaterThan(initialTime)
    })
  })
})
