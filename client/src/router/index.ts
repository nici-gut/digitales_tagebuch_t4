import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import { useAuthStore } from '@/stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView
    },
    {
  
      path: '/tagebuch',
      name: 'tagebuch',
      
      component: () => import('../views/TagebuchView.vue'),
      
      meta: { requiresAuth: true }
    }
  ]
})

// --- DIE NAVIGATIONS-WACHE ---
router.beforeEach((to, from, next) => {
 
  const authStore = useAuthStore()

  // 1. Prüfen, ob die Seite (wie '/tagebuch') 'requiresAuth' hat
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // A: Nicht eingeloggt -> Umleitung zum Login
    next({ name: 'login' })
  } 
  // 2. Prüfen, ob ein eingeloggter User versucht, die Login-Seite zu besuchen
  else if (to.name === 'login' && authStore.isAuthenticated) {
    // B: Eingeloggt -> Umleitung zum Tagebuch (weg vom Login)
    next({ name: 'tagebuch' })
  } 
  // 3. In allen anderen Fällen
  else {
    // C: Navigation erlauben
    next()
  }
})

export default router