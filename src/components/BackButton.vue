<script setup lang="ts">
import { useRouter } from 'vue-router'

interface Props {
  to?: string
  icon?: string
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: '←',
  label: 'Back',
})

const router = useRouter()

const handleClick = () => {
  if (props.to) {
    router.push(props.to)
  } else {
    router.back()
  }
}
</script>

<template>
  <div class="mb-6">
    <button
      class="inline-flex items-center gap-2 bg-transparent border-0 text-text-secondary text-base cursor-pointer px-4 py-2 rounded-xl transition-all duration-200 font-medium hover:bg-background hover:text-(--color-primary) hover:-translate-x-1"
      @click="handleClick"
      title="Back"
    >
      <span class="text-xl">{{ icon }}</span>
      <span>{{ label }}</span>
    </button>
  </div>
</template>
