import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Definiere den "auth" Store
export const useAuthStore = defineStore('auth', () => {
  // === ZUSTAND (State) ===
  
  // Wir laden das Token und den User direkt aus dem localStorage.
  // Das erfüllt die Anforderung "nahtlos weiterarbeiten", da der
  // Login-Status einen Refresh überlebt!
  const token = ref<string | null>(localStorage.getItem('token') || null)
  const user = ref<{ username: string } | null>(
    JSON.parse(localStorage.getItem('user') || 'null')
  )

  // Hol die API-URL aus der .env Datei
  const API_URL = import.meta.env.VITE_API_URL

  // === GETTERS (Computed Properties) ===
  const isAuthenticated = computed(() => !!token.value)
  const authHeader = computed(() => ({
    'Authorization': `Bearer ${token.value}`
  }))

  // === AKTIONEN (Actions) ===

  /**
   * Versucht, den Benutzer einzuloggen.
   * Bei Erfolg werden Token und User im State UND im localStorage gespeichert.
   */
  async function login(username: string, password: string) {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    if (!res.ok) {
      // Wenn der Server 401 (Unauthorized) o.ä. sendet, wirf einen Fehler
      throw new Error('Login fehlgeschlagen')
    }

    const data = await res.json()
    
    // Speichere die Daten im State (Pinia)
    token.value = data.token
    user.value = data.user

    // Speichere die Daten persistent im localStorage
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  /**
   * Loggt den Benutzer aus.
   */
  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // Gib alles zurück, was die Komponenten verwenden dürfen
  return {
    token,
    user,
    isAuthenticated,
    authHeader,
    login,
    logout,
  }
})