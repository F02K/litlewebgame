# Arena Blaster Multiplayer

Ein simples kompetitives 2D Shooter-Spiel.

## Wichtige Antwort auf deine Frage

**Ja, teilweise:**
- **GitHub Pages** kann nur das **Frontend** hosten (HTML/CSS/JS).
- Für **echten Multiplayer** brauchst du zusätzlich einen **separaten WebSocket-Server**.

Dieses Repo ist deshalb aufgeteilt in:
- `index.html`, `styles.css`, `game.js` → Frontend (für GitHub Pages)
- `server/server.js` → Multiplayer-Server (Node.js + ws)

## Features

- Echtzeit-Multiplayer via WebSocket
- WASD-Movement, Maus-Aim, Klick zum Schießen
- HP, Score, Respawn, Kill-Feed
- Simples Arena-Design

## 1) Server starten (Backend)

```bash
cd server
npm install
npm start
```

Standard-Port: `8080`.

## 2) Frontend lokal testen

Im Projektroot z. B.:

```bash
python -m http.server 5500
```

Dann `http://localhost:5500` öffnen und `ws://localhost:8080` eintragen.

## 3) GitHub Pages Deployment (Frontend)

1. Repo auf GitHub pushen.
2. In den Repo-Settings GitHub Pages aktivieren (Branch `main`, Ordner `/root`).
3. Die veröffentlichte URL öffnen.
4. Im Feld **Server URL** deinen produktiven WebSocket-Server eintragen, z. B. `wss://dein-server.example.com`.

## 4) Backend Deployment Optionen

Du kannst den `server/`-Ordner auf Plattformen wie Render, Fly.io, Railway oder einem VPS hosten.
Wichtig: Für GitHub Pages musst du im Frontend dann `wss://...` nutzen (TLS).
