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
      <select v-model="newEntryCategory" class="category-select">
        <option value="" disabled>Kategorie wählen...</option>
        <option v-for="category in categories" :key="category" :value="category">
          {{ category }}
        </option>
      </select>
      <button @click="addEntry">Speichern</button>
    </div>

    <hr />

    <h2>Deine Einträge</h2>
    <div class="filter-section">
      <select v-model="selectedFilter" class="category-filter">
        <option value="">Alle Kategorien</option>
        <option v-for="category in categories" :key="category" :value="category">
          {{ category }}
        </option>
      </select>
    </div>
    <ul class="entry-list">
      <li v-if="loading">Lade Einträge...</li>
      <li v-if="!loading && entries.length === 0">Noch keine Einträge vorhanden.</li>
      
      <li v-for="entry in filteredEntries" :key="entry.id">
        
        <template v-if="editingEntryId === entry.id">
          <div class="content">
            <input type="text" v-model="editTitle" class="edit-input" />
            <textarea v-model="editContent" class="edit-input" rows="4"></textarea>
            <select v-model="editCategory" class="category-select">
              <option value="" disabled>Kategorie wählen...</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
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
            <span class="entry-category">{{ entry.category }}</span>
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
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'

// Interface für einen Eintrag (muss mit db.ts übereinstimmen)
interface Entry {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: Date;
}

// Verfügbare Kategorien
const categories = [
  'Persönlich',
  'Reisen',
  'Finanzen',
  'Gesundheit & Fitness',
  'Arbeit & Studium',
  'Projekte',
  'Träume & Ziele',
  'Familie & Freunde',
  'Hobbys & Freizeit',
  'Essen & Rezepte'
]

const authStore = useAuthStore()
const loading = ref(true)
const entries = ref<Entry[]>([])

// Formular-Daten für neuen Eintrag
const newEntryTitle = ref('')
const newEntryContent = ref('')
const newEntryCategory = ref('')
const selectedFilter = ref('')

// Refs für den Bearbeitungs-Zustand
const editingEntryId = ref<string | null>(null) // ID des Eintrags, der bearbeitet wird
const editTitle = ref('') // Temporärer Titel während der Bearbeitung
const editContent = ref('') // Temporärer Inhalt während der Bearbeitung
const editCategory = ref('') // Temporäre Kategorie während der Bearbeitung

// Computed property für gefilterte Einträge
const filteredEntries = computed(() => {
  if (!selectedFilter.value) return entries.value
  return entries.value.filter(entry => entry.category === selectedFilter.value)
})

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
  if (!newEntryTitle.value.trim() || !newEntryContent.value.trim() || !newEntryCategory.value) {
    alert('Bitte Titel, Inhalt und Kategorie eingeben.')
    return
  }
  try {
    const res = await authStore.fetchWithAuth('/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newEntryTitle.value,
        content: newEntryContent.value,
        category: newEntryCategory.value
      })
    })
    
    if (!res.ok) throw new Error('Fehler beim Speichern')

    // Formular leeren und Liste neu laden
    newEntryTitle.value = ''
    newEntryContent.value = ''
    newEntryCategory.value = ''
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
  editCategory.value = entry.category
}

// Wird aufgerufen, wenn "Abbrechen" geklickt wird
function cancelEdit() {
  // Setze den Zustand zurück
  editingEntryId.value = null
  editTitle.value = ''
  editContent.value = ''
  editCategory.value = ''
}

// Wird aufgerufen, wenn "Speichern" geklickt wird
async function saveEntry(id: string) {
  if (!editTitle.value.trim() || !editContent.value.trim() || !editCategory.value) {
    alert('Titel, Inhalt und Kategorie dürfen nicht leer sein.')
    return
  }
  
  try {
    const res = await authStore.fetchWithAuth(`/entries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editTitle.value,
        content: editContent.value,
        category: editCategory.value
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
hr {
  border: none;
  border-top: 1px solid #e0e0e0;
  margin: 2rem 0;
}

h2 {
  color: #5c6bc0; 
  text-align: left;
  border-bottom: 2px solid #5c6bc0;
  padding-bottom: 0.5rem;
}

.header {
  display: flex;
  flex-wrap: wrap; 
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}
.header h1 {
  margin: 0;
  text-align: left;
  color: #5c6bc0; 
}
.header span {
  margin-right: 1rem;
  color: #333;
}
.logout-btn {
  width: auto;
  background: #bdbdbd; 
}
.logout-btn:hover {
  background: #9e9e9e;
}

.card button {
  background: #5c6bc0; 
}
.card button:hover {
  background: #7986cb;
}


.entry-list {
  list-style: none;
  padding: 0;
  

  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem; 
}

.entry-list li {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.entry-list li:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.12);
}

.content {
  flex-grow: 1; 
}
.content strong {
  display: block;
  margin-bottom: 0.5rem;
  color: #5c6bc0; 
  font-size: 1.2rem;
}
.content p {
  margin: 0.5rem 0;
  white-space: pre-wrap; 
}
.content small {
  color: #777;
  display: block;
  margin-top: 1rem;
}

.actions {
  display: flex;
  flex-direction: row; 
  gap: 0.5rem;
  margin-top: 1.5rem;
  flex-shrink: 0;
}
.actions button {
  flex-grow: 1;
  width: auto; 
  font-size: 0.9rem;
}

.edit-btn { 
  background: #64b5f6; 
}
.edit-btn:hover { 
  background: #42a5f5; 
}

.delete-btn { 
  background: #e57373; 
}
.delete-btn:hover { 
  background: #ef5350; 
}

.save-btn { 
  background: #81c784;    
}
.save-btn:hover { 
  background: #66bb6a; 
}

.cancel-btn { 
  background: #bdbdbd;  
}
.cancel-btn:hover { 
  background: #9e9e9e; 
}

.category-select, .category-filter {
  width: 100%;
  padding: 8px;
  margin: 8px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.filter-section {
  margin-bottom: 20px;
}

.entry-category {
  display: inline-block;
  background-color: #e0e0e0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  color: #666;
}




.edit-input {
  width: calc(100% - 1.2rem);
  padding: 0.6rem;
  margin-bottom: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  font-family: Arial, sans-serif;
}
</style>