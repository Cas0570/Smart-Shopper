import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'lists',
      component: () => import('../views/ListsView.vue'),
    },
    {
      path: '/list/:id',
      name: 'list-detail',
      component: () => import('../views/ListDetailView.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
    },
  ],
})

export default router
