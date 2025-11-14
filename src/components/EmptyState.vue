<script setup lang="ts">
interface Props {
  icon: string
  title: string
  description?: string
}

defineProps<Props>()
</script>

<template>
  <div class="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-border">
    <div class="text-6xl mb-4 opacity-50">{{ icon }}</div>
    <h3 class="text-2xl font-semibold text-text mb-2">{{ title }}</h3>
    <p v-if="description" class="text-text-secondary mx-auto px-6">
      {{ description }}
    </p>
    <div v-if="$slots.action" class="mt-6">
      <slot name="action" />
    </div>
  </div>
</template>
