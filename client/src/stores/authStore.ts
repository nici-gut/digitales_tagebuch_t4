import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router' // Router importieren

export const useAuthStore = defineStore('auth', () => {
  // === STATE (bleibt gleich) ===
  const token = ref<string | null>(localStorage.getItem('token') || null)
  const user = ref<{ username: string } | null>(
    JSON.parse(localStorage.getItem('user') || 'null')
  )
  const API_URL = import.meta.env.VITE_API_URL
  
  // NEU: Router initialisieren
  const router = useRouter()

  // === GETTERS (bleiben gleich) ===
  const isAuthenticated = computed(() => !!token.value)
  const authHeader = computed(() => ({
    'Authorization': `Bearer ${token.value}`
  }))

  // === AKTIONEN (aktualisiert) ===

  async function login(username: string, password: string) {
    // ... (login-Funktion bleibt unverändert)
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) throw new Error('Login fehlgeschlagen')
    const data = await res.json()
    token.value = data.token
    user.value = data.user
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  /**
   * AKTUALISIERT: Leert den State UND leitet zum Login weiter
   */
  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // Leite den User immer zur Login-Seite
    router.push({ name: 'login' })
  }

  /**
   * NEU: Ein Helfer für authentifizierte API-Aufrufe
   */
  async function fetchWithAuth(urlPath: string, options: RequestInit = {}) {
    const res = await fetch(`${API_URL}${urlPath}`, {
      ...options,
      headers: {
        ...options.headers,
        ...authHeader.value
      }
    });

    if (res.status === 401) {
      // Token ungültig oder abgelaufen!
      // Automatisch ausloggen.
      logout()
      throw new Error('Unauthorized - Logging out')
    }
    return res
  }

  return {
    token,
    user,
    isAuthenticated,
    // authHeader wird jetzt intern genutzt, wir müssen es nicht mehr exportieren
    login,
    logout,
    fetchWithAuth // NEU
  }
})