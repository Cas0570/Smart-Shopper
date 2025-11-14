import { ref } from 'vue'
import { BrowserMultiFormatReader, type Result } from '@zxing/library'

export interface ScanResult {
  barcode: string
  format: string
}

export interface BarcodeScannerAdapter {
  startScanning(
    videoElement: HTMLVideoElement,
    onDetected: (result: ScanResult) => void,
  ): Promise<void>
  stopScanning(): void
  hasCamera(): Promise<boolean>
}

/**
 * Real ZXing barcode scanner implementation
 */
class ZXingScanner implements BarcodeScannerAdapter {
  private reader: BrowserMultiFormatReader | null = null
  private scanning = false

  async hasCamera(): Promise<boolean> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      return devices.some((device) => device.kind === 'videoinput')
    } catch {
      return false
    }
  }

  async startScanning(
    videoElement: HTMLVideoElement,
    onDetected: (result: ScanResult) => void,
  ): Promise<void> {
    if (this.scanning) return

    this.reader = new BrowserMultiFormatReader()
    this.scanning = true

    // This can throw permission errors, so let them bubble up
    await this.reader.decodeFromVideoDevice(
      null, // Use default camera
      videoElement,
      (result: Result | null, error?: Error) => {
        if (result) {
          onDetected({
            barcode: result.getText(),
            format: result.getBarcodeFormat().toString(),
          })
        }
        // Ignore errors during scanning (e.g., no barcode found in frame)
        if (error && this.scanning) {
          console.debug('Scanning frame:', error.message)
        }
      },
    )
  }

  stopScanning(): void {
    if (this.reader) {
      this.reader.reset()
      this.reader = null
    }
    this.scanning = false
  }
}

/**
 * Mock barcode scanner for testing
 */
class MockScanner implements BarcodeScannerAdapter {
  private mockResults: ScanResult[] = []
  private mockHasCamera = true

  setMockResults(results: ScanResult[]): void {
    this.mockResults = results
  }

  setMockHasCamera(hasCamera: boolean): void {
    this.mockHasCamera = hasCamera
  }

  async hasCamera(): Promise<boolean> {
    return this.mockHasCamera
  }

  async startScanning(
    _videoElement: HTMLVideoElement,
    onDetected: (result: ScanResult) => void,
  ): Promise<void> {
    // Simulate scanning by calling onDetected with mock results after a delay
    if (this.mockResults.length > 0) {
      setTimeout(() => {
        this.mockResults.forEach((result) => onDetected(result))
      }, 100)
    }
  }

  stopScanning(): void {
    // Nothing to do for mock
  }
}

let scannerAdapter: BarcodeScannerAdapter | null = null

/**
 * Set a custom scanner adapter (useful for testing)
 */
export function setScannerAdapter(adapter: BarcodeScannerAdapter): void {
  scannerAdapter = adapter
}

/**
 * Get the scanner adapter (creates ZXing scanner by default)
 */
function getScannerAdapter(): BarcodeScannerAdapter {
  if (!scannerAdapter) {
    scannerAdapter = new ZXingScanner()
  }
  return scannerAdapter
}

/**
 * Composable for barcode scanning
 */
export function useBarcodeScanner() {
  const isScanning = ref(false)
  const error = ref<string | null>(null)
  const hasCamera = ref(true)

  const adapter = getScannerAdapter()

  const checkCamera = async (): Promise<boolean> => {
    const result = await adapter.hasCamera()
    hasCamera.value = result
    return result
  }

  const startScanning = async (
    videoElement: HTMLVideoElement,
    onDetected: (result: ScanResult) => void,
  ) => {
    try {
      error.value = null
      isScanning.value = true
      await adapter.startScanning(videoElement, (result) => {
        onDetected(result)
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to start scanning'
      isScanning.value = false
      throw err
    }
  }

  const stopScanning = () => {
    adapter.stopScanning()
    isScanning.value = false
  }

  return {
    isScanning,
    error,
    hasCamera,
    checkCamera,
    startScanning,
    stopScanning,
  }
}

// Export mock scanner for testing
export { MockScanner }
