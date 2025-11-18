# --- Stage 1: Frontend bauen ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/client
# Kopiere Package-Dateien und installiere
COPY client/package*.json ./
RUN npm install
# Kopiere den Rest und baue
COPY client/ .
RUN npm run build

# --- Stage 2: Server bauen & starten ---
# Wir nutzen hier 1.46.3. Falls du lokal Deno 2.x nutzt, löschen wir unten die Lock-Datei.
FROM denoland/deno:1.46.3
WORKDIR /app/server

# 1. Nur deno.json kopieren
COPY server/deno.json ./

# 2. Restlichen Server-Code kopieren (Kopiert leider auch die inkompatible deno.lock mit)
COPY server/ .

# 3. WICHTIG: Die inkompatible Lock-Datei im Container löschen!
RUN rm -f deno.lock

# 4. Frontend aus Stage 1 in den 'static' Ordner kopieren
COPY --from=frontend-builder /app/client/dist ./static

# 5. Zertifikate kopieren
COPY server/localhost.pem server/localhost-key.pem ./

# 6. Cache erstellen (Erzeugt jetzt keine Fehler mehr, da Lock-Datei weg ist)
RUN deno cache main.ts

# 7. Starten
CMD ["run", "--allow-net", "--allow-read", "--allow-write", "--unstable-kv", "main.ts"]

EXPOSE 8000