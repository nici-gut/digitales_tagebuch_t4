import { Application, send } from "oak";
import apiRouter from "./api.ts";
import { verifyJWT } from "./auth.ts";

const app = new Application();
const port = 8000;

// --- CORS Middleware ---
app.use(async (ctx, next) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  ctx.response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (ctx.request.method === "OPTIONS") {
    ctx.response.status = 204;
    return;
  }
  await next();
});

// --- Logging ---
app.use(async (ctx, next) => {
  console.log(`[${ctx.request.method}] ${ctx.request.url}`);
  await next();
});

// --- Auth-Middleware (Schützt nur API) ---
app.use(async (ctx, next) => {
  const path = ctx.request.url.pathname;
  // Nur API-Pfade schützen
  if (path.startsWith("/api/entries")) {
    const authHeader = ctx.request.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];
    if (!token) {
      ctx.response.status = 401;
      ctx.response.body = { error: "Nicht autorisiert" };
      return;
    }

    // Token verifizieren und das Payload in ctx.state.user speichern
    const payload = await verifyJWT(token);
    if (!payload) {
      ctx.response.status = 401;
      ctx.response.body = { error: "Nicht autorisiert" };
      return;
    }

    // payload enthält das Feld `username` (wie beim Erstellen gesetzt)
    // sicherstellen, dass ctx.state existiert und den Benutzer setzen
    const p = payload as { username?: string };
    ctx.state.user = { username: p.username };
  }
  await next();
});

// --- API Routen ---
app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

// --- Frontend ausliefern (WICHTIG FÜR DOCKER) ---
// Wenn keine API-Route getroffen wurde, sende die Frontend-Dateien.
app.use(async (ctx) => {
  try {
    // Versuche Datei aus dem Ordner /static zu senden (dort landet das Frontend im Docker)
    await send(ctx, ctx.request.url.pathname, {
      root: `${Deno.cwd()}/static`,
      index: "index.html",
    });
  } catch {
    
    try {
      await send(ctx, "index.html", {
        root: `${Deno.cwd()}/static`,
      });
    } catch {
      ctx.response.status = 404;
      ctx.response.body = "Frontend nicht gefunden (Lokal bitte npm run dev nutzen)";
    }
  }
});

// --- Start ---
console.log(`Server läuft auf https://localhost:${port}`);
await app.listen({
  port: port,
  cert: await Deno.readTextFile("./localhost.pem"),
  key: await Deno.readTextFile("./localhost-key.pem"),
});