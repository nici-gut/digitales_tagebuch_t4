<template>
  <div class="card">
    <h2>Digitales Tagebuch Login</h2>
    
    <div>
      <select v-model="username" class="text-input">
        <option value="" disabled>Benutzer wählen...</option>
        <option value="admin1">Admin1</option>
        <option value="admin2">Admin2</option>
        <option value="admin3">Admin3</option>
      </select>
    </div>
    <div>
      <input 
        v-model="password" 
        type="password" 
        placeholder="Passwort" 
        class="text-input"
      />
    </div>
    <button @click="handleLogin" :disabled="isLoading" class="text-input login-btn">
      {{ isLoading ? 'Logge ein...' : 'Einloggen' }}
    </button>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

// Initialisiere den Store und den Router
const authStore = useAuthStore()
const router = useRouter()

async function handleLogin() {
  errorMessage.value = ''
  isLoading.value = true
  
  try {
    // Rufe die login-Aktion aus dem Store auf
    await authStore.login(username.value, password.value)
    
    // Login war erfolgreich!
    // Leite den Benutzer zur (noch zu erstellenden) Tagebuch-Seite weiter
    router.push('/tagebuch')

  } catch (error) {
    // Die 'login'-Aktion hat einen Fehler geworfen (z.B. 401)
    errorMessage.value = 'Login fehlgeschlagen. Bitte prüfe deine Daten.'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.card {
  max-width: 400px;
}
div {
  margin-bottom: 0.5rem;
}
.error {
  color: #e53935;
  text-align: center;
  margin-top: 1rem;
}
button:disabled {
  background-color: #9e9e9e;
  cursor: not-allowed;
}

.text-input {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box;
  display: block;
}

.login-btn {
  background-color: #5c6bc0;
  color: #fff;
  border: none;
  cursor: pointer;
}
.login-btn:hover:not(:disabled) {
  background-color: #7986cb;
}
</style>