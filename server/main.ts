import { Application } from "oak";
import apiRouter from "./api.ts"; // Importiere unseren neuen API-Router

const app = new Application();
const port = 8000;

// --- CORS Middleware (WICHTIG!) ---
// Muss vor den Routen stehen, damit die Header gesetzt werden.
app.use(async (ctx, next) => {
  // Erlaube Anfragen von unserem zukünftigen Vue-Client
  ctx.response.headers.set("Access-Control-Allow-Origin", "http://localhost:5173"); 
  // Erlaube alle gängigen Methoden (inkl. PUT und DELETE)
  ctx.response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  // Erlaube notwendige Header (Content-Type und später Authorization)
  ctx.response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Spezielle Behandlung für "Preflight"-Anfragen (OPTIONS)
  if (ctx.request.method === "OPTIONS") {
    ctx.response.status = 204; // No Content
  } else {
    await next(); // Schicke die Anfrage weiter
  }
});

// Logging Middleware
app.use(async (ctx, next) => {
  console.log(`[${ctx.request.method}] ${ctx.request.url}`);
  await next();
});

// --- Routen ---
// Registriere die API-Routen
app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods()); // Behandelt automatisch OPTIONS-Anfragen

// Fallback für alle anderen Anfragen
app.use((ctx) => {
  ctx.response.status = 404;
  ctx.response.body = "Endpunkt nicht gefunden.";
});

// Starte den Server
console.log(`Server läuft auf http://localhost:${port}`);
await app.listen({ port: port });