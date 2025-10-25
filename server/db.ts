// Öffne die Deno KV Datenbank.
// Deno KV speichert die Daten persistent in einer lokalen Datei.
const kv = await Deno.openKv();

// Das Interface bleibt dasselbe
export interface Entry {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

// --- ECHTE Datenbank-Funktionen mit Deno KV ---

// Holt alle Einträge
export async function getEntries(): Promise<Entry[]> {
  console.log("Rufe alle Einträge aus Deno KV ab...");
  const entries: Entry[] = [];

  // kv.list() durchsucht Einträge. Wir nutzen ein "Präfix", 
  // um alle Schlüssel zu finden, die mit ["entries"] beginnen.
  const iter = kv.list<Entry>({ prefix: ["entries"] });
  for await (const res of iter) {
    entries.push(res.value);
  }

  // Sortiere sie nach Datum (neueste zuerst)
  return entries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// Erstellt einen neuen Eintrag
export async function createEntry(title: string, content: string): Promise<Entry> {
  console.log("Speichere neuen Eintrag in Deno KV...");
  const newEntry: Entry = {
    id: crypto.randomUUID(),
    title,
    content,
    createdAt: new Date(),
  };

  // Speichere den Eintrag unter einem eindeutigen Schlüssel (Array von Strings)
  const key = ["entries", newEntry.id];
  await kv.set(key, newEntry);

  return newEntry;
}

// Aktualisiert einen Eintrag
export async function updateEntry(id: string, title: string, content: string): Promise<Entry | null> {
  console.log(`Aktualisiere Eintrag ${id} in Deno KV...`);
  const key = ["entries", id];

  // 1. Hole den bestehenden Eintrag
  const entryRes = await kv.get<Entry>(key);
  if (!entryRes.value) {
    return null; // Nicht gefunden
  }

  // 2. Erstelle den aktualisierten Eintrag
  const updatedEntry: Entry = {
    ...entryRes.value, // Behalte alte Werte wie id und createdAt bei
    title,
    content,
  };

  // 3. Überschreibe den alten Eintrag am selben Schlüssel
  await kv.set(key, updatedEntry);
  return updatedEntry;
}

// Löscht einen Eintrag
export async function deleteEntry(id: string): Promise<boolean> {
  console.log(`Lösche Eintrag ${id} aus Deno KV...`);
  const key = ["entries", id];

  // Prüfen, ob der Eintrag überhaupt existiert
  const entryRes = await kv.get<Entry>(key);
  if (!entryRes.value) {
    return false; // Nicht gefunden
  }

  // Eintrag löschen
  await kv.delete(key);
  return true;
}