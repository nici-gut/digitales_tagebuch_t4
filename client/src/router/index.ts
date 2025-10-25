import { createRouter, createWebHistory } from 'vue-router'
// Importiere unsere neue Login-Seite
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView
    },
    // Die Route für /about ist gelöscht.
    // Wir fügen die Tagebuch-Route später hinzu.
  ]
})

export default router