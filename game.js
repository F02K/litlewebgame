const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const statusInfo = document.getElementById("statusInfo");
const pingInfo = document.getElementById("pingInfo");
const scoreInfo = document.getElementById("scoreInfo");
const hpInfo = document.getElementById("hpInfo");
const message = document.getElementById("message");

const connectBtn = document.getElementById("connectBtn");
const serverUrlInput = document.getElementById("serverUrl");
const playerNameInput = document.getElementById("playerName");

const state = {
  socket: null,
  connected: false,
  myId: null,
  players: {},
  bullets: [],
  arena: { width: 2200, height: 1400 },
  pingSentAt: 0,
  pingMs: 0,
  camera: { x: 0, y: 0 },
};

const input = {
  up: false,
  down: false,
  left: false,
  right: false,
  shooting: false,
  angle: 0,
};

let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;

function connect() {
  const url = serverUrlInput.value.trim();
  const name = playerNameInput.value.trim() || "Spieler";

  if (!url.startsWith("ws://") && !url.startsWith("wss://")) {
    message.textContent = "Server URL muss mit ws:// oder wss:// beginnen.";
    return;
  }

  if (state.socket) {
    state.socket.close();
  }

  const socket = new WebSocket(url);
  state.socket = socket;

  statusInfo.textContent = "Status: verbinde...";
  message.textContent = "Verbinde zum Server...";

  socket.addEventListener("open", () => {
    state.connected = true;
    statusInfo.textContent = "Status: verbunden";
    message.textContent = "Verbunden. Warte auf Matchdaten...";
    socket.send(JSON.stringify({ type: "join", name }));

    setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        state.pingSentAt = performance.now();
        socket.send(JSON.stringify({ type: "ping", t: state.pingSentAt }));
      }
    }, 2000);
  });

  socket.addEventListener("close", () => {
    state.connected = false;
    state.myId = null;
    state.players = {};
    state.bullets = [];
    statusInfo.textContent = "Status: getrennt";
    message.textContent = "Verbindung getrennt.";
  });

  socket.addEventListener("message", (event) => {
    const msg = JSON.parse(event.data);

    if (msg.type === "welcome") {
      state.myId = msg.id;
      state.arena = msg.arena;
      message.textContent = "Du bist im Match!";
    }

    if (msg.type === "state") {
      state.players = msg.players;
      state.bullets = msg.bullets;
    }

    if (msg.type === "pong") {
      state.pingMs = Math.round(performance.now() - msg.t);
      pingInfo.textContent = `Ping: ${state.pingMs}ms`;
    }

    if (msg.type === "event") {
      message.textContent = msg.text;
    }
  });
}

function sendInput() {
  if (!state.connected || !state.socket || state.socket.readyState !== WebSocket.OPEN) return;

  state.socket.send(JSON.stringify({
    type: "input",
    input,
  }));

  if (input.shooting) {
    state.socket.send(JSON.stringify({
      type: "shoot",
      angle: input.angle,
    }));
  }
}

setInterval(sendInput, 50);

function drawGrid() {
  const gridSize = 80;
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;

  const startX = -((state.camera.x) % gridSize);
  const startY = -((state.camera.y) % gridSize);

  for (let x = startX; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = startY; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function worldToScreen(wx, wy) {
  return { x: wx - state.camera.x, y: wy - state.camera.y };
}

function drawPlayer(player, isMe) {
  const p = worldToScreen(player.x, player.y);
  const size = 26;

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(player.angle);

  ctx.fillStyle = isMe ? "#4ecdc4" : "#ff6b6b";
  ctx.fillRect(-size / 2, -size / 2, size, size);

  ctx.fillStyle = "#f1faee";
  ctx.fillRect(0, -4, 18, 8);
  ctx.restore();

  ctx.fillStyle = "#ffffff";
  ctx.font = "12px sans-serif";
  ctx.fillText(`${player.name} (${player.score})`, p.x - 28, p.y - 20);

  const hpWidth = 42;
  ctx.fillStyle = "#444";
  ctx.fillRect(p.x - hpWidth / 2, p.y + 20, hpWidth, 5);
  ctx.fillStyle = player.hp > 50 ? "#3ddc97" : player.hp > 25 ? "#ffd166" : "#ef476f";
  ctx.fillRect(p.x - hpWidth / 2, p.y + 20, (hpWidth * player.hp) / 100, 5);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#102634";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  const me = state.players[state.myId];
  if (me) {
    state.camera.x = Math.max(0, Math.min(me.x - canvas.width / 2, state.arena.width - canvas.width));
    state.camera.y = Math.max(0, Math.min(me.y - canvas.height / 2, state.arena.height - canvas.height));
    scoreInfo.textContent = `Score: ${me.score}`;
    hpInfo.textContent = `HP: ${me.hp}`;
  } else {
    scoreInfo.textContent = "Score: 0";
    hpInfo.textContent = "HP: 100";
  }

  // Arena border
  const topLeft = worldToScreen(0, 0);
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 3;
  ctx.strokeRect(topLeft.x, topLeft.y, state.arena.width, state.arena.height);

  for (const bullet of state.bullets) {
    const b = worldToScreen(bullet.x, bullet.y);
    ctx.fillStyle = "#ffe066";
    ctx.beginPath();
    ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const [id, player] of Object.entries(state.players)) {
    drawPlayer(player, id === state.myId);
  }

  requestAnimationFrame(draw);
}

window.addEventListener("keydown", (e) => {
  if (e.code === "KeyW") input.up = true;
  if (e.code === "KeyS") input.down = true;
  if (e.code === "KeyA") input.left = true;
  if (e.code === "KeyD") input.right = true;
});

window.addEventListener("keyup", (e) => {
  if (e.code === "KeyW") input.up = false;
  if (e.code === "KeyS") input.down = false;
  if (e.code === "KeyA") input.left = false;
  if (e.code === "KeyD") input.right = false;
});

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;

  const me = state.players[state.myId];
  if (me) {
    const mxWorld = mouseX + state.camera.x;
    const myWorld = mouseY + state.camera.y;
    input.angle = Math.atan2(myWorld - me.y, mxWorld - me.x);
  }
});

canvas.addEventListener("mousedown", (e) => {
  if (e.button === 0) input.shooting = true;
});

window.addEventListener("mouseup", () => {
  input.shooting = false;
});

connectBtn.addEventListener("click", connect);
requestAnimationFrame(draw);
