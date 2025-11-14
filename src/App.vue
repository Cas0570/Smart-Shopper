<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { usePreferencesStore } from '@/stores/preferences'
import { useCategoriesStore } from '@/stores/categories'

// Load user preferences and custom categories on app mount
const preferencesStore = usePreferencesStore()
const categoriesStore = useCategoriesStore()
onMounted(async () => {
  await Promise.all([preferencesStore.loadPreferences(), categoriesStore.loadCustomCategories()])
})
</script>

<template>
  <div id="app">
    <header
      class="sticky top-0 z-100 bg-linear-to-br from-(--color-primary) to-(--color-primary-dark) shadow-md"
    >
      <div class="max-w-7xl mx-auto px-4 md:px-6 py-4">
        <div class="flex items-center gap-2">
          <h1
            class="text-xl md:text-2xl font-bold text-white tracking-tight [text-shadow:0_2px_4px_rgba(0,0,0,0.1)]"
          >
            Smart Shopper
          </h1>
        </div>
      </div>
    </header>
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6">
      <RouterView />
    </main>
  </div>
</template>
