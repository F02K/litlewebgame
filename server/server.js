import { randomUUID } from "node:crypto";
import { WebSocketServer } from "ws";

const PORT = process.env.PORT || 8080;
const TICK_RATE = 60;
const ARENA = { width: 2200, height: 1400 };
const PLAYER_SPEED = 260;
const FIRE_COOLDOWN_MS = 180;
const BULLET_SPEED = 640;
const BULLET_TTL_MS = 1300;
const BULLET_DAMAGE = 25;

const wss = new WebSocketServer({ port: PORT });
const clients = new Map();
const players = new Map();
const bullets = [];

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function randomSpawn() {
  return {
    x: 100 + Math.random() * (ARENA.width - 200),
    y: 100 + Math.random() * (ARENA.height - 200),
  };
}

function makePlayer(id, name = "Spieler") {
  const spawn = randomSpawn();
  return {
    id,
    name: name.slice(0, 16),
    x: spawn.x,
    y: spawn.y,
    angle: 0,
    hp: 100,
    score: 0,
    input: { up: false, down: false, left: false, right: false, angle: 0 },
    lastShotAt: 0,
  };
}

function broadcast(msg) {
  const text = JSON.stringify(msg);
  for (const ws of clients.values()) {
    if (ws.readyState === ws.OPEN) ws.send(text);
  }
}

function emitEvent(text) {
  broadcast({ type: "event", text });
}

function playerStateObject() {
  const out = {};
  for (const [id, p] of players.entries()) {
    out[id] = {
      x: p.x,
      y: p.y,
      angle: p.angle,
      hp: p.hp,
      score: p.score,
      name: p.name,
    };
  }
  return out;
}

function updatePlayers(dt) {
  for (const p of players.values()) {
    let dx = 0;
    let dy = 0;
    if (p.input.up) dy -= 1;
    if (p.input.down) dy += 1;
    if (p.input.left) dx -= 1;
    if (p.input.right) dx += 1;

    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;
      p.x += dx * PLAYER_SPEED * dt;
      p.y += dy * PLAYER_SPEED * dt;
    }

    p.x = clamp(p.x, 15, ARENA.width - 15);
    p.y = clamp(p.y, 15, ARENA.height - 15);
    p.angle = p.input.angle || 0;
  }
}

function updateBullets(dt) {
  const now = Date.now();

  for (let i = bullets.length - 1; i >= 0; i -= 1) {
    const b = bullets[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;

    if (
      now - b.spawnedAt > BULLET_TTL_MS ||
      b.x < 0 || b.y < 0 || b.x > ARENA.width || b.y > ARENA.height
    ) {
      bullets.splice(i, 1);
      continue;
    }

    for (const p of players.values()) {
      if (p.id === b.ownerId || p.hp <= 0) continue;
      const dist = Math.hypot(p.x - b.x, p.y - b.y);
      if (dist < 16) {
        p.hp -= BULLET_DAMAGE;

        const shooter = players.get(b.ownerId);
        if (p.hp <= 0) {
          if (shooter) shooter.score += 1;
          const spawn = randomSpawn();
          p.hp = 100;
          p.x = spawn.x;
          p.y = spawn.y;
          emitEvent(`${shooter?.name ?? "Jemand"} eliminiert ${p.name}`);
        }

        bullets.splice(i, 1);
        break;
      }
    }
  }
}

function shoot(player) {
  const now = Date.now();
  if (now - player.lastShotAt < FIRE_COOLDOWN_MS) return;

  player.lastShotAt = now;
  bullets.push({
    ownerId: player.id,
    x: player.x,
    y: player.y,
    vx: Math.cos(player.angle) * BULLET_SPEED,
    vy: Math.sin(player.angle) * BULLET_SPEED,
    spawnedAt: now,
  });
}

wss.on("connection", (ws) => {
  const id = randomUUID();
  clients.set(id, ws);
  players.set(id, makePlayer(id));

  ws.send(JSON.stringify({ type: "welcome", id, arena: ARENA }));
  emitEvent(`Ein Spieler ist beigetreten (${players.size} online)`);

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    const player = players.get(id);
    if (!player) return;

    if (msg.type === "join") {
      player.name = String(msg.name || "Spieler").slice(0, 16);
      return;
    }

    if (msg.type === "input") {
      const i = msg.input || {};
      player.input.up = !!i.up;
      player.input.down = !!i.down;
      player.input.left = !!i.left;
      player.input.right = !!i.right;
      player.input.angle = Number(i.angle) || 0;
      return;
    }

    if (msg.type === "shoot") {
      player.input.angle = Number(msg.angle) || player.input.angle;
      shoot(player);
      return;
    }

    if (msg.type === "ping") {
      ws.send(JSON.stringify({ type: "pong", t: msg.t }));
    }
  });

  ws.on("close", () => {
    const leaving = players.get(id);
    clients.delete(id);
    players.delete(id);
    emitEvent(`${leaving?.name ?? "Ein Spieler"} hat verlassen (${players.size} online)`);
  });
});

let last = Date.now();
setInterval(() => {
  const now = Date.now();
  const dt = (now - last) / 1000;
  last = now;

  updatePlayers(dt);
  updateBullets(dt);

  broadcast({
    type: "state",
    players: playerStateObject(),
    bullets,
  });
}, 1000 / TICK_RATE);

console.log(`Arena Blaster WebSocket server listening on :${PORT}`);
