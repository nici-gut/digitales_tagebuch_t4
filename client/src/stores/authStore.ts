import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router' 

export const useAuthStore = defineStore('auth', () => {

  const token = ref<string | null>(localStorage.getItem('token') || null)
  const user = ref<{ username: string } | null>(
    JSON.parse(localStorage.getItem('user') || 'null')
  )
  const API_URL = import.meta.env.VITE_API_URL
  
  
  const router = useRouter()

  const isAuthenticated = computed(() => !!token.value)
  const authHeader = computed(() => ({
    'Authorization': `Bearer ${token.value}`
  }))


  async function login(username: string, password: string) {
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

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push({ name: 'login' })
  }

  
  async function fetchWithAuth(urlPath: string, options: RequestInit = {}) {
    const res = await fetch(`${API_URL}${urlPath}`, {
      ...options,
      headers: {
        ...options.headers,
        ...authHeader.value
      }
    });

    if (res.status === 401) {
      logout()
      throw new Error('Unauthorized - Logging out')
    }
    return res
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    fetchWithAuth
  }
})