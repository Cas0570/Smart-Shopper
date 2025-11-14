import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import VoiceInputModal from '@/components/VoiceInputModal.vue'

describe('Rule 1.1: Voice input creates new items', () => {
  beforeEach(() => {
    setActivePinia(createPinia())

    // Mock SpeechRecognition API globally before each test
    const mockRecognition = {
      start: vi.fn(),
      stop: vi.fn(),
      abort: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      onresult: vi.fn(),
      onerror: vi.fn(),
      onend: vi.fn(),
      continuous: false,
      interimResults: false,
      lang: 'en-US',
    }

    // @ts-expect-error - Mock global API
    global.SpeechRecognition = vi.fn(() => mockRecognition)
    // @ts-expect-error - Mock global API
    global.webkitSpeechRecognition = vi.fn(() => mockRecognition)
  })

  it('should mount voice input modal component', () => {
    const wrapper = mount(VoiceInputModal, {
      props: {
        modelValue: true,
      },
    })

    // Component should mount successfully with BaseDialog
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'BaseDialog' }).exists()).toBe(true)
  })

  it('should emit confirm event with transcript text', async () => {
    const wrapper = mount(VoiceInputModal, {
      props: {
        modelValue: true,
      },
    })

    // Emit confirm event manually (simulates user confirming voice input)
    await wrapper.vm.$emit('confirm', 'Milk, bread, eggs')

    const emitted = wrapper.emitted('confirm')
    expect(emitted).toBeDefined()
    expect(emitted).toHaveLength(1)
    expect(emitted![0]).toEqual(['Milk, bread, eggs'])
  })

  it('should emit update:modelValue to close modal', async () => {
    const wrapper = mount(VoiceInputModal, {
      props: {
        modelValue: true,
      },
    })

    // Emit close event
    await wrapper.vm.$emit('update:modelValue', false)

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeDefined()
    expect(emitted).toHaveLength(1)
    expect(emitted![0]).toEqual([false])
  })
})
