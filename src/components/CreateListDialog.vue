<script setup lang="ts">
import { ref, watch } from 'vue'
import { DEFAULT_LIST_COLOR } from '@/utils/colors'
import BaseDialog from './BaseDialog.vue'
import BaseInput from './BaseInput.vue'
import BaseButton from './BaseButton.vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  create: [name: string, color: string]
}>()

const listName = ref('')
const listColor = ref(DEFAULT_LIST_COLOR)

// Reset when dialog closes
watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue) {
      listName.value = ''
      listColor.value = DEFAULT_LIST_COLOR
    }
  },
)

const handleCreate = () => {
  if (!listName.value.trim()) return
  emit('create', listName.value.trim(), listColor.value)
  emit('update:modelValue', false)
}
</script>

<template>
  <BaseDialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <h3 class="text-2xl font-semibold text-text mb-6">Create New List</h3>
    <div class="flex flex-col gap-4">
      <BaseInput
        v-model="listName"
        placeholder="e.g., Weekly Groceries, Party Supplies..."
        autofocus
        @keyup.enter="handleCreate"
      />
      <div class="space-y-2">
        <label for="list-color" class="text-sm font-medium text-text block">List Color</label>
        <div class="flex items-center gap-3 p-3 bg-background rounded-xl border border-border">
          <div class="relative">
            <input
              id="list-color"
              type="color"
              v-model="listColor"
              class="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              title="Choose list color"
            />
            <div
              class="w-12 h-12 rounded-lg border-2 border-border shadow-sm cursor-pointer transition-transform hover:scale-105"
              :style="{ backgroundColor: listColor }"
            ></div>
          </div>
          <div class="flex-1">
            <div class="text-sm font-medium text-text">{{ listColor.toUpperCase() }}</div>
            <div class="text-xs text-text-secondary">Click to change color</div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex gap-4 justify-end mt-6">
      <BaseButton variant="secondary" @click="emit('update:modelValue', false)">
        Cancel
      </BaseButton>
      <BaseButton @click="handleCreate" :disabled="!listName.trim()"> Create List </BaseButton>
    </div>
  </BaseDialog>
</template>
