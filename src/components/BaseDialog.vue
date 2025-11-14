<script setup lang="ts">
interface Props {
  modelValue: boolean
  maxWidth?: string
}

withDefaults(defineProps<Props>(), {
  maxWidth: '500px',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const close = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="animate-[fadeIn_0.2s_ease-out]"
      leave-active-class="animate-[fadeOut_0.2s_ease-out]"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-1000 p-4"
        @click="close"
      >
        <Transition
          enter-active-class="animate-[slideUp_0.3s_ease-out]"
          leave-active-class="animate-[slideDown_0.3s_ease-out]"
        >
          <div
            v-if="modelValue"
            class="bg-white rounded-2xl p-8 w-full shadow-xl max-md:p-6"
            :style="{ maxWidth }"
            @click.stop
          >
            <slot />
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
