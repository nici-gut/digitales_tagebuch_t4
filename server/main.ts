import { Application } from "oak";
import apiRouter from "./api.ts";
import { verifyJWT } from "./auth.ts"; // Importiere die verifyJWT Funktion

const app = new Application();
const port = 8000;

// --- CORS Middleware (bleibt gleich) ---
app.use(async (ctx, next) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "http://localhost:5173"); 
  ctx.response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  ctx.response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (ctx.request.method === "OPTIONS") {
    ctx.response.status = 204;
  } else {
    await next();
  }
});

// Logging Middleware (bleibt gleich)
app.use(async (ctx, next) => {
  console.log(`[${ctx.request.method}] ${ctx.request.url}`);
  await next();
});

// --- NEU: Auth-Middleware (Firewall) ---
app.use(async (ctx, next) => {
  const path = ctx.request.url.pathname;
  
  // Wir schützen alle /api/entries Routen
  if (path.startsWith("/api/entries")) {
    const authHeader = ctx.request.headers.get("Authorization");
    
    // Format ist "Bearer <token>"
    const token = authHeader?.split(" ")[1]; 

    if (!token) {
      ctx.response.status = 401;
      ctx.response.body = { error: "Kein Token angegeben." };
      return;
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      ctx.response.status = 401;
      ctx.response.body = { error: "Ungültiges oder abgelaufenes Token." };
      return;
    }

    // Token ist gültig!
    // Wir speichern die Benutzerdaten im "state" für spätere Verwendung
    ctx.state.user = payload;
    await next(); // Anfrage darf passieren
  } else {
    // Für alle anderen Routen (z.B. /api/login)
    await next(); // Einfach passieren lassen
  }
});

// --- Routen (bleibt gleich) ---
app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

// Fallback (bleibt gleich)
app.use((ctx) => {
  ctx.response.status = 404;
  ctx.response.body = "Endpunkt nicht gefunden.";
});


console.log(`Server läuft auf https://localhost:${port}`);
await app.listen({
  port: port,
  // Sag Deno, wo es das Zertifikat und den Schlüssel findet
  cert: await Deno.readTextFile("./localhost.pem"),
  key: await Deno.readTextFile("./localhost-key.pem"),
});