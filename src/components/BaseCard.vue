<script setup lang="ts">
interface Props {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

withDefaults(defineProps<Props>(), {
  padding: 'md',
  hover: false,
})

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}
</script>

<template>
  <div
    :class="[
      'bg-white border-2 border-border rounded-2xl shadow-sm transition-all duration-200',
      paddingClasses[padding],
      {
        'hover:shadow-md': hover,
      },
    ]"
  >
    <slot />
  </div>
</template>
