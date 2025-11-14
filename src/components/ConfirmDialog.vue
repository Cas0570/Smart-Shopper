<script setup lang="ts">
import { BaseDialog } from './'
import { BaseButton } from './'

interface Props {
  modelValue: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'primary' | 'danger'
}

withDefaults(defineProps<Props>(), {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  confirmVariant: 'primary',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

const close = () => {
  emit('update:modelValue', false)
  emit('cancel')
}

const handleConfirm = () => {
  emit('update:modelValue', false)
  emit('confirm')
}
</script>

<template>
  <BaseDialog :model-value="modelValue" @update:model-value="close" max-width="450px">
    <div class="flex flex-col gap-6">
      <!-- Header -->
      <div class="flex items-start gap-3">
        <div class="text-3xl">⚠️</div>
        <div class="flex-1">
          <h3 class="text-xl font-semibold text-text mb-2">
            {{ title }}
          </h3>
          <p class="text-text-secondary">
            {{ message }}
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 justify-end">
        <BaseButton variant="secondary" @click="close">
          {{ cancelText }}
        </BaseButton>
        <BaseButton :variant="confirmVariant" @click="handleConfirm">
          {{ confirmText }}
        </BaseButton>
      </div>
    </div>
  </BaseDialog>
</template>
