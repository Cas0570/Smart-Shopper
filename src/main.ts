import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { registerSW } from 'virtual:pwa-register'
import App from './App.vue'
import router from './router'

// Store the update function for potential future use
registerSW({
  onNeedRefresh() {
    console.log('New content available, please refresh.')
    // Could show a toast notification here
  },
  onOfflineReady() {
    console.log('App ready to work offline')
    // Could show a toast notification here
  },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
