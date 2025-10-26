<template>
  <div>
    <header class="header">
      <h1>Digitales Tagebuch</h1>
      <div>
        <span>Hallo, {{ authStore.user?.username }}!</span>
        <button @click="handleLogout" class="logout-btn">
          Ausloggen
        </button>
      </div>
    </header>

    <div class="card">
      <h2>Neuer Eintrag</h2>
      <input 
        type="text" 
        v-model="newEntryTitle"
        placeholder="Titel..." 
      />
      <textarea 
        v-model="newEntryContent"
        placeholder="Dein Eintrag..."
        rows="4"
      ></textarea>
      <button @click="addEntry">Speichern</button>
    </div>

    <hr />

    <h2>Deine Einträge</h2>
    <ul class="entry-list">
      <li v-if="loading">Lade Einträge...</li>
      <li v-if="!loading && entries.length === 0">Noch keine Einträge vorhanden.</li>
      
      <li v-for="entry in entries" :key="entry.id">
        
        <template v-if="editingEntryId === entry.id">
          <div class="content">
            <input type="text" v-model="editTitle" class="edit-input" />
            <textarea v-model="editContent" class="edit-input" rows="4"></textarea>
          </div>
          <div class="actions">
            <button @click="saveEntry(entry.id)" class="save-btn">
              Speichern
            </button>
            <button @click="cancelEdit" class="cancel-btn">
              Abbrechen
            </button>
          </div>
        </template>

        <template v-else>
          <div class="content">
            <strong>{{ entry.title }}</strong>
            <p>{{ entry.content }}</p>
            <small>{{ new Date(entry.createdAt).toLocaleString('de-DE') }}</small>
          </div>
          <div class="actions">
            <button @click="toggleEdit(entry)" class="edit-btn">
              Bearbeiten
            </button>
            <button @click="deleteEntry(entry.id)" class="delete-btn">
              Löschen
            </button>
          </div>
        </template>

      </li>
    </ul>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'

// Interface für einen Eintrag (muss mit db.ts übereinstimmen)
interface Entry {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

const authStore = useAuthStore()
const loading = ref(true)
const entries = ref<Entry[]>([])

// Formular-Daten für neuen Eintrag
const newEntryTitle = ref('')
const newEntryContent = ref('')

// Refs für den Bearbeitungs-Zustand
const editingEntryId = ref<string | null>(null) // ID des Eintrags, der bearbeitet wird
const editTitle = ref('') // Temporärer Titel während der Bearbeitung
const editContent = ref('') // Temporärer Inhalt während der Bearbeitung

// --- READ ---
// Lädt alle Einträge vom Server
async function loadEntries() {
  loading.value = true
  try {
    const res = await authStore.fetchWithAuth('/entries') // Unser neuer Helfer
    if (!res.ok) throw new Error('Fehler beim Laden der Einträge')
    entries.value = await res.json()
  } catch (error) {
    console.error(error)
    // Fehlerbehandlung (z.B. 401) passiert automatisch im Store
  } finally {
    loading.value = false
  }
}

// --- CREATE ---
// Speichert einen neuen Eintrag
async function addEntry() {
  if (!newEntryTitle.value.trim() || !newEntryContent.value.trim()) {
    alert('Bitte Titel und Inhalt eingeben.')
    return
  }
  try {
    const res = await authStore.fetchWithAuth('/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newEntryTitle.value,
        content: newEntryContent.value
      })
    })
    
    if (!res.ok) throw new Error('Fehler beim Speichern')

    // Formular leeren und Liste neu laden
    newEntryTitle.value = ''
    newEntryContent.value = ''
    await loadEntries()
  } catch (error) {
    console.error(error)
  }
}

// --- DELETE ---
// Löscht einen Eintrag
async function deleteEntry(id: string) {
  if (!confirm('Bist du sicher, dass du diesen Eintrag löschen möchtest?')) {
    return
  }
  try {
    const res = await authStore.fetchWithAuth(`/entries/${id}`, {
      method: 'DELETE'
    })
    
    if (!res.ok) throw new Error('Fehler beim Löschen')
    
    // Liste neu laden, um den gelöschten Eintrag zu entfernen
    await loadEntries()
  } catch (error) {
    console.error(error)
  }
}

// --- UPDATE (Bearbeiten) ---

// Wird aufgerufen, wenn "Bearbeiten" geklickt wird
function toggleEdit(entry: Entry) {
  // Setze den Zustand auf diesen Eintrag
  editingEntryId.value = entry.id
  // Fülle die Formularfelder mit den aktuellen Daten
  editTitle.value = entry.title
  editContent.value = entry.content
}

// Wird aufgerufen, wenn "Abbrechen" geklickt wird
function cancelEdit() {
  // Setze den Zustand zurück
  editingEntryId.value = null
  editTitle.value = ''
  editContent.value = ''
}

// Wird aufgerufen, wenn "Speichern" geklickt wird
async function saveEntry(id: string) {
  if (!editTitle.value.trim() || !editContent.value.trim()) {
    alert('Titel und Inhalt dürfen nicht leer sein.')
    return
  }
  
  try {
    const res = await authStore.fetchWithAuth(`/entries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editTitle.value,
        content: editContent.value
      })
    })

    if (!res.ok) throw new Error('Fehler beim Aktualisieren')

    // Zustand zurücksetzen
    cancelEdit()
    // Liste neu laden, um die Änderungen anzuzeigen
    await loadEntries()

  } catch (error) {
    console.error(error)
  }
}

// --- LOGOUT ---
function handleLogout() {
  authStore.logout() // Leitet dank unserer Store-Änderung automatisch weiter
}

// Beim Laden der Komponente: Einträge abrufen
onMounted(() => {
  loadEntries()
})
</script>

<style scoped>
/* Diese Styles sind inspiriert von deiner index.html */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.header h1 {
  margin: 0;
  text-align: left;
}
.header span {
  margin-right: 1rem;
}
.logout-btn {
  width: auto; /* Buttons im Header sollen nicht 100% breit sein */
  background: #666;
}
.logout-btn:hover {
  background: #888;
}

.entry-list {
  list-style: none;
  padding: 0;
}
.entry-list li {
  background: #fff;
  margin: 1rem 0;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.content {
  flex-grow: 1;
}
.content strong {
  display: block;
  margin-bottom: 0.5rem;
  color: #4a148c;
  font-size: 1.2rem;
}
.content p {
  margin: 0.5rem 0;
}
.content small {
  color: #777;
}
.actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-left: 1rem;
  flex-shrink: 0;
}
.actions button {
  width: 100px;
}
.edit-btn {
  background: #1e88e5;
}
.edit-btn:hover {
  background: #1565c0;
}
.delete-btn {
  background: #e53935;
}
.delete-btn:hover {
  background: #c62828;
}

/* Styles für Bearbeiten-Modus */
.save-btn {
  background: #4caf50; /* Grün */
}
.save-btn:hover {
  background: #43a047;
}
.cancel-btn {
  background: #757575; /* Grau */
}
.cancel-btn:hover {
  background: #616161;
}
.edit-input {
  /* Nutze die globalen Styles, aber mit 100% Breite */
  width: calc(100% - 1.2rem);
  padding: 0.6rem;
  margin-bottom: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  font-family: Arial, sans-serif;
}
</style>