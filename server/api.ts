import { Router } from "oak";
import { getEntries, createEntry, updateEntry, deleteEntry } from "./db.ts";
import { createJWT } from "./auth.ts";

// Initialisiere einen neuen Router
const router = new Router();

// Setze ein Präfix für alle API-Routen, z.B. /api
router.prefix("/api");
// [POST] /api/login
router.post("/login", async (ctx) => {
  const body = await ctx.request.body({ type: "json" }).value;
  const { username, password } = body;

  // --- Hardcodierte Benutzerprüfung ---
  // In einer echten App würdest du hier die Deno KV-Datenbank
  // nach einem Benutzer mit diesem Passwort-Hash durchsuchen.
  if (username === "admin" && password === "password123") {
    // Benutzer ist gültig, erstelle ein Token
    const token = await createJWT(username);
    ctx.response.body = {
      message: "Login erfolgreich!",
      token: token,
      user: { username: username },
    };
  } else {
    // Ungültige Daten
    ctx.response.status = 401; // Unauthorized
    ctx.response.body = { error: "Ungültiger Benutzername oder Passwort." };
  }
});

// [C]REATE: POST /api/entries
router.post("/entries", async (ctx) => {
  const body = await ctx.request.body({ type: "json" }).value;
  // mood und moodColor sind optional aber sinnvoll
  if (!body.title || !body.content || !body.category) {
    ctx.response.status = 400; // Bad Request
    ctx.response.body = { error: "Titel, Inhalt und Kategorie sind erforderlich." };
    return;
  }
  const newEntry = await createEntry(body.title, body.content, body.category, body.mood, body.moodColor);
  ctx.response.status = 201; // Created
  ctx.response.body = newEntry;
});

// [R]EAD: GET /api/entries
router.get("/entries", async (ctx) => {
  const entries = await getEntries();
  ctx.response.body = entries;
});

// [U]PDATE: PUT /api/entries/:id
router.put("/entries/:id", async (ctx) => {
  const { id } = ctx.params; // Holt die :id aus der URL
  const body = await ctx.request.body({ type: "json" }).value;

  if (!body.title || !body.content || !body.category) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Titel, Inhalt und Kategorie sind erforderlich." };
    return;
  }

  const updatedEntry = await updateEntry(id, body.title, body.content, body.category, body.mood, body.moodColor);
  if (updatedEntry) {
    ctx.response.body = updatedEntry;
  } else {
    ctx.response.status = 404; // Not Found
    ctx.response.body = { error: "Eintrag nicht gefunden." };
  }
});

// [D]ELETE: DELETE /api/entries/:id
router.delete("/entries/:id", async (ctx) => {
  const { id } = ctx.params;
  const success = await deleteEntry(id);

  if (success) {
    ctx.response.status = 204; // No Content
  } else {
    ctx.response.status = 404;
    ctx.response.body = { error: "Eintrag nicht gefunden." };
  }
});

export default router;