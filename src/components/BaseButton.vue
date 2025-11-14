<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
  as?: 'button' | 'label'
  icon?: string
  title?: string
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  fullWidth: false,
  type: 'button',
  as: 'button',
})

const variantClasses = {
  primary:
    'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white shadow-sm hover:-translate-y-0.5 hover:shadow-md',
  secondary:
    'bg-white text-[var(--color-text)] border-2 border-[var(--color-border)] hover:bg-[var(--color-background)] hover:border-[var(--color-border-hover)]',
  danger:
    'bg-gradient-to-br from-[#f87171] to-[var(--color-error)] text-white shadow-sm hover:-translate-y-0.5 hover:shadow-md',
  ghost:
    'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-background)] hover:text-[var(--color-primary)]',
  icon: 'bg-white/20 border-0 text-white hover:bg-white/30 hover:scale-105 min-w-10 min-h-10 p-2',
}

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}
</script>

<template>
  <component
    :is="as"
    :type="as === 'button' ? type : undefined"
    :disabled="disabled"
    :title="title"
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer',
      variantClasses[variant],
      variant === 'icon' ? 'text-xl' : sizeClasses[size],
      {
        'opacity-50 cursor-not-allowed transform-none': disabled,
        'w-full': fullWidth,
      },
    ]"
  >
    <span v-if="icon">{{ icon }}</span>
    <slot />
  </component>
</template>
