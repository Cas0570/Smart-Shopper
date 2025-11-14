<script setup lang="ts">
import { BackButton, CategoryOrderSettings, BackupSettings } from '@/components'
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-6 max-w-3xl">
      <div class="mb-6">
        <BackButton />
      </div>

      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
        <p class="text-lg text-gray-600">Customize your shopping experience</p>
      </div>

      <div class="space-y-6">
        <CategoryOrderSettings />
        <BackupSettings />
      </div>
    </div>
  </div>
</template>
