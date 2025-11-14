<script setup lang="ts">
import type { ShoppingItem } from '@/db'
import { useCategoriesStore } from '@/stores/categories'
import { IconButton } from '@/components'

interface Props {
  categoryId: string
  items: ShoppingItem[]
  listColor?: string
}

withDefaults(defineProps<Props>(), {
  listColor: '#10b981',
})

const emit = defineEmits<{
  toggleItem: [id: string]
  deleteItem: [id: string]
  changeCategory: [itemId: string, newCategory: string]
  createCategory: []
}>()

const categoriesStore = useCategoriesStore()
</script>

<template>
  <div
    class="bg-white border-2 border-border rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md"
  >
    <!-- Category Header -->
    <div
      class="flex justify-between items-center px-6 py-4 bg-background border-b-2 border-border max-md:px-4"
    >
      <h3 class="text-lg font-semibold text-text">
        {{ categoriesStore.getCategoryDisplay(categoryId) }}
      </h3>
      <span
        class="text-white px-2 py-1 rounded-full text-sm font-semibold min-w-[24px] text-center"
        :style="{ backgroundColor: listColor }"
      >
        {{ items.length }}
      </span>
    </div>

    <!-- Items List -->
    <div class="flex flex-col">
      <div
        v-for="item in items"
        :key="item.id"
        class="group flex items-center gap-4 px-6 py-4 border-b border-border last:border-b-0 transition-all duration-200 hover:bg-background max-md:px-4"
        :class="{ 'opacity-50': item.completed }"
      >
        <!-- Custom Checkbox -->
        <label class="relative cursor-pointer flex items-center">
          <input
            type="checkbox"
            :checked="item.completed"
            @change="emit('toggleItem', item.id)"
            class="absolute opacity-0 w-0 h-0 peer"
          />
          <span
            class="w-6 h-6 border-2 border-border rounded-md flex items-center justify-center transition-all duration-200 bg-white hover:scale-110 after:content-['✓'] after:text-white after:font-bold after:opacity-0 peer-checked:after:opacity-100"
            :style="{
              backgroundColor: item.completed ? listColor : 'white',
              borderColor: item.completed ? listColor : '',
            }"
            :class="{ [`hover:border-[${listColor}]`]: !item.completed }"
          ></span>
        </label>

        <!-- Item Info -->
        <div class="flex-1 flex flex-col gap-1">
          <span
            class="text-base text-text font-medium"
            :class="{ 'line-through text-text-secondary': item.completed }"
          >
            {{ item.name }}
          </span>
          <span v-if="item.quantity > 1" class="text-sm text-text-secondary">
            × {{ item.quantity }}
            <span v-if="item.unit">{{ item.unit }}</span>
          </span>
        </div>

        <!-- Category Selector -->
        <select
          :value="item.category"
          @change="
            (e) => {
              const value = (e.target as HTMLSelectElement).value
              if (value === '__new__') {
                emit('createCategory')
              } else {
                emit('changeCategory', item.id, value)
              }
            }
          "
          class="px-3 py-1.5 text-sm bg-background border border-border rounded-lg cursor-pointer transition-all duration-200 hover:border-border-hover focus:outline-none focus:ring-2 focus:ring-primary/50 opacity-0 group-hover:opacity-100 max-md:opacity-100"
          title="Change category"
        >
          <option v-for="cat in categoriesStore.allCategories" :key="cat.id" :value="cat.id">
            {{ cat.icon }} {{ cat.name }}
          </option>
          <option value="__new__" class="font-semibold">➕ New Category...</option>
        </select>

        <!-- Delete Button -->
        <IconButton
          variant="danger"
          icon="🗑️"
          title="Remove item"
          @click="emit('deleteItem', item.id)"
          class="opacity-0 group-hover:opacity-100 max-md:opacity-100"
        />
      </div>
    </div>
  </div>
</template>
