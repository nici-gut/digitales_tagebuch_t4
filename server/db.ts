
const kv = await Deno.openKv();


export interface Entry {
  id: string;
  title: string;
  content: string;
  category: string;
  mood?: string;
  moodColor?: string; 
  createdAt: Date;
}


export async function getEntries(username: string): Promise<Entry[]> {
  console.log(`Rufe alle Einträge aus Deno KV für ${username} ab...`);
  const entries: Entry[] = [];

  const iter = kv.list<Entry>({ prefix: ["entries", username] });
  for await (const res of iter) {
    entries.push(res.value);
  }

  return entries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function createEntry(username: string, title: string, content: string, category: string, mood?: string, moodColor?: string): Promise<Entry> {
  console.log("Speichere neuen Eintrag in Deno KV...");
  const newEntry: Entry = {
    id: crypto.randomUUID(),
    title,
    content,
    category,
    mood,
    moodColor,
    createdAt: new Date(),
  };

  const key = ["entries", username, newEntry.id];
  await kv.set(key, newEntry);

  return newEntry;
}


export async function updateEntry(username: string, id: string, title: string, content: string, category: string, mood?: string, moodColor?: string): Promise<Entry | null> {
  console.log(`Aktualisiere Eintrag ${id} in Deno KV für Benutzer ${username}...`);
  const key = ["entries", username, id];

  const entryRes = await kv.get<Entry>(key);
  if (!entryRes.value) {
    return null; 
  }

  const updatedEntry: Entry = {
    ...entryRes.value, 
    title,
    content,
    category,
    mood: mood ?? entryRes.value.mood,
    moodColor: moodColor ?? entryRes.value.moodColor,
  };

  await kv.set(key, updatedEntry);
  return updatedEntry;
}

export async function deleteEntry(username: string, id: string): Promise<boolean> {
  console.log(`Lösche Eintrag ${id} aus Deno KV für Benutzer ${username}...`);
  const key = ["entries", username, id];

  const entryRes = await kv.get<Entry>(key);
  if (!entryRes.value) {
    return false;
  }

  await kv.delete(key);
  return true;
}