<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseDialog from './BaseDialog.vue'
import BaseInput from './BaseInput.vue'
import BaseButton from './BaseButton.vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  create: [name: string, icon: string]
}>()

const categoryName = ref('')
const categoryIcon = ref('📦')

// Reset when dialog closes
watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue) {
      categoryName.value = ''
      categoryIcon.value = '📦'
    }
  },
)

const handleCreate = () => {
  if (!categoryName.value.trim()) return
  emit('create', categoryName.value.trim(), categoryIcon.value)
  emit('update:modelValue', false)
}
</script>

<template>
  <BaseDialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    title="Create Custom Category"
  >
    <div class="flex flex-col gap-4">
      <BaseInput
        v-model="categoryName"
        label="Category Name"
        placeholder="e.g., Pet Supplies, Office Items..."
        autofocus
        @keyup.enter="handleCreate"
      />

      <div class="space-y-2">
        <label for="category-icon" class="text-sm font-medium text-text block"
          >Category Icon (Emoji)</label
        >
        <div class="flex items-center gap-3 p-3 bg-background rounded-xl border border-border">
          <div class="relative">
            <input
              id="category-icon"
              type="text"
              v-model="categoryIcon"
              maxlength="2"
              class="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              title="Enter an emoji"
            />
            <div
              class="w-12 h-12 rounded-lg border-2 border-border shadow-sm cursor-pointer transition-transform hover:scale-105 flex items-center justify-center text-2xl bg-white"
            >
              {{ categoryIcon }}
            </div>
          </div>
          <div class="flex-1">
            <BaseInput v-model="categoryIcon" maxlength="2" class="text-2xl text-center" />
            <div class="text-xs text-text-secondary mt-1">Type or paste an emoji</div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex gap-4 justify-end mt-6">
      <BaseButton variant="secondary" @click="emit('update:modelValue', false)">
        Cancel
      </BaseButton>
      <BaseButton @click="handleCreate" :disabled="!categoryName.trim()">
        Create Category
      </BaseButton>
    </div>
  </BaseDialog>
</template>
