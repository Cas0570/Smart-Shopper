import 'fake-indexeddb/auto'
import { afterEach, beforeAll } from 'vitest'

// Suppress fake-indexeddb "Another connection wants to delete database" warnings
beforeAll(() => {
  const originalConsoleWarn = console.warn
  const originalConsoleError = console.error

  console.warn = (...args: unknown[]) => {
    const message = args[0]
    if (
      typeof message === 'string' &&
      message.includes('Another connection wants to delete database')
    ) {
      // Suppress this specific warning
      return
    }
    originalConsoleWarn.apply(console, args)
  }

  console.error = (...args: unknown[]) => {
    const message = args[0]
    if (
      typeof message === 'string' &&
      message.includes('Another connection wants to delete database')
    ) {
      // Suppress this specific error
      return
    }
    originalConsoleError.apply(console, args)
  }
})

// Clean up IndexedDB after each test
afterEach(async () => {
  // Wait a bit for any pending operations to complete
  await new Promise((resolve) => setTimeout(resolve, 10))

  // Get all databases and delete them
  const dbs = await indexedDB.databases()
  await Promise.all(
    dbs.map((db) => {
      return new Promise<void>((resolve, reject) => {
        if (!db.name) {
          resolve()
          return
        }
        const request = indexedDB.deleteDatabase(db.name)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
        request.onblocked = () => {
          // Silently resolve on blocked - this is normal in tests
          resolve()
        }
      })
    }),
  )
})
