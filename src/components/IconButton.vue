<script setup lang="ts">
interface Props {
  icon: string
  title?: string
  variant?: 'default' | 'danger' | 'icon'
  size?: 'sm' | 'md'
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
})

const variantClasses = {
  default: 'hover:bg-background hover:scale-110',
  danger: 'hover:bg-error/10 hover:scale-110 hover:text-error',
  icon: 'bg-white/20 border-0 text-white hover:bg-white/30 hover:scale-105 min-w-10 min-h-10 p-2',
}

const sizeClasses = {
  sm: 'p-1 text-lg',
  md: 'p-1 text-xl',
}
</script>

<template>
  <button
    :class="[
      'cursor-pointer rounded-md transition-all duration-200',
      variantClasses[variant],
      sizeClasses[size],
    ]"
    :title="title"
    type="button"
  >
    <span>{{ icon }}</span>
  </button>
</template>
