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
    <button @click="handleLogin">
      Einloggen
    </button>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script setup lang="ts">
// Importiere 'ref', um reaktive Variablen zu erstellen
import { ref } from 'vue'

// 'v-model' bindet diese Variablen an die Input-Felder
const username = ref('admin') // Vorbelegt für einfaches Testen
const password = ref('password123') // Vorbelegt für einfaches Testen
const errorMessage = ref('')

// Diese Funktion wird beim Klick auf den Button aufgerufen
async function handleLogin() {
  // Setze Fehler zurück
  errorMessage.value = ''
  
  // Logik kommt in Schritt 8
  console.log('Login-Versuch mit:', username.value, password.value)
  alert('Login-Logik fehlt noch!')
}
</script>

<style scoped>
/* 'scoped' bedeutet, dass dieses CSS NUR für diese Komponente gilt */
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
</style>