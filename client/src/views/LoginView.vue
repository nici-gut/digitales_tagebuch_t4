<template>
  <div class="card">
    <h2>Digitales Tagebuch Login</h2>
    
    <div>
      <input 
        v-model="username" 
        type="text" 
        placeholder="Benutzername" 
      />
    </div>
    <div>
      <input 
        v-model="password" 
        type="password" 
        placeholder="Passwort" 
      />
    </div>
    <button @click="handleLogin" :disabled="isLoading">
      {{ isLoading ? 'Logge ein...' : 'Einloggen' }}
    </button>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// Importiere unseren neuen Auth-Store
import { useAuthStore } from '@/stores/authStore'
// Importiere den Vue Router, um weiterzuleiten
import { useRouter } from 'vue-router'

const username = ref('admin')
const password = ref('password123')
const errorMessage = ref('')
const isLoading = ref(false) // Für Lade-Feedback

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
/* Die Styles bleiben unverändert */
.card {
  max-width: 400px;
}
div {
  margin-bottom: 0.5rem;
}
.error {
  color: #e53935; /* Rot */
  text-align: center;
  margin-top: 1rem;
}
/* Style für deaktivierten Button */
button:disabled {
  background-color: #9e9e9e;
  cursor: not-allowed;
}
</style>