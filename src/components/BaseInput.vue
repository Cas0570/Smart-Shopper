<script setup lang="ts">
interface Props {
  modelValue: string
  type?: string
  placeholder?: string
  disabled?: boolean
  autofocus?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  disabled: false,
  autofocus: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <input
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :autofocus="autofocus"
    class="w-full px-4 py-3.5 border-2 border-border rounded-xl text-base transition-all duration-200 bg-white text-text placeholder:text-text-secondary focus:outline-none focus:border-(--color-primary) focus:shadow-[0_0_0_3px_var(--color-primary-light)] disabled:opacity-50 disabled:cursor-not-allowed"
    @input="handleInput"
  />
</template>
