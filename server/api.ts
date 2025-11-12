import { Router } from "oak";
import { getEntries, createEntry, updateEntry, deleteEntry } from "./db.ts";
import { createJWT } from "./auth.ts";


const router = new Router();

router.prefix("/api");
// [POST] /api/login
router.post("/login", async (ctx) => {
  const body = await ctx.request.body({ type: "json" }).value;
  const { username, password } = body;


  const users: Record<string, string> = {
    admin1: "password",
    admin2: "password",
    admin3: "password",
  };

  // Prüfe, ob der Benutzer existiert und das Passwort stimmt
  if (users[username] && users[username] === password) {
    const token = await createJWT(username);
    ctx.response.body = {
      message: "Login erfolgreich!",
      token: token,
      user: { username: username },
    };
  } else {
    ctx.response.status = 401; 
    ctx.response.body = { error: "Ungültiger Benutzername oder Passwort." };
  }
});

// [C]REATE: POST /api/entries
router.post("/entries", async (ctx) => {
  const body = await ctx.request.body({ type: "json" }).value;

  if (!body.title || !body.content || !body.category) {
    ctx.response.status = 400; 
    ctx.response.body = { error: "Titel, Inhalt und Kategorie sind erforderlich." };
    return;
  }
  
  const username = (ctx.state.user as { username?: string })?.username;
  if (!username) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Kein Benutzer im Token." };
    return;
  }
  const newEntry = await createEntry(username, body.title, body.content, body.category, body.mood, body.moodColor);
  ctx.response.status = 201;
  ctx.response.body = newEntry;
});

// [R]EAD: GET /api/entries
router.get("/entries", async (ctx) => {
  const username = (ctx.state.user as { username?: string })?.username;
  if (!username) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Kein Benutzer im Token." };
    return;
  }
  const entries = await getEntries(username);
  ctx.response.body = entries;
});

// [U]PDATE: PUT /api/entries/:id
router.put("/entries/:id", async (ctx) => {
  const { id } = ctx.params; 
  const body = await ctx.request.body({ type: "json" }).value;

  if (!body.title || !body.content || !body.category) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Titel, Inhalt und Kategorie sind erforderlich." };
    return;
  }

  const username = (ctx.state.user as { username?: string })?.username;
  if (!username) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Kein Benutzer im Token." };
    return;
  }
  const updatedEntry = await updateEntry(username, id, body.title, body.content, body.category, body.mood, body.moodColor);
  if (updatedEntry) {
    ctx.response.body = updatedEntry;
  } else {
    ctx.response.status = 404; 
    ctx.response.body = { error: "Eintrag nicht gefunden." };
  }
});

// [D]ELETE: DELETE /api/entries/:id
router.delete("/entries/:id", async (ctx) => {
  const { id } = ctx.params;
  const username = (ctx.state.user as { username?: string })?.username;
  if (!username) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Kein Benutzer im Token." };
    return;
  }
  const success = await deleteEntry(username, id);

  if (success) {
    ctx.response.status = 204; 
  } else {
    ctx.response.status = 404;
    ctx.response.body = { error: "Eintrag nicht gefunden." };
  }
});

export default router;