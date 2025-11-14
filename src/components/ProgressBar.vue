<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value: number
  max?: number
  color?: 'primary' | 'success' | 'warning' | 'error'
  showLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  max: 100,
  color: 'primary',
  showLabel: false,
})

const percentage = computed(() => {
  return Math.min(100, Math.max(0, (props.value / props.max) * 100))
})

const colorClasses = {
  primary: 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)]',
  success: 'bg-gradient-to-r from-[#10b981] to-[#059669]',
  warning: 'bg-gradient-to-r from-[#f59e0b] to-[#d97706]',
  error: 'bg-gradient-to-r from-[#ef4444] to-[#dc2626]',
}
</script>

<template>
  <div class="w-full">
    <div
      v-if="showLabel"
      class="flex justify-between items-center mb-2 text-sm text-text-secondary"
    >
      <slot name="label" />
      <span>{{ Math.round(percentage) }}%</span>
    </div>
    <div class="h-2 bg-background rounded-full overflow-hidden">
      <div
        :class="['h-full rounded-full transition-all duration-500', colorClasses[color]]"
        :style="{ width: `${percentage}%` }"
      ></div>
    </div>
  </div>
</template>
