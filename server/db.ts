// Ein Interface, das beschreibt, wie ein Tagebucheintrag aussieht
export interface Entry {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

// Temporäre In-Memory-Datenbank (wird bei jedem Server-Neustart zurückgesetzt)
// Wir füllen sie mit einem Beispiel-Eintrag.
const entries: Entry[] = [
  {
    id: "1",
    title: "Mein erster Eintrag",
    content: "Hallo Welt! Dies ist mein erstes digitales Tagebuch.",
    createdAt: new Date(),
  },
];

// --- Datenbank-Funktionen (noch als Platzhalter) ---

// Holt alle Einträge
export async function getEntries(): Promise<Entry[]> {
  console.log("Rufe alle Einträge ab...");
  return await Promise.resolve(entries); // Simuliert eine asynchrone DB-Abfrage
}

// Erstellt einen neuen Eintrag
export async function createEntry(title: string, content: string): Promise<Entry> {
  console.log("Erstelle neuen Eintrag...");
  const newEntry: Entry = {
    id: crypto.randomUUID(), // Erzeugt eine zufällige, einzigartige ID
    title,
    content,
    createdAt: new Date(),
  };
  entries.push(newEntry);
  return await Promise.resolve(newEntry);
}

// Aktualisiert einen Eintrag
export async function updateEntry(id: string, title: string, content: string): Promise<Entry | null> {
  console.log(`Aktualisiere Eintrag ${id}...`);
  const entry = entries.find((e) => e.id === id);
  if (entry) {
    entry.title = title;
    entry.content = content;
    return await Promise.resolve(entry);
  }
  return await Promise.resolve(null); // Eintrag nicht gefunden
}

// Löscht einen Eintrag
export async function deleteEntry(id: string): Promise<boolean> {
  console.log(`Lösche Eintrag ${id}...`);
  const index = entries.findIndex((e) => e.id === id);
  if (index > -1) {
    entries.splice(index, 1); // Entfernt den Eintrag aus dem Array
    return await Promise.resolve(true);
  }
  return await Promise.resolve(false); // Eintrag nicht gefunden
}