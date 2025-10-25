// Importiere die 'Application' Klasse aus unseren 'imports' in deno.json
import { Application } from "oak";

// Erstelle eine neue Server-Instanz
const app = new Application();
const port = 8000;

// Eine einfache "Middleware", die jede Anfrage loggt
app.use(async (ctx, next) => {
  console.log(`[${ctx.request.method}] ${ctx.request.url}`);
  await next(); // Wichtig: Gibt die Anfrage an die nächste Middleware/Route weiter
});

// Eine simple "Hallo Welt" Route für den Start
app.use((ctx) => {
  ctx.response.body = "Hallo Welt! Der Tagebuch-Server läuft.";
});

// Starte den Server
console.log(`Server läuft auf http://localhost:${port}`);
await app.listen({ port: port });