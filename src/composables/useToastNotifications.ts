import { ref } from 'vue'
import { defineStore } from 'pinia'

export type ToastVariant = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  message: string
  variant: ToastVariant
  visible: boolean
}

let toastIdCounter = 0

/**
 * Toast notifications store using Pinia
 * Provides a global singleton for toast management
 */
export const useToastNotifications = defineStore('toastNotifications', () => {
  const toasts = ref<Toast[]>([])

  /**
   * Show a toast notification
   * @param message - The message to display
   * @param variant - The toast variant (success, error, info)
   * @param duration - How long to show the toast in ms (default: 3000)
   */
  const showToast = (message: string, variant: ToastVariant = 'success', duration = 3000) => {
    const id = toastIdCounter++
    const toast: Toast = {
      id,
      message,
      variant,
      visible: true,
    }

    toasts.value.push(toast)

    // Auto-hide after duration
    setTimeout(() => {
      const toastIndex = toasts.value.findIndex((t) => t.id === id)
      if (toastIndex !== -1) {
        const toast = toasts.value[toastIndex]
        if (toast) {
          toast.visible = false
        }
        // Remove from array after animation completes
        setTimeout(() => {
          toasts.value = toasts.value.filter((t) => t.id !== id)
        }, 300)
      }
    }, duration)

    return id
  }

  /**
   * Show a success toast
   */
  const showSuccess = (message: string, duration?: number) => {
    return showToast(message, 'success', duration)
  }

  /**
   * Show an error toast
   */
  const showError = (message: string, duration?: number) => {
    return showToast(message, 'error', duration)
  }

  /**
   * Show an info toast
   */
  const showInfo = (message: string, duration?: number) => {
    return showToast(message, 'info', duration)
  }

  /**
   * Manually hide a toast by ID
   */
  const hideToast = (id: number) => {
    const toast = toasts.value.find((t) => t.id === id)
    if (toast) {
      toast.visible = false
      setTimeout(() => {
        toasts.value = toasts.value.filter((t) => t.id !== id)
      }, 300)
    }
  }

  /**
   * Clear all toasts
   */
  const clearAll = () => {
    toasts.value = []
  }

  return {
    toasts,
    showToast,
    showSuccess,
    showError,
    showInfo,
    hideToast,
    clearAll,
  }
})
