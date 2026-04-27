const WIDTH = 960;
const HEIGHT = 540;

const levelInfo = document.getElementById("levelInfo");
const livesInfo = document.getElementById("livesInfo");
const coinInfo = document.getElementById("coinInfo");
const message = document.getElementById("message");

const gameState = {
  levelIndex: 0,
  lives: 3,
  score: 0,
  finished: false,
};

const levelDefinitions = [
  {
    worldWidth: 2200,
    start: { x: 80, y: 420 },
    platforms: [
      [0, 510, 2200, 40],
      [260, 430, 180, 22],
      [520, 360, 180, 22],
      [810, 300, 170, 22],
      [1080, 360, 200, 22],
      [1390, 300, 200, 22],
      [1720, 250, 180, 22],
    ],
    enemies: [
      [630, 480, 520, 760],
      [1460, 270, 1390, 1590],
      [1760, 220, 1720, 1890],
    ],
    coins: [
      [305, 390], [570, 320], [860, 260], [1150, 320], [1450, 260], [1770, 210],
    ],
    goal: [2050, 430],
  },
  {
    worldWidth: 2300,
    start: { x: 80, y: 420 },
    platforms: [
      [0, 510, 2300, 40],
      [220, 450, 130, 20], [420, 390, 130, 20], [620, 330, 130, 20],
      [870, 280, 170, 20], [1140, 340, 180, 20], [1420, 400, 160, 20],
      [1650, 340, 170, 20], [1920, 280, 170, 20],
    ],
    enemies: [[940, 248, 880, 1040], [1480, 368, 1420, 1580], [1990, 248, 1920, 2090]],
    coins: [[240, 415], [445, 355], [650, 295], [905, 245], [1180, 305], [1460, 365], [1970, 245]],
    goal: [2160, 440],
  },
  {
    worldWidth: 2400,
    start: { x: 70, y: 420 },
    platforms: [
      [0, 510, 2400, 40], [300, 430, 180, 20], [560, 430, 180, 20], [820, 360, 180, 20],
      [1080, 300, 180, 20], [1340, 240, 180, 20], [1610, 300, 180, 20], [1880, 360, 180, 20],
    ],
    enemies: [[640, 398, 570, 730], [1140, 268, 1080, 1260], [1680, 268, 1610, 1790]],
    coins: [[360, 395], [620, 395], [880, 325], [1140, 265], [1400, 205], [1680, 265], [1940, 325]],
    goal: [2240, 440],
  },
  {
    worldWidth: 2500,
    start: { x: 60, y: 420 },
    platforms: [
      [0, 510, 2500, 40], [260, 450, 160, 20], [510, 380, 140, 20], [730, 320, 140, 20],
      [950, 260, 140, 20], [1190, 320, 170, 20], [1460, 380, 170, 20], [1740, 320, 170, 20],
      [2040, 260, 170, 20],
    ],
    enemies: [[540, 348, 510, 650], [980, 228, 950, 1090], [1490, 348, 1460, 1630], [2070, 228, 2040, 2210]],
    coins: [[290, 415], [535, 345], [755, 285], [980, 225], [1230, 285], [1500, 345], [1770, 285], [2070, 225]],
    goal: [2360, 440],
  },
  {
    worldWidth: 2600,
    start: { x: 90, y: 420 },
    platforms: [
      [0, 510, 2600, 40], [270, 440, 180, 20], [560, 370, 180, 20], [850, 300, 180, 20],
      [1140, 230, 180, 20], [1460, 300, 180, 20], [1780, 370, 180, 20], [2100, 300, 180, 20],
      [2330, 240, 150, 20],
    ],
    enemies: [[600, 338, 560, 740], [1180, 198, 1140, 1320], [1820, 338, 1780, 1960], [2360, 208, 2330, 2480]],
    coins: [[330, 405], [620, 335], [910, 265], [1200, 195], [1520, 265], [1840, 335], [2160, 265], [2370, 205]],
    goal: [2480, 440],
  },
  {
    worldWidth: 2700,
    start: { x: 70, y: 420 },
    platforms: [
      [0, 510, 2700, 40], [240, 440, 130, 18], [430, 390, 130, 18], [620, 340, 130, 18],
      [810, 290, 130, 18], [1000, 240, 130, 18], [1220, 290, 160, 18], [1460, 340, 160, 18],
      [1710, 390, 160, 18], [1970, 340, 160, 18], [2230, 290, 160, 18],
    ],
    enemies: [[450, 358, 430, 560], [1030, 208, 1000, 1130], [1490, 308, 1460, 1620], [2000, 308, 1970, 2130], [2260, 258, 2230, 2390]],
    coins: [[255, 405], [445, 355], [635, 305], [825, 255], [1015, 205], [1260, 255], [1500, 305], [1750, 355], [2010, 305], [2270, 255]],
    goal: [2550, 440],
  },
  {
    worldWidth: 2800,
    start: { x: 80, y: 420 },
    platforms: [
      [0, 510, 2800, 40], [330, 430, 220, 20], [650, 360, 220, 20], [970, 290, 220, 20],
      [1290, 360, 220, 20], [1610, 430, 220, 20], [1930, 360, 220, 20], [2250, 290, 220, 20],
    ],
    enemies: [[690, 328, 650, 870], [1020, 258, 970, 1190], [1340, 328, 1290, 1510], [1970, 328, 1930, 2150], [2290, 258, 2250, 2470]],
    coins: [[380, 395], [700, 325], [1020, 255], [1340, 325], [1660, 395], [1980, 325], [2300, 255]],
    goal: [2660, 440],
  },
  {
    worldWidth: 2900,
    start: { x: 60, y: 420 },
    platforms: [
      [0, 510, 2900, 40], [240, 450, 190, 20], [520, 390, 190, 20], [800, 330, 190, 20],
      [1080, 270, 190, 20], [1380, 210, 190, 20], [1700, 270, 190, 20], [2020, 330, 190, 20],
      [2340, 390, 190, 20],
    ],
    enemies: [[560, 358, 520, 710], [1120, 238, 1080, 1270], [1420, 178, 1380, 1570], [1740, 238, 1700, 1890], [2060, 298, 2020, 2210], [2380, 358, 2340, 2530]],
    coins: [[290, 415], [570, 355], [850, 295], [1130, 235], [1430, 175], [1750, 235], [2070, 295], [2390, 355]],
    goal: [2760, 440],
  },
  {
    worldWidth: 3000,
    start: { x: 70, y: 420 },
    platforms: [
      [0, 510, 3000, 40], [260, 440, 160, 20], [500, 370, 160, 20], [740, 300, 160, 20],
      [980, 230, 160, 20], [1240, 300, 180, 20], [1520, 370, 180, 20], [1800, 300, 180, 20],
      [2080, 230, 180, 20], [2380, 300, 180, 20], [2660, 230, 180, 20],
    ],
    enemies: [[530, 338, 500, 660], [1010, 198, 980, 1140], [1550, 338, 1520, 1700], [1830, 268, 1800, 1980], [2110, 198, 2080, 2260], [2410, 268, 2380, 2560], [2690, 198, 2660, 2840]],
    coins: [[290, 405], [530, 335], [770, 265], [1010, 195], [1280, 265], [1560, 335], [1840, 265], [2120, 195], [2420, 265], [2700, 195]],
    goal: [2860, 440],
  },
  {
    worldWidth: 3200,
    start: { x: 70, y: 420 },
    platforms: [
      [0, 510, 3200, 40], [280, 440, 200, 20], [560, 370, 180, 20], [820, 300, 180, 20],
      [1080, 230, 180, 20], [1360, 160, 180, 20], [1660, 230, 180, 20], [1960, 300, 180, 20],
      [2260, 370, 180, 20], [2560, 300, 180, 20], [2860, 230, 180, 20],
    ],
    enemies: [[600, 338, 560, 740], [860, 268, 820, 1000], [1120, 198, 1080, 1260], [1400, 128, 1360, 1540], [1700, 198, 1660, 1840], [2000, 268, 1960, 2140], [2300, 338, 2260, 2440], [2600, 268, 2560, 2740], [2900, 198, 2860, 3040]],
    coins: [[340, 405], [610, 335], [870, 265], [1130, 195], [1410, 125], [1710, 195], [2010, 265], [2310, 335], [2610, 265], [2910, 195]],
    goal: [3070, 440],
  },
];

