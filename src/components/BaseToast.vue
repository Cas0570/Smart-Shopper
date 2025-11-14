<script setup lang="ts">
import { watch, onMounted } from 'vue'

interface Props {
  modelValue: boolean
  message: string
  variant?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'info',
  duration: 3000,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const variantStyles = {
  success: 'bg-success/10 border-success text-success',
  error: 'bg-error/10 border-error text-error',
  info: 'bg-info/10 border-info text-info',
  warning: 'bg-warning/10 border-warning text-warning',
}

const variantIcons = {
  success: '✓',
  error: '✗',
  info: 'ℹ',
  warning: '⚠',
}

// Auto-dismiss after duration
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && props.duration > 0) {
      setTimeout(() => {
        emit('update:modelValue', false)
      }, props.duration)
    }
  },
)

// Also auto-dismiss on mount if already visible
onMounted(() => {
  if (props.modelValue && props.duration > 0) {
    setTimeout(() => {
      emit('update:modelValue', false)
    }, props.duration)
  }
})
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 -translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-4"
  >
    <div
      v-if="modelValue"
      :class="['border-2 rounded-xl p-4 mb-6 flex items-center gap-3', variantStyles[variant]]"
      role="alert"
    >
      <span class="text-xl font-bold">{{ variantIcons[variant] }}</span>
      <span class="font-semibold flex-1">{{ message }}</span>
      <button
        @click="emit('update:modelValue', false)"
        class="text-current opacity-50 hover:opacity-100 transition-opacity text-lg p-1 rounded hover:bg-current/10"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  </Transition>
</template>
