<script setup lang="ts">
import { ref } from 'vue'
import { BaseCard, BaseButton, ConfirmDialog } from '@/components'
import { useBackup } from '@/composables/useBackup'
import { useToastNotifications } from '@/composables/useToastNotifications'

const { downloadBackup, importBackupFromFile } = useBackup()
const toastStore = useToastNotifications()

const exporting = ref(false)
const importing = ref(false)
const showConfirm = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)

const handleExportBackup = async () => {
  try {
    exporting.value = true
    await downloadBackup()
    toastStore.showSuccess('Backup exported successfully!')
  } catch (error) {
    console.error('Failed to export backup:', error)
    toastStore.showError('Failed to export backup')
  } finally {
    exporting.value = false
  }
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    selectedFile.value = file
    showConfirm.value = true
  }
}

const handleConfirmImport = async () => {
  if (!selectedFile.value) return

  try {
    importing.value = true
    await importBackupFromFile(selectedFile.value, { merge: false })
    toastStore.showSuccess('Backup imported successfully!')

    // Clear the file input
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
    selectedFile.value = null

    // Reload the page to reflect the restored data
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  } catch (error) {
    console.error('Failed to import backup:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to import backup. Please check the file.'
    toastStore.showError(errorMessage)

    // Clear the file input on error too
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
    selectedFile.value = null
  } finally {
    importing.value = false
  }
}
</script>

<template>
  <BaseCard class="p-6">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">💾 Backup & Restore</h2>
    <p class="text-gray-600 mb-6">
      Export your lists, items, and settings to a backup file. You can restore this backup later if
      you need to recover your data.
    </p>

    <div class="space-y-4">
      <!-- Export Backup -->
      <div class="flex items-start gap-4">
        <div class="flex-1">
          <h3 class="font-semibold text-gray-900 mb-1">Export Backup</h3>
          <p class="text-sm text-gray-600">
            Download all your data as a JSON file. This includes all lists, items, custom
            categories, products, and preferences.
          </p>
        </div>
        <BaseButton @click="handleExportBackup" :disabled="exporting" variant="secondary">
          <span v-if="!exporting">📥 Export</span>
          <span v-else>⏳ Exporting...</span>
        </BaseButton>
      </div>

      <div class="border-t border-gray-200"></div>

      <!-- Import Backup -->
      <div class="flex items-start gap-4">
        <div class="flex-1">
          <h3 class="font-semibold text-gray-900 mb-1">Import Backup</h3>
          <p class="text-sm text-gray-600">
            Restore data from a backup file. This will replace all your current data with the backup
            contents.
          </p>
        </div>
        <div class="flex flex-col gap-2">
          <input
            ref="fileInputRef"
            type="file"
            accept=".json"
            @change="handleFileSelect"
            class="hidden"
          />
          <BaseButton @click="triggerFileInput" :disabled="importing" variant="secondary">
            <span v-if="!importing">📤 Import</span>
            <span v-else>⏳ Importing...</span>
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseCard>

  <!-- Confirmation Dialog -->
  <ConfirmDialog
    v-model="showConfirm"
    title="Import Backup?"
    message="This will replace all your current data with the backup. Are you sure you want to continue?"
    confirm-text="Import Backup"
    cancel-text="Cancel"
    @confirm="handleConfirmImport"
  />
</template>