class PlatformerScene extends Phaser.Scene {
  constructor() {
    super("PlatformerScene");
  }

  preload() {
    // Keine lokalen Assets nötig: alle Sprites werden per Graphics erstellt.
  }

  create() {
    this.createTextures();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      up: Phaser.Input.Keyboard.KeyCodes.W,
      restart: Phaser.Input.Keyboard.KeyCodes.R,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });

    this.input.keyboard.on("keydown-R", () => {
      if (!gameState.finished) {
        this.loadLevel(gameState.levelIndex, true);
      }
    });

    this.loadLevel(gameState.levelIndex, false);
  }

  createTextures() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    g.fillStyle(0x2a9d8f, 1);
    g.fillRect(0, 0, 32, 42);
    g.fillStyle(0xe9c46a, 1);
    g.fillRect(6, 8, 20, 12);
    g.generateTexture("player", 32, 42);
    g.clear();

    g.fillStyle(0x7b5e3b, 1);
    g.fillRect(0, 0, 64, 24);
    g.fillStyle(0xb68d59, 1);
    g.fillRect(0, 0, 64, 7);
    g.generateTexture("platform", 64, 24);
    g.clear();

    g.fillStyle(0xd1495b, 1);
    g.fillRect(0, 0, 34, 34);
    g.generateTexture("enemy", 34, 34);
    g.clear();

    g.fillStyle(0xffd23f, 1);
    g.fillCircle(10, 10, 10);
    g.generateTexture("coin", 20, 20);
    g.clear();

    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 6, 80);
    g.fillStyle(0x1d3557, 1);
    g.fillRect(6, 0, 30, 24);
    g.generateTexture("goal", 36, 80);
    g.destroy();
  }

  clearLevelObjects() {
    if (this.platforms) this.platforms.clear(true, true);
    if (this.enemies) this.enemies.clear(true, true);
    if (this.coins) this.coins.clear(true, true);
    if (this.goal) this.goal.destroy();
    if (this.player) this.player.destroy();
  }

  loadLevel(index, keepMessage) {
    const level = levelDefinitions[index];
    this.clearLevelObjects();

    this.cameras.main.setBackgroundColor("#7ecbff");
    this.physics.world.setBounds(0, 0, level.worldWidth, HEIGHT);
    this.cameras.main.setBounds(0, 0, level.worldWidth, HEIGHT);

    this.platforms = this.physics.add.staticGroup();
    level.platforms.forEach(([x, y, w, h]) => {
      const platform = this.add.tileSprite(x + w / 2, y + h / 2, w, h, "platform");
      this.physics.add.existing(platform, true);
      this.platforms.add(platform);
    });

    this.enemies = this.physics.add.group({ allowGravity: false, immovable: true });
    level.enemies.forEach(([x, y, minX, maxX]) => {
      const enemy = this.enemies.create(x, y, "enemy").setOrigin(0, 0);
      enemy.minX = minX;
      enemy.maxX = maxX;
      enemy.vx = Phaser.Math.Between(70, 120) * (Math.random() > 0.5 ? 1 : -1);
    });

    this.coins = this.physics.add.staticGroup();
    level.coins.forEach(([x, y]) => {
      const coin = this.coins.create(x, y, "coin").setOrigin(0, 0);
      coin.refreshBody();
    });

    this.goal = this.physics.add.staticImage(level.goal[0], level.goal[1], "goal").setOrigin(0, 0);

    this.player = this.physics.add.sprite(level.start.x, level.start.y, "player").setOrigin(0, 0);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(28, 40).setOffset(2, 2);

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, undefined, this);
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, undefined, this);
    this.physics.add.overlap(this.player, this.goal, this.reachGoal, undefined, this);

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08, -180, 20);

    if (!keepMessage) message.textContent = "";
    this.updateHUD();
  }

  collectCoin(_player, coin) {
    coin.destroy();
    gameState.score += 10;
    this.updateHUD();
  }

  hitEnemy(player, enemy) {
    const playerBottom = player.y + player.height;
    const stomped = player.body.velocity.y > 0 && playerBottom < enemy.y + 14;

    if (stomped) {
      enemy.destroy();
      player.setVelocityY(-260);
      gameState.score += 50;
      this.updateHUD();
      return;
    }

    this.loseLife("Ein Gegner hat dich erwischt");
  }

  loseLife(reason) {
    gameState.lives -= 1;

    if (gameState.lives <= 0) {
      gameState.levelIndex = 0;
      gameState.lives = 3;
      gameState.score = 0;
      gameState.finished = false;
      message.textContent = `${reason} – Game Over! Neustart bei Level 1.`;
      this.loadLevel(gameState.levelIndex, true);
      return;
    }

    message.textContent = `${reason} – Noch ${gameState.lives} Leben.`;
    this.loadLevel(gameState.levelIndex, true);
  }

  reachGoal() {
    if (gameState.levelIndex < levelDefinitions.length - 1) {
      gameState.levelIndex += 1;
      message.textContent = `Level ${gameState.levelIndex} geschafft! Weiter zu Level ${gameState.levelIndex + 1}.`;
      this.loadLevel(gameState.levelIndex, true);
      return;
    }

    gameState.finished = true;
    this.player.setVelocity(0, 0);
    this.player.body.enable = false;
    message.textContent = "Glückwunsch! Du hast alle 10 Level abgeschlossen!";
  }

  updateHUD() {
    levelInfo.textContent = `Level: ${gameState.levelIndex + 1} / ${levelDefinitions.length}`;
    livesInfo.textContent = `Leben: ${gameState.lives}`;
    coinInfo.textContent = `Münzen: ${gameState.score}`;
  }

  update() {
    if (!this.player || gameState.finished) return;

    const moveLeft = this.cursors.left.isDown || this.keys.left.isDown;
    const moveRight = this.cursors.right.isDown || this.keys.right.isDown;
    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.keys.up) ||
      Phaser.Input.Keyboard.JustDown(this.keys.space);

    if (moveLeft) {
      this.player.setVelocityX(-210);
    } else if (moveRight) {
      this.player.setVelocityX(210);
    } else {
      this.player.setVelocityX(0);
    }

    if (jumpPressed && this.player.body.blocked.down) {
      this.player.setVelocityY(-420);
    }

    this.enemies.children.iterate((enemy) => {
      if (!enemy || !enemy.active) return;
      enemy.x += (enemy.vx / 60);
      if (enemy.x <= enemy.minX || enemy.x + enemy.width >= enemy.maxX) enemy.vx *= -1;
    });

    if (this.player.y > HEIGHT + 120) {
      this.loseLife("Du bist gefallen");
    }
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: WIDTH,
  height: HEIGHT,
  parent: "game",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 900 },
      debug: false,
    },
  },
  scene: [PlatformerScene],
});
