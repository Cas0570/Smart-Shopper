<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
  message?: string
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  message: '',
})

const sizeClasses = {
  sm: 'w-6 h-6 border-2',
  md: 'w-12 h-12 border-4',
  lg: 'w-16 h-16 border-4',
}
</script>

<template>
  <div class="flex flex-col items-center gap-4 py-12">
    <div
      :class="[
        'border-border border-t-(--color-primary) rounded-full animate-[spin_0.8s_linear_infinite]',
        sizeClasses[size],
      ]"
    ></div>
    <p v-if="message" class="text-lg text-text-secondary">
      {{ message }}
    </p>
  </div>
</template>
