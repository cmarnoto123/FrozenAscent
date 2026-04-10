// Cameron Marnoto
// Final Combined 5-Level Snow Game
// Order:
// 1) Pickaxe Parkour
// 2) Ice Wall Climb
// 3) Torch Run
// 4) Snowball Tunnel Run
// 5) Yeti Boss Fight
//
// The wrapper handles:
// - Start screen with Start + Speedrun
// - Mountain + snow background
// - Auto next-level transitions
// - Reset same level on death
// - Speedrun timer
// - Final win screen

let gameMode = "menu"; // menu, play, win
let speedrunMode = false;
let winSceneStart = 0;
let winScenePlayer;
const WIN_SCENE_DURATION = 12000;
let speedrunStart = 0;
let finalTime = 0;
let currentLevel = 0;

let bgSnow = [];
let coldVibe;
let blizzardWind;
let dangerMusic;
let yetiMusic;

let jumpSound;
let runSnowSound;
let iceSqueakSound;

let hitSnowballSound;
let hitPickaxeSound;
let deathByColdSound;
let fireSound;
let victorySound;

let currentMusic = null;
let audioReady = false;

const LEVELS = [
  level1,
  level2,
  level3,
  level4,
  level5
];

function preload() {
  soundFormats('mp3', 'wav');

  coldVibe = loadSound('cold vibe.mp3');
  blizzardWind = loadSound('Blizzard wind sound.mp3');
  dangerMusic = loadSound('danger is approaching .mp3');
  yetiMusic = loadSound('yeti music.mp3');
  jumpSound = loadSound('jump2.mp3');
  runSnowSound = loadSound('running on snow.mp3');
  iceSqueakSound = loadSound('shoes squeaking.wav');

  hitSnowballSound = loadSound('hit by snowball.mp3');
  hitPickaxeSound = loadSound('hit by ice:pickaxe.mp3');
  deathByColdSound = loadSound('death by cold.mp3');
  fireSound = loadSound('fire.mp3');
  victorySound = loadSound('victory.mp3');
  //snowballRumbleSound = loadSound('snowball rumble.mp3');
}

function setup() {
  createCanvas(600, 400);
  textFont("Trebuchet MS");

  for (let i = 0; i < 120; i++) {
    bgSnow.push({
      x: random(width),
      y: random(height),
      r: random(1, 3),
      vy: random(0.5, 1.5),
      drift: random(-0.3, 0.3)
    });
  }
}
function ensureAudioStarted() {
  if (!audioReady) {
    userStartAudio();
    audioReady = true;
  }
}

function stopAllMusic() {
  if (coldVibe && coldVibe.isPlaying()) coldVibe.stop();
  if (blizzardWind && blizzardWind.isPlaying()) blizzardWind.stop();
  if (dangerMusic && dangerMusic.isPlaying()) dangerMusic.stop();
  if (yetiMusic && yetiMusic.isPlaying()) yetiMusic.stop();
  currentMusic = null;
}

function playMusic(track, volume = 0.35) {
  if (!track) return;

  if (currentMusic !== track) {
    if (currentMusic && currentMusic.isPlaying()) {
      currentMusic.stop();
    }

    currentMusic = track;
    currentMusic.setVolume(volume);
    currentMusic.loop();
  }
}

function stopMovementLoops() {
  if (runSnowSound && runSnowSound.isPlaying()) runSnowSound.stop();
  if (iceSqueakSound && iceSqueakSound.isPlaying()) iceSqueakSound.stop();
}

function updateMovementSounds(onGround, moving, onIce) {
  if (!onGround || !moving) {
    stopMovementLoops();
    return;
  }

  if (onIce) {
    if (runSnowSound && runSnowSound.isPlaying()) runSnowSound.stop();

    if (iceSqueakSound && !iceSqueakSound.isPlaying()) {
      iceSqueakSound.setVolume(0.35);
      iceSqueakSound.loop();
    }
  } else {
    if (iceSqueakSound && iceSqueakSound.isPlaying()) iceSqueakSound.stop();

    if (runSnowSound && !runSnowSound.isPlaying()) {
      runSnowSound.setVolume(0.35);
      runSnowSound.loop();
    }
  }
}

function safePlayOnce(sound, volume = 0.6) {
  if (!sound) return;
  sound.setVolume(volume);
  sound.play();
}

function draw() {
  if (gameMode === "menu") {
    playMusic(coldVibe, 0.20);
    drawMenuBackground();
    drawMenu();
    return;
  }

  if (gameMode === "play") {
    let activeLevel = LEVELS[currentLevel];

    if (!activeLevel) {
      gameMode = "win";
      finalTime = (millis() - speedrunStart) / 1000;
      drawMenuBackground();
      drawWinScreen();
      return;
    }

    activeLevel.update();

    // If update() changed the mode (like beating level 5), stop here
    if (gameMode !== "play") {
      if (gameMode === "win") {
        playMusic(coldVibe, 0.20);
        drawWinBackground();

     if (millis() - winSceneStart < WIN_SCENE_DURATION) {
        updateWinScenePlayer();
        drawVictoryScene();
      } else {
        drawWinScreen();
      }
    }
      return;
    }

    activeLevel.draw();

    if (speedrunMode) drawSpeedrunTimer();
    return;
  }

  if (gameMode === "win") {
  drawWinBackground();

  if (millis() - winSceneStart < WIN_SCENE_DURATION) {
    updateWinScenePlayer();
    drawVictoryScene();
  } else {
    drawWinScreen();
  }
}
}

function mousePressed() {
  ensureAudioStarted();

  if (gameMode === "menu") {
    if (mouseX > 180 && mouseX < 420 && mouseY > 180 && mouseY < 230) {
      startGame(false);
    }

    if (mouseX > 180 && mouseX < 420 && mouseY > 250 && mouseY < 300) {
      startGame(true);
    }
    return;
  }

  if (gameMode === "win") {
    stopAllMusic();
    stopMovementLoops();
    gameMode = "menu";
  }
}

function keyPressed() {
  if (
    gameMode === "play" &&
    LEVELS[currentLevel] &&
    LEVELS[currentLevel].keyPressed
  ) {
    LEVELS[currentLevel].keyPressed();
  }
}

function startGame(speedrun) {
  ensureAudioStarted();

  speedrunMode = speedrun;
  currentLevel = 0;
  speedrunStart = millis();
  LEVELS[currentLevel].reset();
  gameMode = "play";

  playMusic(coldVibe, 0.28);
}

function nextLevel() {
  stopMovementLoops();

  if (fireSound && fireSound.isPlaying()) fireSound.stop();
  if (blizzardWind && blizzardWind.isPlaying()) blizzardWind.stop();
  if (dangerMusic && dangerMusic.isPlaying()) dangerMusic.stop();

  currentLevel++;
  
  if (currentLevel >= LEVELS.length) {
  finalTime = (millis() - speedrunStart) / 1000;

  stopAllMusic();
  stopMovementLoops();
  safePlayOnce(victorySound, 0.8);

  winScenePlayer = {
    x: width / 2,
    y: 138,
    w: 24,
    h: 14,
    vy: 0,
    onGround: true
  };

  winSceneStart = millis();
  gameMode = "win";
  return;
}

  LEVELS[currentLevel].reset();
}

function restartLevel() {
  if (currentLevel === 3 && l4_checkpointActive) {
    level4RespawnAtCheckpoint();
    return;
  }

  LEVELS[currentLevel].reset();
}

function drawMenuBackground() {
  background(55, 105, 165);

  noStroke();

  // far mountains
  fill(255, 255, 255, 22);
  beginShape();
  vertex(0, 260);
  vertex(60, 210);
  vertex(110, 235);
  vertex(160, 185);
  vertex(225, 230);
  vertex(290, 170);
  vertex(350, 225);
  vertex(420, 165);
  vertex(485, 220);
  vertex(550, 175);
  vertex(600, 215);
  vertex(600, 400);
  vertex(0, 400);
  endShape(CLOSE);

  // mid mountains
  fill(255, 255, 255, 36);
  beginShape();
  vertex(0, 300);
  vertex(70, 235);
  vertex(130, 270);
  vertex(190, 205);
  vertex(260, 275);
  vertex(320, 200);
  vertex(385, 280);
  vertex(450, 195);
  vertex(520, 285);
  vertex(600, 230);
  vertex(600, 400);
  vertex(0, 400);
  endShape(CLOSE);

  // front mountains
  fill(230, 250, 255, 55);
  beginShape();
  vertex(0, 340);
  vertex(85, 265);
  vertex(155, 330);
  vertex(220, 245);
  vertex(300, 335);
  vertex(365, 250);
  vertex(450, 345);
  vertex(520, 260);
  vertex(600, 330);
  vertex(600, 400);
  vertex(0, 400);
  endShape(CLOSE);

  // snow
  for (let s of bgSnow) {
    s.y += s.vy;
    s.x += s.drift;

    if (s.y > height) {
      s.y = -5;
      s.x = random(width);
    }

    fill(255);
    circle(s.x, s.y, s.r);
  }
}

function drawMenu() {
  rectMode(CORNER);   // important reset
  textAlign(CENTER, CENTER);
  textSize(34);
  noStroke();

  fill(255);
  text("FROZEN ASCENT", width / 2, 110);

  fill(20, 80, 140);
  rect(180, 180, 240, 50, 10);
  rect(180, 250, 240, 50, 10);

  fill(255);
  textSize(24);
  text("START", 300, 205);
  text("SPEEDRUN", 300, 275);
}

function drawSpeedrunTimer() {
  rectMode(CORNER);   // THIS FIXES IT

  let t = (millis() - speedrunStart) / 1000;

  fill(0, 0, 0, 120);
  rect(480, 10, 110, 35, 8);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(18);
  text(t.toFixed(2), 535, 28);
}

function drawWinScreen() {
  fill(0, 0, 0, 140);
  rect(0, 0, width, height);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(36);
  text("YOU WIN!", width / 2, 150);

  if (speedrunMode) {
    textSize(22);
    text("Time: " + finalTime.toFixed(2) + "s", width / 2, 210);
  }

  textSize(16);
  text("Click to return to menu", width / 2, 270);
}

function drawWinBackground() {
  background(55, 105, 165);

  noStroke();

  fill(255, 255, 255, 22);
  beginShape();
  vertex(0, 260);
  vertex(60, 210);
  vertex(110, 235);
  vertex(160, 185);
  vertex(225, 230);
  vertex(290, 170);
  vertex(350, 225);
  vertex(420, 165);
  vertex(485, 220);
  vertex(550, 175);
  vertex(600, 215);
  vertex(600, 400);
  vertex(0, 400);
  endShape(CLOSE);

  fill(255, 255, 255, 36);
  beginShape();
  vertex(0, 300);
  vertex(70, 235);
  vertex(130, 270);
  vertex(190, 205);
  vertex(260, 275);
  vertex(320, 200);
  vertex(385, 280);
  vertex(450, 195);
  vertex(520, 285);
  vertex(600, 230);
  vertex(600, 400);
  vertex(0, 400);
  endShape(CLOSE);

  fill(230, 250, 255, 55);
  beginShape();
  vertex(0, 340);
  vertex(85, 265);
  vertex(155, 330);
  vertex(220, 245);
  vertex(300, 335);
  vertex(365, 250);
  vertex(450, 345);
  vertex(520, 260);
  vertex(600, 330);
  vertex(600, 400);
  vertex(0, 400);
  endShape(CLOSE);

  fill(255, 255, 255, 220);
  rect(0, 320, width, 80);

  fill(255, 255, 255, 120);
  rect(0, 315, width, 8);

  fill(255);
  for (let s of bgSnow) {
    s.y += s.vy;
    s.x += s.drift;

    if (s.y > height) {
      s.y = -5;
      s.x = random(width);
    }

    if (s.x < -5) s.x = width + 5;
    if (s.x > width + 5) s.x = -5;

    circle(s.x, s.y, s.r);
  }
}

function drawVictoryScene() {
  drawWinYeti(width / 2, 212);
  drawWinPlayer(winScenePlayer.x, winScenePlayer.y);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(30);
  text("Victory!", width / 2, 55);
}
/*
====================================================
LEVEL TEMPLATE SECTION
====================================================
For each level:
- reset() = restart that exact level
- update() = level logic
- draw() = visuals
- call nextLevel() when beaten
- call restartLevel() when dead
====================================================
*/

let l1_player;
let l1_platforms = [];
let l1_spikes = [];
let l1_warnings = [];
let l1_pickaxe;
let l1_gameState = "play";

let l1_spikeTimer = 0;
let l1_jumpQueued = false;

let l1_bgSnow = [];
const L1_BG_SNOW_COUNT = 190;

let l1_icicles = [];
const L1_ICICLE_SPACING = 22;
const L1_ICICLE_Y = 0;
const L1_ICICLE_GAP_FRAMES = 150;
const L1_ICICLE_GROW_FRAMES = 35;

const L1_GRAVITY = 0.85;
const L1_JUMP_VY = -11.4;
const L1_MOVE_ACCEL = 0.55;
const L1_MAX_VX = 4.4;
const L1_FRICTION_NORMAL = 0.70;
const L1_FRICTION_SLIPPERY = 0.955;
const L1_SPRITE_Y_OFFSET = 11;

function level1() {}

level1.reset = function () {
  l1_player = {
    x: 70,
    y: 260,
    w: 24,
    h: 14,
    vx: 0,
    vy: 0,
    onGround: false,
    standingOnSlippery: false,
    standingPlatform: null
  };

  l1_platforms = [];
  l1_spikes = [];
  l1_warnings = [];

  level1Build();

  l1_pickaxe = {
    x: 545,
    y: 70,
    w: 18,
    h: 18,
    taken: false
  };

  level1InitBackgroundSnow();
  level1InitIcicles();

  l1_gameState = "play";
  l1_jumpQueued = false;
  level1ResetSpikeTimer();
};

level1.update = function () {
  playMusic(coldVibe, 0.28);
  if (l1_gameState === "play") {
    level1UpdatePlatforms();
    level1UpdateSpikeSpawner();
    level1UpdateWarnings();
    level1UpdateSpikes();
    level1UpdateIcicles();
    level1UpdatePlayer();
    level1CheckPickaxe();
  } else {
    level1UpdateIcicles();
  }

  if (l1_gameState === "lose") {
    restartLevel();
  }

  if (l1_gameState === "win") {
    nextLevel();
  }
};

level1.draw = function () {
  rectMode(CORNER);

  background(55, 105, 165);
  level1DrawMountainBackdrop();
  level1UpdateBackgroundSnow();
  level1DrawBackgroundSnow();
  level1DrawIcyGradient();
  level1DrawWorld();
};

level1.keyPressed = function () {
  if (l1_gameState !== "play") return;

  if (keyCode === 32 || keyCode === UP_ARROW) {
    l1_jumpQueued = true;
    safePlayOnce(jumpSound, 0.35);
  }
};

let l2_player;
let l2_platforms = [];
let l2_snowflakes = [];
let l2_gameState = "play";

const L2_GRAVITY = 0.6;
const L2_MOVE_SPEED = 2.2;
const L2_AIR_CONTROL = 0.18;
const L2_GROUND_CONTROL = 0.55;
const L2_AIR_DRAG = 0.985;

const L2_JUMP_MULT = 1.5;
const L2_BASE_JUMP_VEL = -7.6;
const L2_JUMP_VEL = L2_BASE_JUMP_VEL * L2_JUMP_MULT;

const L2_WALL_JUMP_PUSH = 7.4;
const L2_BASE_WALL_JUMP_UP = -7.2;
const L2_WALL_JUMP_UP = L2_BASE_WALL_JUMP_UP * L2_JUMP_MULT;

const L2_WALL_STICK_DIST = 6;
const L2_WALL_Y_PAD = 4;
const L2_WALL_LIP_PAD = 10;
const L2_CLEAR_EDGE_PAD = 14;
const L2_CAP_H = 10;

const L2_WORLD_FLOOR_Y = 360;
const L2_FIRE_PLATFORM = { x: 520, y: 120, w: 70, h: 12 };
const L2_FIRE_X = 545;

let l2_cold = 0.0;
let l2_warmed = 0.0;
let l2_winTimer = 0;

let l2_loseDelayFrames = 0;
const L2_LOSE_DELAY_MAX = 120;

function level2() {}

level2.reset = function () {
  l2_platforms = [
    level2MakePlat(0, L2_WORLD_FLOOR_Y, width, height - L2_WORLD_FLOOR_Y, false, true, false, false),

    ...level2MakeWallWithCap(20, 40, 55, L2_WORLD_FLOOR_Y - 40),
    ...level2MakeWallWithCap(160, 80, 45, L2_WORLD_FLOOR_Y - 80),
    ...level2MakeWallWithCap(300, 50, 45, L2_WORLD_FLOOR_Y - 50),
    ...level2MakeWallWithCap(440, 90, 45, L2_WORLD_FLOOR_Y - 90),

    level2MakePlat(
      L2_FIRE_PLATFORM.x,
      L2_FIRE_PLATFORM.y,
      L2_FIRE_PLATFORM.w,
      L2_FIRE_PLATFORM.h,
      false,
      true,
      false,
      false
    )
  ];

  l2_player = {
    x: 118,
    y: L2_WORLD_FLOOR_Y - 40,
    w: 24,
    h: 14,
    vx: 0,
    vy: 0,
    onGround: false,

    wallCling: false,
    clingSide: 0,
    wallIndex: -1,

    lastWallJumpIndex: -1,
    mustSwitchWall: false
  };

  l2_snowflakes = [];
  for (let i = 0; i < 120; i++) {
    l2_snowflakes.push({
      x: random(width),
      y: random(height),
      r: random(1.5, 3.5),
      vy: random(0.7, 2.0),
      drift: random(-0.5, 0.5)
    });
  }

  l2_cold = 0.0;
  l2_warmed = 0.0;
  l2_winTimer = 0;
  l2_loseDelayFrames = 0;
  l2_gameState = "play";
};

level2.update = function () {
  playMusic(coldVibe, 0.28);
  if (l2_gameState === "play") {
    level2UpdatePlayer();
    level2UpdateColdWarm();
    level2CheckWinLose();
  } else if (l2_gameState === "lose_wait") {
    l2_loseDelayFrames++;
    if (l2_loseDelayFrames >= L2_LOSE_DELAY_MAX) {
      l2_gameState = "lose";
    }
  }

  if (l2_gameState === "lose") {
    restartLevel();
  }

  if (l2_gameState === "win") {
    nextLevel();
  }
};

level2.draw = function () {
  level2DrawBackground();
  level2UpdateSnow();

  level2DrawSnowBank();
  level2DrawPlatforms();
  level2DrawFire();
  level2DrawPlayerPixelHikerWithPickaxe();

  if (l2_gameState === "lose_wait" || l2_gameState === "lose") {
    level2DrawIceCubeOverPlayer();
  }

  level2DrawHUD();
};

level2.keyPressed = function () {
  if (l2_gameState !== "play") return;

  if (
    keyCode === 32 ||
    keyCode === UP_ARROW ||
    key === "w" ||
    key === "W"
  ) {
    level2DoJump();
    safePlayOnce(jumpSound, 0.55);
  }
};

let l3_player;
let l3_solids = [];
let l3_snow = [];

let l3_gameState = "play";

const L3_GRAVITY = 0.85;
const L3_JUMP_VY = -11.2;

const L3_MOVE_ACCEL = 0.55;
const L3_MAX_VX = 4.6;
const L3_AIR_DRAG = 0.985;
const L3_GROUND_FRICTION = 0.75;

const L3_WIND_FORCE = -0.38;
const L3_WIND_EXTRA_CLAMP = 4.2;

let l3_cold = 0.0;
let l3_warmed = 0.0;
let l3_hasTorch = false;

const L3_COLD_RATE_HALL = 1.0 / 300.0;
const L3_COLD_RATE_ROOMS = 1.0 / 340.0;
const L3_TORCH_MULT_HALL = 0.55;
const L3_TORCH_MULT_ROOMS = -0.55;
const L3_TORCH_WARM_RATE_MIDDLE = 1.0 / 220.0;
const L3_FIRE_COOL_RATE = 0.06;

const L3_FREEZE_SHOW_FRAMES = 110;
let l3_freezeTimer = 0;

const L3_WALL = 12;

const L3_HALL_Y = 300;
const L3_FLOOR_Y = 360;
const L3_HALL = { x: 0, y: L3_HALL_Y, w: 600, h: L3_FLOOR_Y - L3_HALL_Y };

const L3_ROOM_TOP_Y = 35;
const L3_ROOM_BOTTOM_Y = L3_HALL_Y;

const L3_LEFT_ROOM = {
  x: 40,
  y: L3_ROOM_TOP_Y,
  w: 250,
  h: L3_ROOM_BOTTOM_Y - L3_ROOM_TOP_Y
};

const L3_RIGHT_ROOM = {
  x: 310,
  y: L3_ROOM_TOP_Y,
  w: 250,
  h: L3_ROOM_BOTTOM_Y - L3_ROOM_TOP_Y
};

const L3_START_BOX = { x: 255, y: 240, w: 90, h: 60 };

const L3_DOOR_W = 84;
const L3_LEFT_DOOR = {
  x: L3_LEFT_ROOM.x + 6,
  y: L3_ROOM_BOTTOM_Y,
  w: L3_DOOR_W
};
const L3_RIGHT_DOOR = {
  x: L3_RIGHT_ROOM.x + L3_RIGHT_ROOM.w - L3_DOOR_W - 6,
  y: L3_ROOM_BOTTOM_Y,
  w: L3_DOOR_W
};

const L3_SHAFT_W = 60;

let l3_torchPickup;
let l3_fireZone;

function level3() {}

level3.reset = function () {
  level3InitSnow();
  level3BuildWorld();

  l3_player = {
    x: L3_START_BOX.x + L3_START_BOX.w / 2,
    y: L3_START_BOX.y + L3_START_BOX.h / 2,
    w: 24,
    h: 14,
    vx: 0,
    vy: 0,
    onGround: false,
    frozen: false
  };

  l3_cold = 0.0;
  l3_warmed = 0.0;
  l3_freezeTimer = 0;

  l3_hasTorch = false;

  l3_torchPickup = {
    x: L3_LEFT_ROOM.x + 205,
    y: L3_LEFT_ROOM.y + 82,
    r: 10,
    taken: false
  };

  l3_fireZone = {
    x: L3_RIGHT_ROOM.x + L3_RIGHT_ROOM.w - 70,
    y: L3_RIGHT_ROOM.y + 72,
    r: 30
  };

  l3_gameState = "play";
};

level3.update = function () {
  playMusic(blizzardWind, 0.90);
  if (l3_gameState === "play") {
    level3UpdatePlayer();
    level3UpdateTemperature();
    level3CheckTorchPickup();
    level3CheckWinLose();
  } else if (l3_gameState === "freeze") {
    level3UpdateFreezeSequence();
  }

  if (l3_gameState === "lose") {
    restartLevel();
  }

  if (l3_gameState === "win") {
    nextLevel();
  }
};

level3.draw = function () {
  level3DrawBackground();
  level3UpdateSnow();
  level3DrawSnow();

  level3DrawDugSnow();
  level3DrawWorldWalls();
  level3DrawTorch();
  level3DrawFire();
  level3DrawPlayer();
  level3DrawHUD();
};

level3.keyPressed = function () {
  if (key === "r" || key === "R") {
    restartLevel();
    return;
  }

  if (l3_gameState !== "play") return;

  if (keyCode === 32 || keyCode === UP_ARROW) {
    if (l3_player.onGround) {
      l3_player.vy = L3_JUMP_VY;
      l3_player.onGround = false;
      safePlayOnce(jumpSound, 0.55);
    }
  }
};

let l4_player;
let l4_snow = [];

let l4_solids = [];
let l4_oneWays = [];
let l4_movers = [];
let l4_climbWalls = [];
let l4_standCaps = [];
let l4_icicleTraps = [];
let l4_wallMarks = [];
let l4_groundSpikes = [];

let l4_gameState = "play";

let l4_worldScroll = 0;
const L4_LEVEL_LENGTH = 6200;

const L4_TUNNEL_TOP = 62;
const L4_FLOOR_Y = 352;
const L4_GROUND_H = 48;

const L4_CAMERA_LERP = 0.12;

const L4_GRAVITY = 0.82;
const L4_JUMP_VY = -14.2;
const L4_MOVE_ACCEL = 0.48;
const L4_AIR_ACCEL = 0.24;
const L4_MAX_VX = 3.2;
const L4_GROUND_FRICTION = 0.72;
const L4_AIR_DRAG = 0.985;

const L4_CLIMB_SPEED = 1.85;
const L4_CLIMB_JUMP_X = 5.0;
const L4_CLIMB_JUMP_Y = -10.4;

let l4_snowball;
const L4_BALL_R = 120;
const L4_BALL_SPEED = 1.15;
const L4_BALL_CATCHUP = 0.010;

let l4_torchPickup;
let l4_fireGoal;
let l4_hasTorch = false;
let l4_cold = 0.0;
let l4_checkpointActive = false;
const L4_CHECKPOINT_X = 3510;
const L4_CHECKPOINT_Y = 126;
const L4_COLD_RATE_NO_TORCH = 1.0 / 2400.0;
const L4_TORCH_COOL_RATE = 0.012;
const L4_FIRE_COOL_RATE = 0.05;

const L4_FREEZE_SHOW_FRAMES = 95;
let l4_freezeTimer = 0;

let l4_dangerAmount = 0;

const L4_TRAP_WARN_FRAMES = 24;
const L4_TRAP_GAP_FRAMES = 145;
const L4_TRAP_GROW_FRAMES = 35;

function level4() {}

level4.reset = function () {
  level4InitSnow();
  level4BuildLevel();

  l4_player = {
    x: 250,
    y: L4_FLOOR_Y - 18,
    w: 24,
    h: 14,
    vx: 0,
    vy: 0,
    onGround: false,
    standingPlatform: null,
    climbing: false,
    climbColumn: null,
    frozen: false
  };

  l4_snowball = {
    x: 70,
    y: L4_FLOOR_Y - 120,
    r: 120
  };

  l4_worldScroll = 0;
  l4_hasTorch = false;
  l4_cold = 0;
  l4_freezeTimer = 0;
  l4_dangerAmount = 0;
  l4_checkpointActive = false;

  l4_torchPickup = {
    x: 3510,
    y: 126,
    r: 11,
    taken: false
  };

  l4_fireGoal = {
    x: L4_LEVEL_LENGTH - 150,
    y: L4_FLOOR_Y - 34,
    r: 32
  };

  level4ResetMovingPlatforms();
  level4ResetIcicleTraps();
  l4_gameState = "play";
};

level4.update = function () {
  playMusic(dangerMusic, 1.0);
  if (l4_gameState === "play") {
    level4UpdateMovingPlatforms();
    level4UpdateIcicleTraps();
    level4UpdatePlayer();
    level4UpdateSnowball();
    level4UpdateCamera();
    level4UpdateTemperature();
    level4CheckTorchPickup();
    level4CheckGroundSpikes();
    level4CheckWin();
    level4CheckSnowballDeath();
    level4UpdateDanger();
  } else if (l4_gameState === "freeze") {
    level4UpdateMovingPlatforms();
    level4UpdateIcicleTraps();
    level4UpdateSnowball();
    level4UpdateCamera();
    level4UpdateFreezeState();
    level4UpdateDanger();
  }

  if (l4_gameState === "lose") {
    restartLevel();
  }

  if (l4_gameState === "win") {
    nextLevel();
  }
};

level4.draw = function () {
  push();
  level4ApplyDangerShake();

  level4DrawBackground();
  level4UpdateSnow();
  level4DrawSnow();
  level4DrawTunnel();
  level4DrawFloorAndPlatforms();
  level4DrawGroundSpikes();
  level4DrawClimbWalls();
  level4DrawIcicleTraps();
  level4DrawTorch();
  level4DrawFire();
  level4DrawSnowball();
  level4DrawPlayer();

  pop();

  level4DrawHUD();
};

level4.keyPressed = function () {
  if (key === "r" || key === "R") {
    restartLevel();
    return;
  }

  if (l4_gameState !== "play") return;

  if (keyCode === 32 || keyCode === 87 || keyCode === UP_ARROW) {
    level4DoJump();
    safePlayOnce(jumpSound, 0.55);
  }
};

function level4RespawnAtCheckpoint() {
  level4InitSnow();
  level4BuildLevel();

  l4_player = {
    x: L4_CHECKPOINT_X - 80, // spawn LEFT of torch
    y: L4_FLOOR_Y - 18,      // safe ground spawn
    w: 24,
    h: 14,
    vx: 0,
    vy: 0,
    onGround: false,
    standingPlatform: null,
    climbing: false,
    climbColumn: null,
    frozen: false
  };

  l4_snowball = {
    x: L4_CHECKPOINT_X - 320,
    y: L4_FLOOR_Y - 120,
    r: 120
  };

  l4_worldScroll = max(0, (L4_CHECKPOINT_X - 120) - width * 0.38);

  l4_hasTorch = true;
  l4_cold = 0.15;
  l4_freezeTimer = 0;
  l4_dangerAmount = 0;

  l4_torchPickup = {
    x: 3510,
    y: 126,
    r: 11,
    taken: true
  };

  l4_fireGoal = {
    x: L4_LEVEL_LENGTH - 150,
    y: L4_FLOOR_Y - 34,
    r: 32
  };

  level4ResetMovingPlatforms();
  level4ResetIcicleTraps();
  l4_gameState = "play";
}

let l5_player;
const L5_PLAYER_MAX_HP = 10;

let l5_snowflakes = [];
let l5_bullets = [];

let l5_boss;
const L5_BOSS_MAX_HP = 30000;

const L5_STAGE_THRESHOLDS = [20000, 15000, 5000];
let l5_stage = 0;

let l5_lastShotTime = 0;
const L5_FIRE_RATE_MS = 90;
const L5_BULLET_SPEED = 10;

let l5_gameState = "play";

let l5_freezeFlash = 0;
let l5_loseStartMs = 0;
const L5_LOSE_TEXT_DELAY_MS = 2500;

function level5() {}

level5.reset = function () {
  level5ResetGame();
};

level5.update = function () {
  playMusic(yetiMusic, 0.6);
  if (l5_gameState === "play") {
    level5HandlePlayer();
    level5UpdateSnow();
    level5TryShoot();
    level5UpdateBullets();
    level5CheckSnowCollision();
    level5UpdateStages();
    level5CheckBossDefeated();
  }

  l5_freezeFlash = max(0, l5_freezeFlash - 0.08);

 if (l5_gameState === "win") {
  nextLevel();
}

  if (l5_gameState === "lose") {
    if (millis() - l5_loseStartMs >= L5_LOSE_TEXT_DELAY_MS) {
      restartLevel();
    }
  }
};

level5.draw = function () {
  background(55, 105, 165);
  level5DrawIcyGradient();

  level5DrawWorld();
};

level5.mousePressed = function () {
  // not needed in wrapper version
};

function level1Build() {
  l1_platforms.push(level1MakePlatform(0, 342, 120, 18, false));
  l1_platforms.push(level1MakePlatform(210, 342, 80, 18, true));
  l1_platforms.push(level1MakePlatform(395, 342, 95, 18, false));
  l1_platforms.push(level1MakePlatform(540, 342, 45, 18, true));
  l1_platforms.push(level1MakePlatform(585, 342, 15, 18, false));

  l1_platforms.push(level1MakePlatform(145, 302, 46, 12, true));
  l1_platforms.push(level1MakePlatform(285, 245, 44, 12, true));
  l1_platforms.push(level1MakePlatform(455, 240, 42, 12, true));

  l1_platforms.push(level1MakePlatform(510, 125, 58, 12, true));

  l1_platforms.push(level1MakeMovingPlatform(120, 260, 75, 12, false, 75, 1.45));
  l1_platforms.push(level1MakeMovingPlatform(300, 195, 70, 12, true, 90, 1.85));
  l1_platforms.push(level1MakeMovingPlatform(455, 185, 60, 12, false, 80, 1.55));
}

function level1MakePlatform(x, y, w, h, slippery) {
  return { x, y, w, h, slippery, moving: false, dx: 0 };
}

function level1MakeMovingPlatform(x, y, w, h, slippery, range, speed) {
  return {
    x, y, w, h,
    slippery,
    moving: true,
    baseX: x,
    range: range,
    speed: speed,
    dir: 1,
    dx: 0
  };
}

function level1UpdatePlatforms() {
  for (let p of l1_platforms) {
    p.dx = 0;
    if (!p.moving) continue;

    let oldX = p.x;
    p.x += p.speed * p.dir;

    if (p.x > p.baseX + p.range) {
      p.x = p.baseX + p.range;
      p.dir *= -1;
    } else if (p.x < p.baseX - p.range) {
      p.x = p.baseX - p.range;
      p.dir *= -1;
    }

    p.dx = p.x - oldX;
  }
}

function level1UpdatePlayer() {
  let ax = 0;
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) ax -= L1_MOVE_ACCEL;
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) ax += L1_MOVE_ACCEL;

  l1_player.vx += ax;
  l1_player.vx = constrain(l1_player.vx, -L1_MAX_VX, L1_MAX_VX);

  l1_player.vy += L1_GRAVITY;

  if (l1_player.onGround && l1_player.standingPlatform &&
      l1_player.standingPlatform.moving) {
    l1_player.x += l1_player.standingPlatform.dx;
  }

  l1_player.x += l1_player.vx;
  l1_player.x = constrain(l1_player.x, l1_player.w / 2, width - l1_player.w / 2);

  let prevY = l1_player.y;
  l1_player.y += l1_player.vy;

  l1_player.onGround = false;
  l1_player.standingOnSlippery = false;
  l1_player.standingPlatform = null;

  if (l1_player.vy >= 0) {
    let prevBottom = prevY + l1_player.h / 2;
    let currBottom = l1_player.y + l1_player.h / 2;
    let left = l1_player.x - l1_player.w / 2;
    let right = l1_player.x + l1_player.w / 2;

    for (let p of l1_platforms) {
      let overlapX = right > p.x && left < p.x + p.w;
      let crossedTop = prevBottom <= p.y && currBottom >= p.y;

      if (overlapX && crossedTop) {
        l1_player.y = p.y - l1_player.h / 2;
        l1_player.vy = 0;
        l1_player.onGround = true;
        l1_player.standingOnSlippery = p.slippery;
        l1_player.standingPlatform = p;
        break;
      }
    }
  }

  if (l1_jumpQueued && l1_player.onGround) {
    l1_player.vy = L1_JUMP_VY;
    l1_player.onGround = false;
    l1_player.standingPlatform = null;
  }
  l1_jumpQueued = false;

  if (l1_player.onGround) {
    let f = l1_player.standingOnSlippery ?
      L1_FRICTION_SLIPPERY : L1_FRICTION_NORMAL;
    l1_player.vx *= f;
  } else {
    l1_player.vx *= 0.985;
  }
  
    let l1Moving =
    abs(l1_player.vx) > 0.4 &&
    (
      keyIsDown(LEFT_ARROW) || keyIsDown(65) ||
      keyIsDown(RIGHT_ARROW) || keyIsDown(68)
    );

  updateMovementSounds(
    l1_player.onGround,
    l1Moving,
    l1_player.standingOnSlippery
  );
  
  if (l1_player.y > height + 80) {
    l1_gameState = "lose";
  }
}

function level1CheckPickaxe() {
  if (l1_pickaxe.taken) return;

  if (level1RectOverlap(
    l1_player.x - l1_player.w / 2, l1_player.y - l1_player.h / 2,
    l1_player.w, l1_player.h,
    l1_pickaxe.x - l1_pickaxe.w / 2, l1_pickaxe.y - l1_pickaxe.h / 2,
    l1_pickaxe.w, l1_pickaxe.h
  )) {
    l1_pickaxe.taken = true;
    l1_gameState = "win";
  }
}

function level1InitIcicles() {
  l1_icicles = [];
  for (let x = -10; x <= width + 10; x += L1_ICICLE_SPACING) {
    l1_icicles.push({
      x: x,
      baseLen: random(12, 26),
      state: "present",
      timer: 0
    });
  }
}

function level1UpdateIcicles() {
  for (let ic of l1_icicles) {
    if (ic.state === "missing") {
      ic.timer--;
      if (ic.timer <= 0) {
        ic.state = "growing";
        ic.timer = L1_ICICLE_GROW_FRAMES;
      }
    } else if (ic.state === "growing") {
      ic.timer--;
      if (ic.timer <= 0) {
        ic.state = "present";
        ic.timer = 0;
      }
    }
  }
}

function level1IcicleLength(ic) {
  if (ic.state === "present") return ic.baseLen;
  if (ic.state === "missing") return 0;

  let t = 1 - (ic.timer / L1_ICICLE_GROW_FRAMES);
  return ic.baseLen * constrain(t, 0, 1);
}

function level1FindNearestIcicleIndex(x) {
  let best = 0;
  let bestDist = Infinity;

  for (let i = 0; i < l1_icicles.length; i++) {
    let d = abs(l1_icicles[i].x - x);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}

function level1KnockOutIcicle(i) {
  let ic = l1_icicles[i];
  if (!ic) return;

  if (ic.state === "present") {
    ic.state = "missing";
    ic.timer = L1_ICICLE_GAP_FRAMES;
  }
}

function level1ResetSpikeTimer() {
  l1_spikeTimer = floor(random(40, 85));
}

function level1UpdateSpikeSpawner() {
  l1_spikeTimer--;
  if (l1_spikeTimer <= 0) {
    level1SpawnSpikeEvent();
    level1ResetSpikeTimer();
  }
}

function level1SpawnSpikeEvent() {
  let targetX;

  if (random(1) < 0.55) {
    targetX = constrain(l1_player.x + random(-110, 110), 40, width - 40);
  } else {
    targetX = random(40, width - 40);
  }

  let idx = level1FindNearestIcicleIndex(targetX);
  let snappedX = l1_icicles[idx].x;

  l1_warnings.push({
    x: snappedX,
    t: 0,
    duration: 24,
    icicleIndex: idx
  });
}

function level1UpdateWarnings() {
  for (let i = l1_warnings.length - 1; i >= 0; i--) {
    let w = l1_warnings[i];
    w.t++;

    if (w.t >= w.duration) {
      l1_spikes.push({
        x: w.x,
        y: -30,
        w: 16,
        h: 28,
        vy: random(9, 12)
      });

      level1KnockOutIcicle(w.icicleIndex);
      l1_warnings.splice(i, 1);
    }
  }
}

function level1UpdateSpikes() {
  for (let i = l1_spikes.length - 1; i >= 0; i--) {
    let s = l1_spikes[i];
    s.y += s.vy;

    if (level1RectOverlap(
      l1_player.x - l1_player.w / 2, l1_player.y - l1_player.h / 2,
      l1_player.w, l1_player.h,
      s.x - s.w / 2, s.y - s.h / 2,
      s.w, s.h
    )) {
      safePlayOnce(hitPickaxeSound, 1.2);
      l1_gameState = "lose";
    }

    if (s.y - s.h / 2 > height + 60) {
      l1_spikes.splice(i, 1);
    }
  }
}

function level1InitBackgroundSnow() {
  l1_bgSnow = [];
  for (let i = 0; i < L1_BG_SNOW_COUNT; i++) {
    let big = random(1) < 0.18;
    l1_bgSnow.push({
      x: random(width),
      y: random(height),
      r: big ? random(2.5, 4.5) : random(1.2, 3.0),
      vy: big ? random(0.7, 1.6) : random(0.45, 1.25),
      drift: random(-0.55, 0.55),
      a: big ? random(140, 220) : random(90, 170)
    });
  }
}

function level1UpdateBackgroundSnow() {
  for (let f of l1_bgSnow) {
    f.y += f.vy;
    f.x += f.drift;

    if (f.x < -10) f.x = width + 10;
    if (f.x > width + 10) f.x = -10;

    if (f.y > height + 10) {
      f.y = -10;
      f.x = random(width);

      let big = random(1) < 0.18;
      f.r = big ? random(2.5, 4.5) : random(1.2, 3.0);
      f.vy = big ? random(0.7, 1.6) : random(0.45, 1.25);
      f.drift = random(-0.55, 0.55);
      f.a = big ? random(140, 220) : random(90, 170);
    }
  }
}

function level1DrawBackgroundSnow() {
  noStroke();
  for (let f of l1_bgSnow) {
    fill(255, 255, 255, f.a);
    ellipse(f.x, f.y, f.r);
  }
}

function level1DrawMountainBackdrop() {
  noStroke();

  fill(255, 255, 255, 22);
  beginShape();
  vertex(0, 260);
  vertex(60, 210);
  vertex(110, 235);
  vertex(160, 185);
  vertex(225, 230);
  vertex(290, 170);
  vertex(350, 225);
  vertex(420, 165);
  vertex(485, 220);
  vertex(550, 175);
  vertex(600, 215);
  vertex(600, 400);
  vertex(0, 400);
  endShape(CLOSE);

  fill(255, 255, 255, 36);
  beginShape();
  vertex(0, 300);
  vertex(70, 235);
  vertex(130, 270);
  vertex(190, 205);
  vertex(260, 275);
  vertex(320, 200);
  vertex(385, 280);
  vertex(450, 195);
  vertex(520, 285);
  vertex(600, 230);
  vertex(600, 400);
  vertex(0, 400);
  endShape(CLOSE);

  fill(230, 250, 255, 55);
  beginShape();
  vertex(0, 340);
  vertex(85, 265);
  vertex(155, 330);
  vertex(220, 245);
  vertex(300, 335);
  vertex(365, 250);
  vertex(450, 345);
  vertex(520, 260);
  vertex(600, 330);
  vertex(600, 400);
  vertex(0, 400);
  endShape(CLOSE);
}

function level1DrawWorld() {
  level1DrawCeilingIcicles();
  level1DrawPlatforms();
  level1DrawWarnings();
  level1DrawSpikes();
  level1DrawPickaxeEmbeddedIce_TShape();
  level1DrawPlayerPixelHiker();
}

function level1DrawCeilingIcicles() {
  noStroke();

  for (let ic of l1_icicles) {
    let len = level1IcicleLength(ic);
    if (len <= 0.1) continue;

    let x = ic.x;
    let y0 = L1_ICICLE_Y;

    fill(180, 245, 255, 140);
    triangle(x - 7, y0, x + 7, y0, x, y0 + len);

    fill(120, 220, 255, 120);
    triangle(x - 4, y0, x + 4, y0, x, y0 + len * 0.92);
  }

  fill(255, 255, 255, 18);
  rect(0, 0, width, 6);
}

function level1DrawPlatforms() {
  rectMode(CORNER);
  noStroke();

  for (let p of l1_platforms) {
    if (p.slippery) {
      fill(170, 235, 255);
      rect(p.x, p.y, p.w, p.h, 5);
      fill(120, 220, 255, 110);
      rect(p.x, p.y, p.w, p.h, 5);
    } else {
      fill(245);
      rect(p.x, p.y, p.w, p.h, 5);
      fill(255, 255, 255, 105);
      rect(p.x, p.y, p.w, p.h, 5);
    }

    fill(255, 255, 255, 60);
    rect(p.x + 2, p.y + 1, max(0, p.w - 4), 2, 2);
  }
}

function level1DrawWarnings() {
  rectMode(CORNER);
  for (let w of l1_warnings) {
    noStroke();
    fill(255, 70, 70, 235);
    triangle(w.x - 10, 20, w.x + 10, 20, w.x, 40);
  }
}

function level1DrawSpikes() {
  rectMode(CENTER);
  noStroke();

  for (let s of l1_spikes) {
    fill(210, 245, 255);
    rect(s.x, s.y, s.w, s.h, 2);

    fill(255);
    triangle(
      s.x - s.w / 2, s.y + s.h / 2 - 6,
      s.x + s.w / 2, s.y + s.h / 2 - 6,
      s.x, s.y + s.h / 2 + 10
    );
  }
}

function level1DrawPickaxeEmbeddedIce_TShape() {
  if (l1_pickaxe.taken) return;

  rectMode(CENTER);
  let cx = l1_pickaxe.x;
  let cy = l1_pickaxe.y;

  noStroke();
  fill(200, 250, 255, 150);
  rect(cx, 20, 18, 36, 6);

  fill(120, 220, 255, 85);
  rect(cx, cy + 6, 62, 58, 12);
  fill(180, 245, 255, 70);
  rect(cx, cy + 6, 54, 50, 10);

  stroke(220, 255, 255, 120);
  strokeWeight(2);
  line(cx - 18, cy - 6, cx + 10, cy + 14);
  line(cx + 12, cy - 10, cx - 6, cy + 20);
  noStroke();

  let handleW = 4;
  let handleH = 24;
  let headW = 22;
  let headH = 6;

  let px = cx - 3;
  let py = cy + 10;

  fill(120, 85, 45);
  rect(px, py, handleW, handleH, 2);

  fill(90, 60, 30, 120);
  rect(px + 1, py + 2, handleW - 1, handleH - 2, 2);

  fill(170, 235, 255);
  rect(px + 6, py - 10, headW, headH, 2);

  fill(120, 210, 240, 170);
  rect(px + 6, py - 9, headW, headH - 2, 2);

  fill(220, 255, 255, 220);
  rect(px + 14, py - 11, 4, 2, 1);
}

function level1DrawIcyGradient() {
  rectMode(CORNER);
  noStroke();

  fill(0, 0, 0, 18);
  rect(0, 0, width, 70);

  fill(255, 255, 255, 10);
  rect(0, height - 90, width, 90);
}

function level1DrawPlayerPixelHiker() {
  rectMode(CENTER);
  noStroke();

  let x = l1_player.x;
  let y = l1_player.y - L1_SPRITE_Y_OFFSET;
  let p = 4;

  fill(0, 0, 0, 60);
  rect(x, y + 16, p * 5, p * 2);

  fill(55, 40, 30);
  rect(x - p, y + p * 3, p, p * 2);
  rect(x + p, y + p * 3, p, p * 2);

  fill(30, 25, 20);
  rect(x - p, y + p * 4, p * 1.5, p);
  rect(x + p, y + p * 4, p * 1.5, p);

  fill(205, 60, 60);
  rect(x, y + p, p * 5, p * 4);

  fill(240);
  rect(x, y + p, p * 0.8, p * 4);

  fill(120, 85, 45);
  rect(x - p * 3, y + p, p * 2, p * 4);

  fill(255, 220, 185);
  rect(x, y - p * 3, p * 3.5, p * 3.5);

  fill(25, 35, 80);
  rect(x, y - p * 4.5, p * 3.5, p * 2);

  fill(0);
  rect(x + p * 0.8, y - p * 3, p * 0.6, p * 0.6);
}

function level1RectOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function level2MakePlat(x, y, w, h, icy, solidTop, wallOnly, hidden) {
  return { x, y, w, h, icy, solidTop, wallOnly, hidden: !!hidden };
}

function level2MakeWallWithCap(x, y, w, h) {
  let wall = level2MakePlat(x, y, w, h, true, false, true, false);

  let cap = level2MakePlat(
    x + 2,
    y - L2_CAP_H + 2,
    w - 4,
    L2_CAP_H,
    true,
    true,
    false,
    true
  );

  return [wall, cap];
}

function level2DrawBackground() {
  rectMode(CORNER);

  for (let y = 0; y < height; y++) {
    let t = map(y, 0, height, 0, 1);
    let c = lerpColor(color(55, 105, 165), color(55, 105, 165), t);
    stroke(c);
    line(0, y, width, y);
  }
  noStroke();

  fill(70, 135, 205, 150);
  level2DrawSharpMountain(20, 300, 260, 170);
  level2DrawSharpMountain(260, 320, 300, 200);
  level2DrawSharpMountain(470, 310, 240, 170);

  fill(205, 235, 255, 190);
  level2DrawSharpMountain(60, 350, 280, 220);
  level2DrawSharpMountain(330, 360, 320, 240);

  fill(255, 255, 255, 18);
  rect(0, 0, width, height);
}

function level2DrawSnowBank() {
  rectMode(CORNER);
  noStroke();

  fill(255, 255, 255, 220);
  rect(0, L2_WORLD_FLOOR_Y - 26, width, 60);

  fill(255, 255, 255, 140);
  rect(0, L2_WORLD_FLOOR_Y - 30, width, 6);
}

function level2DrawSharpMountain(x, baseY, w, h) {
  beginShape();
  vertex(x, baseY);
  vertex(x + w * 0.15, baseY - h * 0.9);
  vertex(x + w * 0.3, baseY - h);
  vertex(x + w * 0.5, baseY - h * 0.75);
  vertex(x + w * 0.7, baseY - h * 0.95);
  vertex(x + w * 0.9, baseY - h * 0.6);
  vertex(x + w, baseY);
  endShape(CLOSE);
}

function level2UpdateSnow() {
  noStroke();
  fill(255);

  for (let s of l2_snowflakes) {
    s.y += s.vy;
    s.x += s.drift;

    if (s.y > height + 5) {
      s.y = -5;
      s.x = random(width);
    }
    if (s.x < -10) s.x = width + 10;
    if (s.x > width + 10) s.x = -10;

    ellipse(s.x, s.y, s.r);
  }
}

function level2DrawPlatforms() {
  rectMode(CORNER);
  noStroke();

  for (let p of l2_platforms) {
    if (p.hidden) continue;

    if (p.solidTop && !p.wallOnly && p.y >= L2_WORLD_FLOOR_Y) {
      fill(255);
      rect(p.x, p.y, p.w, p.h);
      fill(245);
      rect(p.x, p.y, p.w, 10);
      continue;
    }

    if (p.solidTop && !p.wallOnly) {
      fill(245);
      rect(p.x, p.y, p.w, p.h, 6);
      fill(255, 255, 255, 90);
      rect(p.x + 4, p.y + 2, p.w - 8, 3, 4);
      continue;
    }

    fill(155, 210, 255);
    rect(p.x, p.y, p.w, p.h, 8);

    fill(255, 255, 255, 70);
    rect(p.x + 4, p.y + 10, 6, p.h - 20, 4);
  }
}

function level2DrawFire() {
  rectMode(CORNER);

  const fx = L2_FIRE_X;
  const fy = L2_FIRE_PLATFORM.y - 10;

  noStroke();
  for (let i = 0; i < 7; i++) {
    fill(255, 150, 70, 30 - i * 4);
    ellipse(fx, fy, 220 - i * 22, 220 - i * 22);
  }

  fill(95, 60, 35);
  rect(fx - 22, L2_FIRE_PLATFORM.y - 8, 44, 8, 4);

  fill(255, 170, 70);
  level2FlameShape(fx - 8, fy + 4, 18, 26);
  fill(255, 70, 50);
  level2FlameShape(fx + 5, fy + 8, 14, 22);
  fill(255, 235, 110);
  level2FlameShape(fx - 1, fy + 12, 10, 16);
}

function level2FlameShape(x, y, w, h) {
  beginShape();
  vertex(x, y);
  bezierVertex(x - w * 0.5, y - h * 0.2, x - w * 0.4, y - h * 0.9, x, y - h);
  bezierVertex(x + w * 0.4, y - h * 0.9, x + w * 0.5, y - h * 0.2, x, y);
  endShape(CLOSE);
}

function level2UpdatePlayer() {
  let left = keyIsDown(65) || keyIsDown(LEFT_ARROW);
  let right = keyIsDown(68) || keyIsDown(RIGHT_ARROW);

  let targetVx = 0;
  if (left) targetVx = -L2_MOVE_SPEED;
  if (right) targetVx = L2_MOVE_SPEED;

  if (l2_player.onGround) {
    l2_player.vx = lerp(l2_player.vx, targetVx, L2_GROUND_CONTROL);
  } else {
    l2_player.vx = lerp(l2_player.vx, targetVx, L2_AIR_CONTROL);
    l2_player.vx *= L2_AIR_DRAG;
  }
  l2_player.vx = constrain(l2_player.vx, -9, 9);

  if (!l2_player.wallCling) {
    l2_player.vy += L2_GRAVITY;
  } else {
    l2_player.vy = max(l2_player.vy, 0.625);
  }

  l2_player.onGround = false;

  level2MoveAndResolveX();
  level2MoveAndResolveY();

  if (!l2_player.onGround) {
    let contact = level2GetWallContact();
    if (contact.touching) {
      l2_player.wallCling = true;
      l2_player.clingSide = contact.side;
      l2_player.wallIndex = contact.wallIndex;

      if (l2_player.mustSwitchWall &&
          l2_player.wallIndex !== l2_player.lastWallJumpIndex) {
        l2_player.mustSwitchWall = false;
      }
    } else {
      l2_player.wallCling = false;
      l2_player.clingSide = 0;
      l2_player.wallIndex = -1;
    }
  } else {
    l2_player.wallCling = false;
    l2_player.clingSide = 0;
    l2_player.wallIndex = -1;
    l2_player.mustSwitchWall = false;
  }
  
    let l2Moving =
    abs(l2_player.vx) > 0.4 &&
    (
      keyIsDown(LEFT_ARROW) || keyIsDown(65) ||
      keyIsDown(RIGHT_ARROW) || keyIsDown(68)
    );

  updateMovementSounds(
    l2_player.onGround,
    l2Moving,
    false
  );
  
}

function level2MoveAndResolveX() {
  l2_player.x += l2_player.vx;
  l2_player.x = constrain(l2_player.x, 10, width - 10);

  let pr = level2PlayerRect();

  for (let i = 0; i < l2_platforms.length; i++) {
    let p = l2_platforms[i];
    if (!p.wallOnly) continue;

    let playerTop = pr.y;
    let playerBottom = pr.y + pr.h;

    if (l2_player.vy < 0 && playerTop <= p.y + L2_CLEAR_EDGE_PAD) continue;
    if (playerBottom <= p.y + L2_WALL_LIP_PAD) continue;

    let overlapY =
      pr.y < p.y + p.h - L2_WALL_Y_PAD &&
      pr.y + pr.h > p.y + L2_WALL_Y_PAD;
    if (!overlapY) continue;

    if (!level2RectOverlap(pr, p)) continue;

    if (l2_player.vx > 0) {
      l2_player.x = p.x - l2_player.w / 2;
    } else if (l2_player.vx < 0) {
      l2_player.x = p.x + p.w + l2_player.w / 2;
    } else {
      let dl = abs(pr.x + pr.w - p.x);
      let dr = abs(pr.x - (p.x + p.w));
      if (dl < dr) l2_player.x = p.x - l2_player.w / 2;
      else l2_player.x = p.x + p.w + l2_player.w / 2;
    }

    pr = level2PlayerRect();
  }
}

function level2MoveAndResolveY() {
  l2_player.y += l2_player.vy;

  for (let p of l2_platforms) {
    if (!p.solidTop || p.wallOnly) continue;
    if (!level2RectOverlap(level2PlayerRect(), p)) continue;

    if (l2_player.vy > 0) {
      l2_player.y = p.y - l2_player.h / 2;
      l2_player.vy = 0;
      l2_player.onGround = true;
    } else if (l2_player.vy < 0) {
      l2_player.y = p.y + p.h + l2_player.h / 2;
      l2_player.vy = 0;
    }
  }

  if (l2_player.y > height + 220) {
    l2_gameState = "lose";
  }
}

function level2GetWallContact() {
  let pr = level2PlayerRect();

  for (let i = 0; i < l2_platforms.length; i++) {
    let p = l2_platforms[i];
    if (!p.wallOnly) continue;

    let playerBottom = pr.y + pr.h;
    if (playerBottom <= p.y + L2_WALL_LIP_PAD) continue;

    let overlapY =
      pr.y < p.y + p.h - L2_WALL_Y_PAD &&
      pr.y + pr.h > p.y + L2_WALL_Y_PAD;
    if (!overlapY) continue;

    let distToLeft = abs(pr.x + pr.w - p.x);
    let distToRight = abs(pr.x - (p.x + p.w));

    if (distToLeft <= L2_WALL_STICK_DIST) {
      return { touching: true, side: +1, wallIndex: i };
    }
    if (distToRight <= L2_WALL_STICK_DIST) {
      return { touching: true, side: -1, wallIndex: i };
    }
  }

  return { touching: false, side: 0, wallIndex: -1 };
}

function level2RectOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

function level2PlayerRect() {
  return {
    x: l2_player.x - l2_player.w / 2,
    y: l2_player.y - l2_player.h / 2,
    w: l2_player.w,
    h: l2_player.h
  };
}

function level2DoJump() {
  if (l2_player.onGround) {
    l2_player.vy = L2_JUMP_VEL;
    l2_player.onGround = false;
    return;
  }

  if (l2_player.wallCling) {
    if (l2_player.mustSwitchWall &&
        l2_player.wallIndex === l2_player.lastWallJumpIndex) return;

    l2_player.vy = L2_WALL_JUMP_UP;
    l2_player.vx = -l2_player.clingSide * L2_WALL_JUMP_PUSH;

    l2_player.lastWallJumpIndex = l2_player.wallIndex;
    l2_player.mustSwitchWall = true;

    l2_player.wallCling = false;
    l2_player.clingSide = 0;
    l2_player.wallIndex = -1;
  }
}

function level2UpdateColdWarm() {
  l2_cold += 0.00065;
  l2_cold = constrain(l2_cold, 0, 1);

  if (level2IsAtFire()) {
    l2_warmed += 0.025;
    l2_warmed = constrain(l2_warmed, 0, 1);

    l2_cold -= 0.015;
    l2_cold = constrain(l2_cold, 0, 1);

    l2_winTimer++;
  } else {
    l2_warmed -= 0.012;
    l2_warmed = constrain(l2_warmed, 0, 1);
    l2_winTimer = 0;
  }
}

function level2IsAtFire() {
  return (
    l2_player.x > L2_FIRE_PLATFORM.x - 10 &&
    l2_player.x < L2_FIRE_PLATFORM.x + L2_FIRE_PLATFORM.w + 10 &&
    l2_player.y < L2_FIRE_PLATFORM.y + 30
  );
}

function level2CheckWinLose() {
  if (l2_cold >= 1 && l2_warmed < 0.25) {
    safePlayOnce(deathByColdSound, 0.9);
    l2_gameState = "lose_wait";
    l2_loseDelayFrames = 0;
    return;
  }

  if (l2_winTimer > 140) {
    l2_gameState = "win";
  }
}

function level2DrawPlayerPixelHikerWithPickaxe() {
  rectMode(CENTER);
  noStroke();

  let x = l2_player.x;
  let y = l2_player.y;
  let p = 4;

  let f = constrain(l2_cold - l2_warmed * 0.8, 0, 1);

  function icy(r, g, b, a = 255) {
    let base = color(r, g, b, a);
    let ice = color(170, 235, 255, a);
    return lerpColor(base, ice, f);
  }

  fill(0, 0, 0, 60);
  rect(x, y + 16, p * 5, p * 2);

  fill(icy(55, 40, 30));
  rect(x - p, y + p * 3, p, p * 2);
  rect(x + p, y + p * 3, p, p * 2);

  fill(30, 25, 20);
  rect(x - p, y + p * 4, p * 1.5, p);
  rect(x + p, y + p * 4, p * 1.5, p);

  fill(icy(205, 60, 60));
  rect(x, y + p, p * 5, p * 4);

  fill(icy(240, 240, 240));
  rect(x, y + p, p * 0.8, p * 4);

  fill(icy(120, 85, 45));
  rect(x - p * 3, y + p, p * 2, p * 4);

  fill(icy(255, 220, 185));
  rect(x, y - p * 3, p * 3.5, p * 3.5);

  fill(icy(25, 35, 80));
  rect(x, y - p * 4.5, p * 3.5, p * 2);

  fill(0);
  rect(x + p * 0.8, y - p * 3, p * 0.6, p * 0.6);

  stroke(70, 55, 40);
  strokeWeight(3);
  line(x + p * 3.2, y - p * 1.5, x + p * 3.2, y - p * 8.5);

  stroke(170);
  strokeWeight(4);
  line(x + p * 1.0, y - p * 8.5, x + p * 5.4, y - p * 8.5);

  strokeWeight(2);
  line(x + p * 1.0, y - p * 8.5, x + p * 0.5, y - p * 7.7);
  line(x + p * 5.4, y - p * 8.5, x + p * 5.9, y - p * 7.7);

  noStroke();
}

function level2DrawIceCubeOverPlayer() {
  rectMode(CENTER);

  let cx = l2_player.x;
  let cy = l2_player.y - 2;
  let w = 44;
  let h = 44;

  noStroke();
  fill(170, 235, 255, 60);
  rect(cx, cy, w + 10, h + 10, 10);

  stroke(255, 255, 255, 160);
  strokeWeight(2);
  fill(150, 220, 255, 90);
  rect(cx, cy, w, h, 8);

  noStroke();
  fill(255, 255, 255, 70);
  rect(cx - 8, cy - 10, w * 0.28, h * 0.65, 6);

  stroke(255, 255, 255, 110);
  strokeWeight(1);
  line(cx - 6, cy + 6, cx + 10, cy - 8);
  line(cx + 6, cy + 12, cx + 14, cy + 2);

  noStroke();
}

function level2DrawHUD() {
  rectMode(CORNER);
  noStroke();
  fill(0, 0, 0, 90);
  rect(12, 12, 150, 16, 6);

  fill(120, 200, 255, 190);
  rect(12, 12, 150 * l2_cold, 16, 6);

  fill(255, 120, 80, 170);
  rect(12, 12, 150 * l2_warmed, 16, 6);

  fill(15, 30, 55);
  textSize(12);
  textAlign(LEFT, CENTER);
  text("TEMP", 18, 20);
}

function level3ShaftGap() {
  return {
    x: (L3_START_BOX.x + L3_START_BOX.w / 2) - L3_SHAFT_W / 2,
    w: L3_SHAFT_W
  };
}

function level3StepPlatform() {
  let g = level3ShaftGap();
  return {
    x: g.x - 42,
    y: L3_HALL_Y + 34,
    w: 52,
    h: 8,
    oneWay: true
  };
}

function level3BuildWorld() {
  l3_solids = [];

  l3_solids.push(level3RectSolid(0, L3_FLOOR_Y, width, height - L3_FLOOR_Y));

  level3AddHallCeilingWithGaps([
    { x: L3_LEFT_DOOR.x, w: L3_LEFT_DOOR.w },
    { x: L3_RIGHT_DOOR.x, w: L3_RIGHT_DOOR.w },
    { x: level3ShaftGap().x, w: level3ShaftGap().w }
  ]);

  l3_solids.push(level3RectSolid(-L3_WALL, L3_HALL_Y, L3_WALL, L3_HALL.h));
  l3_solids.push(level3RectSolid(width, L3_HALL_Y, L3_WALL, L3_HALL.h));

  level3AddRoomShellCut(L3_LEFT_ROOM, L3_START_BOX);
  level3AddRoomShellCut(L3_RIGHT_ROOM, L3_START_BOX);

  level3AddStartBoxShell();

  let sp = level3StepPlatform();
  l3_solids.push(sp);

  level3AddRoomParkourClean();
}

function level3RectSolid(x, y, w, h) {
  return { x, y, w, h, oneWay: false };
}

function level3AddHallCeilingWithGaps(gaps) {
  let y = L3_HALL_Y;
  let h = L3_WALL;

  let segments = [{ x0: 0, x1: width }];

  for (let g of gaps) {
    let gx0 = g.x;
    let gx1 = g.x + g.w;
    let next = [];

    for (let s of segments) {
      if (gx1 <= s.x0 || gx0 >= s.x1) {
        next.push(s);
        continue;
      }
      if (gx0 > s.x0) next.push({ x0: s.x0, x1: gx0 });
      if (gx1 < s.x1) next.push({ x0: gx1, x1: s.x1 });
    }
    segments = next;
  }

  for (let s of segments) {
    let w = s.x1 - s.x0;
    if (w > 0) l3_solids.push(level3RectSolid(s.x0, y, w, h));
  }
}

function level3AddRoomShellCut(r, cutRect) {
  level3PushSolidExcludingRect(
    r.x - L3_WALL,
    r.y - L3_WALL,
    r.w + L3_WALL * 2,
    L3_WALL,
    cutRect
  );
  level3PushSolidExcludingRect(
    r.x - L3_WALL,
    r.y - L3_WALL,
    L3_WALL,
    r.h + L3_WALL,
    cutRect
  );
  level3PushSolidExcludingRect(
    r.x + r.w,
    r.y - L3_WALL,
    L3_WALL,
    r.h + L3_WALL,
    cutRect
  );
}

function level3PushSolidExcludingRect(x, y, w, h, cut) {
  let a = { x, y, w, h };
  if (!level3RectOverlap(a, cut)) {
    l3_solids.push(level3RectSolid(x, y, w, h));
    return;
  }

  let ix0 = max(a.x, cut.x);
  let iy0 = max(a.y, cut.y);
  let ix1 = min(a.x + a.w, cut.x + cut.w);
  let iy1 = min(a.y + a.h, cut.y + cut.h);

  if (iy0 > a.y) l3_solids.push(level3RectSolid(a.x, a.y, a.w, iy0 - a.y));
  if (iy1 < a.y + a.h) {
    l3_solids.push(level3RectSolid(a.x, iy1, a.w, (a.y + a.h) - iy1));
  }

  let midH = iy1 - iy0;
  if (midH > 0) {
    if (ix0 > a.x) l3_solids.push(level3RectSolid(a.x, iy0, ix0 - a.x, midH));
    if (ix1 < a.x + a.w) {
      l3_solids.push(level3RectSolid(ix1, iy0, (a.x + a.w) - ix1, midH));
    }
  }
}

function level3AddStartBoxShell() {
  const r = L3_START_BOX;

  l3_solids.push(level3RectSolid(r.x, r.y, r.w, L3_WALL));
  l3_solids.push(level3RectSolid(r.x, r.y, L3_WALL, r.h));
  l3_solids.push(level3RectSolid(r.x + r.w - L3_WALL, r.y, L3_WALL, r.h));

  let lipY = r.y + r.h - L3_WALL;
  l3_solids.push(level3RectSolid(r.x, lipY, 18, L3_WALL));
  l3_solids.push(level3RectSolid(r.x + r.w - 18, lipY, 18, L3_WALL));
}

function level3AddRoomParkourClean() {
  l3_solids.push(level3RectSolid(L3_LEFT_ROOM.x + 22, L3_LEFT_ROOM.y + 215, 78, 10));
  l3_solids.push(level3RectSolid(L3_LEFT_ROOM.x + 112, L3_LEFT_ROOM.y + 175, 78, 10));
  l3_solids.push(level3RectSolid(L3_LEFT_ROOM.x + 170, L3_LEFT_ROOM.y + 135, 70, 10));

  l3_solids.push(level3RectSolid(L3_RIGHT_ROOM.x + 150, L3_RIGHT_ROOM.y + 215, 80, 10));
  l3_solids.push(level3RectSolid(L3_RIGHT_ROOM.x + 80, L3_RIGHT_ROOM.y + 175, 78, 10));
  l3_solids.push(level3RectSolid(L3_RIGHT_ROOM.x + 40, L3_RIGHT_ROOM.y + 135, 78, 10));
}

function level3UpdatePlayer() {
  let left = keyIsDown(LEFT_ARROW) || keyIsDown(65);
  let right = keyIsDown(RIGHT_ARROW) || keyIsDown(68);

  if (left) l3_player.vx -= L3_MOVE_ACCEL;
  if (right) l3_player.vx += L3_MOVE_ACCEL;

  if (level3IsInHallway(l3_player.x, l3_player.y)) {
    let windPush = L3_WIND_FORCE;
    if (!l3_player.onGround) windPush *= 1.45;
    l3_player.vx += windPush;
    l3_player.vx = max(l3_player.vx, -L3_MAX_VX - L3_WIND_EXTRA_CLAMP);
  }

  l3_player.vx = constrain(l3_player.vx, -L3_MAX_VX, L3_MAX_VX);
  l3_player.vy += L3_GRAVITY;

  l3_player.onGround = false;

  level3MoveAndCollideX();
  level3MoveAndCollideY();

  if (l3_player.onGround) l3_player.vx *= L3_GROUND_FRICTION;
  else l3_player.vx *= L3_AIR_DRAG;

  if (l3_player.y > height + 120) l3_gameState = "lose";
  
    let l3Moving =
    abs(l3_player.vx) > 0.4 &&
    (
      keyIsDown(LEFT_ARROW) || keyIsDown(65) ||
      keyIsDown(RIGHT_ARROW) || keyIsDown(68)
    );

  updateMovementSounds(
    l3_player.onGround,
    l3Moving,
    false
  );
  
}

function level3UpdateFreezeSequence() {
  l3_player.vx = 0;
  l3_player.vy = 0;
  l3_freezeTimer--;

  if (l3_freezeTimer <= 0) {
    l3_gameState = "lose";
  }
}

function level3MoveAndCollideX() {
  l3_player.x += l3_player.vx;

  let pr = level3PlayerRect();
  for (let s of l3_solids) {
    if (s.oneWay) continue;
    if (!level3RectOverlap(pr, s)) continue;

    if (l3_player.vx > 0) l3_player.x = s.x - l3_player.w / 2;
    else if (l3_player.vx < 0) l3_player.x = s.x + s.w + l3_player.w / 2;

    l3_player.vx = 0;
    pr = level3PlayerRect();
  }

  l3_player.x = constrain(l3_player.x, l3_player.w / 2, width - l3_player.w / 2);
}

function level3MoveAndCollideY() {
  let prevBottom = l3_player.y + l3_player.h / 2;
  l3_player.y += l3_player.vy;

  let pr = level3PlayerRect();
  for (let s of l3_solids) {
    if (!level3RectOverlap(pr, s)) continue;

    if (s.oneWay) {
      let stepTop = s.y;

      let horizontallyOver =
        pr.x + pr.w > s.x &&
        pr.x < s.x + s.w;

      let crossingFromAbove =
        l3_player.vy >= 0 &&
        prevBottom <= stepTop &&
        l3_player.y + l3_player.h / 2 >= stepTop;

      if (horizontallyOver && crossingFromAbove) {
        l3_player.y = stepTop - l3_player.h / 2;
        l3_player.vy = 0;
        l3_player.onGround = true;
        pr = level3PlayerRect();
      }

      continue;
    }

    if (l3_player.vy > 0) {
      l3_player.y = s.y - l3_player.h / 2;
      l3_player.vy = 0;
      l3_player.onGround = true;
    } else if (l3_player.vy < 0) {
      l3_player.y = s.y + s.h + l3_player.h / 2;
      l3_player.vy = 0;
    }

    pr = level3PlayerRect();
  }
}

function level3PlayerRect() {
  return {
    x: l3_player.x - l3_player.w / 2,
    y: l3_player.y - l3_player.h / 2,
    w: l3_player.w,
    h: l3_player.h
  };
}

function level3RectOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function level3IsInHallway(x, y) {
  return x >= 0 && x <= width && y > L3_HALL_Y && y < L3_FLOOR_Y;
}

function level3IsInRoom(x, y) {
  return (
    level3PointInRect(x, y, L3_LEFT_ROOM) ||
    level3PointInRect(x, y, L3_RIGHT_ROOM) ||
    level3PointInRect(x, y, L3_START_BOX)
  );
}

function level3PointInRect(x, y, r) {
  return x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h;
}

function level3IsAtFire() {
  let dx = l3_player.x - l3_fireZone.x;
  let dy = (l3_player.y - 10) - l3_fireZone.y;
  return dx * dx + dy * dy <= l3_fireZone.r * l3_fireZone.r;
}

function level3UpdateTemperature() {
  if (level3IsAtFire()) {
    l3_cold -= L3_FIRE_COOL_RATE;
    l3_warmed += 0.02;
  } else {
    const inMiddleBox = level3PointInRect(l3_player.x, l3_player.y, L3_START_BOX);
    const inRoom = level3IsInRoom(l3_player.x, l3_player.y);
    const inHall = level3IsInHallway(l3_player.x, l3_player.y);

    if (l3_hasTorch && inMiddleBox) {
      l3_cold -= L3_TORCH_WARM_RATE_MIDDLE;
      l3_warmed += 0.03;
    } else {
      let rate = inRoom ? L3_COLD_RATE_ROOMS : L3_COLD_RATE_HALL;

      if (l3_hasTorch) {
        if (inHall) rate *= L3_TORCH_MULT_HALL;
        else rate *= L3_TORCH_MULT_ROOMS;
      }

      l3_cold += rate;
      l3_warmed -= 0.006;
    }
  }

  l3_cold = constrain(l3_cold, 0, 1);
  l3_warmed = constrain(l3_warmed, 0, 1);
}

function level3CheckTorchPickup() {
  if (l3_torchPickup.taken) return;

  let dx = l3_player.x - l3_torchPickup.x;
  let dy = (l3_player.y - 8) - l3_torchPickup.y;

  if (dx * dx + dy * dy <= (l3_torchPickup.r + 10) * (l3_torchPickup.r + 10)) {
  l3_torchPickup.taken = true;
  l3_hasTorch = true;
  safePlayOnce(fireSound, 2.0);
  }
}

function level3StartFreezeDeath() {
  safePlayOnce(deathByColdSound, 0.9);

  l3_player.frozen = true;
  l3_player.vx = 0;
  l3_player.vy = 0;
  l3_freezeTimer = L3_FREEZE_SHOW_FRAMES;
  l3_gameState = "freeze";
}

function level3CheckWinLose() {
  if (l3_cold >= 1) {
    level3StartFreezeDeath();
    return;
  }
  if (level3IsAtFire()) {
    l3_gameState = "win";
  }
}

function level3DrawBackground() {
  background(255);

  fill(160, 220, 255, 55 * l3_cold);
  noStroke();
  rect(0, 0, width, height);
}

function level3DrawDugSnow() {
  rectMode(CORNER);
  noStroke();

  fill(255);
  rect(0, 0, width, height);

  fill(245, 250, 255);
  rect(L3_LEFT_ROOM.x - 24, L3_LEFT_ROOM.y - 24, L3_LEFT_ROOM.w + 48, L3_LEFT_ROOM.h + 48, 22);
  rect(L3_RIGHT_ROOM.x - 24, L3_RIGHT_ROOM.y - 24, L3_RIGHT_ROOM.w + 48, L3_RIGHT_ROOM.h + 48, 22);

  level3DrawIcyCaveBackdrop(L3_LEFT_ROOM);
  level3DrawIcyCaveBackdrop(L3_RIGHT_ROOM);

  fill(150, 205, 235, 150);
  rect(L3_START_BOX.x, L3_START_BOX.y, L3_START_BOX.w, L3_START_BOX.h, 10);

  fill(255, 255, 255, 45);
  rect(L3_START_BOX.x + 6, L3_START_BOX.y + 6, L3_START_BOX.w - 12, 10, 5);

  fill(125, 180, 220, 165);
  rect(0, L3_HALL_Y, width, L3_HALL.h, 10);

  fill(255, 255, 255, 24);
  rect(0, L3_HALL_Y, width, 12, 8);

  level3DrawWindStreaks();

  let sp = level3StepPlatform();
  fill(255, 255, 255, 24);
  rect(sp.x - 6, sp.y - 8, sp.w + 12, sp.h + 16, 10);
}

function level3DrawIcyCaveBackdrop(room) {
  fill(110, 165, 210, 185);
  rect(room.x, room.y, room.w, room.h, 16);

  fill(75, 120, 170, 70);
  rect(room.x + 10, room.y + 16, room.w - 20, room.h - 26, 14);

  fill(220, 245, 255, 55);
  rect(room.x + 10, room.y + 8, room.w - 20, 12, 8);

  fill(90, 145, 195, 95);
  beginShape();
  vertex(room.x, room.y + 34);
  vertex(room.x + 24, room.y + 18);
  vertex(room.x + 52, room.y + 42);
  vertex(room.x + 84, room.y + 16);
  vertex(room.x + 116, room.y + 36);
  vertex(room.x + 146, room.y + 12);
  vertex(room.x + 178, room.y + 40);
  vertex(room.x + 210, room.y + 20);
  vertex(room.x + room.w, room.y + 38);
  vertex(room.x + room.w, room.y);
  vertex(room.x, room.y);
  endShape(CLOSE);

  fill(190, 235, 255, 28);
  rect(room.x + 12, room.y + 40, 18, room.h - 70, 10);
  rect(room.x + room.w - 30, room.y + 55, 18, room.h - 90, 10);

  fill(230, 248, 255, 120);
  level3DrawIcicleRow(room.x + 16, room.y + 6, room.w - 32, 12);

  fill(240, 248, 255, 55);
  ellipse(room.x + 42, room.y + room.h - 6, 90, 26);
  ellipse(room.x + room.w / 2, room.y + room.h - 5, 130, 24);
  ellipse(room.x + room.w - 42, room.y + room.h - 6, 88, 26);

  level3DrawCrystal(room.x + 28, room.y + room.h - 30, 16, 24);
  level3DrawCrystal(room.x + room.w - 38, room.y + room.h - 34, 18, 28);
  level3DrawCrystal(room.x + room.w / 2 + 18, room.y + room.h - 26, 14, 20);
}

function level3DrawIcicleRow(x, y, w, count) {
  let gap = w / count;
  for (let i = 0; i < count; i++) {
    let ix = x + i * gap + 2;
    let ih = 10 + (i % 3) * 6;
    triangle(ix, y, ix + gap * 0.55, y, ix + gap * 0.28, y + ih);
  }
}

function level3DrawCrystal(x, y, w, h) {
  fill(215, 245, 255, 100);
  beginShape();
  vertex(x, y);
  vertex(x + w * 0.35, y - h);
  vertex(x + w, y - h * 0.35);
  vertex(x + w * 0.7, y);
  endShape(CLOSE);

  fill(255, 255, 255, 70);
  beginShape();
  vertex(x + w * 0.28, y - h * 0.15);
  vertex(x + w * 0.42, y - h * 0.82);
  vertex(x + w * 0.6, y - h * 0.28);
  endShape(CLOSE);
}

function level3DrawWorldWalls() {
  rectMode(CORNER);
  noStroke();

  for (let s of l3_solids) {
    fill(240);
    rect(s.x, s.y, s.w, s.h, 6);

    fill(255, 255, 255, 70);
    rect(s.x + 2, s.y + 2, max(0, s.w - 4), 3, 4);
  }

  fill(255, 255, 255, 25);
  rect(L3_LEFT_DOOR.x, L3_HALL_Y - 2, L3_LEFT_DOOR.w, 8, 6);
  rect(L3_RIGHT_DOOR.x, L3_HALL_Y - 2, L3_RIGHT_DOOR.w, 8, 6);
  rect(level3ShaftGap().x, L3_HALL_Y - 2, level3ShaftGap().w, 8, 6);
}

function level3DrawWindStreaks() {
  noStroke();
  for (let i = 0; i < 18; i++) {
    let yy = random(L3_HALL_Y + 10, L3_FLOOR_Y - 10);
    let len = random(40, 100);
    let xx = random(10, width - 10);

    fill(255, 255, 255, 48);
    rect(xx, yy, len, 2, 2);

    fill(200, 245, 255, 30);
    rect(xx + 12, yy + 3, len * 0.55, 2, 2);
  }
}

function level3DrawTorch() {
  if (l3_torchPickup.taken) return;

  let x = l3_torchPickup.x;
  let y = l3_torchPickup.y;

  noStroke();
  for (let i = 0; i < 5; i++) {
    fill(255, 170, 70, 28 - i * 5);
    ellipse(x, y, 58 - i * 10);
  }

  stroke(90, 60, 30);
  strokeWeight(4);
  line(x, y + 14, x, y + 32);

  noStroke();
  fill(255, 190, 80);
  level3Flame(x, y + 2, 14, 18);
  fill(255, 70, 55);
  level3Flame(x + 2, y + 6, 10, 14);
}

function level3DrawFire() {
  let x = l3_fireZone.x;
  let y = l3_fireZone.y;

  noStroke();
  for (let i = 0; i < 7; i++) {
    fill(255, 150, 70, 30 - i * 4);
    ellipse(x, y, 210 - i * 20);
  }

  rectMode(CENTER);
  fill(95, 60, 35);
  rect(x, y + 22, 44, 8, 4);

  fill(255, 170, 70);
  level3Flame(x - 6, y + 14, 22, 28);
  fill(255, 70, 50);
  level3Flame(x + 8, y + 18, 18, 24);
  fill(255, 235, 110);
  level3Flame(x + 1, y + 22, 12, 18);

  rectMode(CORNER);
}

function level3Flame(x, y, w, h) {
  beginShape();
  vertex(x, y);
  bezierVertex(
    x - w * 0.5,
    y - h * 0.2,
    x - w * 0.4,
    y - h * 0.9,
    x,
    y - h
  );
  bezierVertex(
    x + w * 0.4,
    y - h * 0.9,
    x + w * 0.5,
    y - h * 0.2,
    x,
    y
  );
  endShape(CLOSE);
}

function level3DrawPlayer() {
  rectMode(CENTER);
  noStroke();

  let x = l3_player.x;
  let y = l3_player.y;
  let p = 4;

  fill(0, 0, 0, 60);
  rect(x, y + 16, p * 5, p * 2);

  if (l3_player.frozen || l3_gameState === "freeze") {
    level3DrawFrozenPlayer(x, y, p);
    rectMode(CORNER);
    return;
  }

  if (l3_hasTorch) {
    for (let i = 0; i < 6; i++) {
      fill(255, 170, 70, 22 - i * 3);
      ellipse(x + 10, y - 10, 120 - i * 18);
    }
  }

  let f = l3_cold;
  function icy(r, g, b, a = 255) {
    let base = color(r, g, b, a);
    let ice = color(170, 235, 255, a);
    return lerpColor(base, ice, f);
  }

  fill(icy(55, 40, 30));
  rect(x - p, y + p * 3, p, p * 2);
  rect(x + p, y + p * 3, p, p * 2);

  fill(30, 25, 20);
  rect(x - p, y + p * 4, p * 1.5, p);
  rect(x + p, y + p * 4, p * 1.5, p);

  fill(icy(205, 60, 60));
  rect(x, y + p, p * 5, p * 4);

  fill(icy(240, 240, 240));
  rect(x, y + p, p * 0.8, p * 4);

  fill(icy(120, 85, 45));
  rect(x - p * 3, y + p, p * 2, p * 4);

  fill(icy(255, 220, 185));
  rect(x, y - p * 3, p * 3.5, p * 3.5);

  fill(icy(25, 35, 80));
  rect(x, y - p * 4.5, p * 3.5, p * 2);

  fill(0);
  rect(x + p * 0.8, y - p * 3, p * 0.6, p * 0.6);

  rectMode(CORNER);
}

function level3DrawFrozenPlayer(x, y, p) {
  fill(155, 215, 245, 210);
  rect(x - p, y + p * 3, p, p * 2);
  rect(x + p, y + p * 3, p, p * 2);
  rect(x, y + p, p * 5, p * 4);
  rect(x - p * 3, y + p, p * 2, p * 4);
  rect(x, y - p * 3, p * 3.5, p * 3.5);
  rect(x, y - p * 4.5, p * 3.5, p * 2);

  rectMode(CENTER);
  noStroke();
  fill(175, 235, 255, 95);
  rect(x, y - 2, 38, 46, 6);

  stroke(235, 250, 255, 170);
  strokeWeight(2);
  noFill();
  rect(x, y - 2, 38, 46, 6);

  stroke(255, 255, 255, 120);
  line(x - 12, y - 20, x - 4, y - 12);
  line(x - 6, y + 2, x + 8, y + 12);
  line(x + 4, y - 18, x + 13, y - 8);

  noStroke();
  fill(220, 245, 255, 80);
  rect(x - 4, y - 12, 10, 28, 4);
}

function level3DrawHUD() {
  rectMode(CORNER);

  noStroke();
  fill(0, 0, 0, 90);
  rect(12, 12, 160, 16, 6);

  fill(120, 200, 255, 190);
  rect(12, 12, 160 * l3_cold, 16, 6);

  fill(255, 120, 80, 160);
  rect(12, 12, 160 * l3_warmed, 16, 6);

  fill(255);
  textSize(12);
  textAlign(LEFT, CENTER);
  text("TEMP", 18, 20);

  textAlign(LEFT, TOP);
  fill(255, 255, 255, 210);
  text(l3_hasTorch ? "TORCH: YES" : "TORCH: NO", 12, 38);
}

function level3InitSnow() {
  l3_snow = [];
  for (let i = 0; i < 160; i++) {
    l3_snow.push({
      x: random(width),
      y: random(height),
      r: random(1.2, 3.6),
      vy: random(0.6, 2.0),
      drift: random(-0.5, 0.5),
      a: random(120, 220)
    });
  }
}

function level3UpdateSnow() {
  for (let s of l3_snow) {
    s.y += s.vy;
    s.x += s.drift;

    if (s.y > height + 6) {
      s.y = -6;
      s.x = random(width);
    }
    if (s.x < -10) s.x = width + 10;
    if (s.x > width + 10) s.x = -10;
  }
}

function level3DrawSnow() {
  noStroke();
  for (let s of l3_snow) {
    fill(255, 255, 255, s.a);
    ellipse(s.x, s.y, s.r);
  }
}

function level4BuildLevel() {
  l4_solids = [];
  l4_oneWays = [];
  l4_movers = [];
  l4_climbWalls = [];
  l4_standCaps = [];
  l4_icicleTraps = [];
  l4_wallMarks = [];
  l4_groundSpikes = [];

  level4AddSolid(0, L4_FLOOR_Y, 980, L4_GROUND_H);
  level4AddSolid(1045, L4_FLOOR_Y, 930, L4_GROUND_H);

  level4AddSolid(2840, L4_FLOOR_Y, 980, L4_GROUND_H);
  level4AddSolid(3900, L4_FLOOR_Y, 860, L4_GROUND_H);
  level4AddSolid(4830, L4_FLOOR_Y, 1370, L4_GROUND_H);

  level4AddSolid(640, L4_FLOOR_Y - 26, 84, 26);
  level4AddOneWay(790, L4_FLOOR_Y - 66, 88, 10);
  level4AddSolid(960, L4_FLOOR_Y - 38, 94, 38);
  level4AddOneWay(1120, L4_FLOOR_Y - 78, 88, 10);
  level4AddSolid(1275, L4_FLOOR_Y - 24, 104, 24);
  level4AddOneWay(1395, L4_FLOOR_Y - 64, 84, 10);

  level4AddMovingPlatform(1570, L4_FLOOR_Y - 72, 88, 12, 1570, 1760, 1.0);

  level4AddOneWay(1860, L4_FLOOR_Y - 52, 74, 10);
  level4AddOneWay(1940, L4_FLOOR_Y - 88, 68, 10);
  level4AddClimbColumn(2045, L4_FLOOR_Y - 126, 28, 126, true);
  level4AddOneWay(2108, L4_FLOOR_Y - 152, 84, 10);

  level4AddOneWay(2212, L4_FLOOR_Y - 162, 82, 10);
  level4AddMovingPlatform(2320, L4_FLOOR_Y - 134, 86, 12, 2320, 2465, 0.95);
  level4AddOneWay(2478, L4_FLOOR_Y - 176, 76, 10);
  level4AddMovingPlatform(2580, L4_FLOOR_Y - 142, 88, 12, 2580, 2735, 1.0);
  level4AddOneWay(2738, L4_FLOOR_Y - 170, 78, 10);

  level4AddOneWay(2880, L4_FLOOR_Y - 58, 80, 10);
  level4AddClimbColumn(2960, L4_FLOOR_Y - 126, 26, 126, false);

  level4AddClimbColumn(3090, L4_FLOOR_Y - 196, 26, 196, false);

  level4AddClimbColumn(3220, L4_FLOOR_Y - 160, 26, 160, false);
  level4AddOneWay(3270, L4_FLOOR_Y - 182, 68, 10);

  level4AddMovingPlatform(3345, L4_FLOOR_Y - 168, 78, 12, 3345, 3495, 0.95);
  level4AddOneWay(3470, 190, 82, 10);
  level4AddOneWay(3555, 162, 84, 10);
  level4AddOneWay(3648, 138, 96, 10);

  level4AddOneWay(3488, 208, 84, 10);

  level4AddOneWay(3785, L4_FLOOR_Y - 84, 88, 10);
  level4AddSolid(3925, L4_FLOOR_Y - 30, 104, 30);
  level4AddMovingPlatform(4095, L4_FLOOR_Y - 78, 90, 12, 4095, 4250, 0.9);
  level4AddOneWay(4265, L4_FLOOR_Y - 112, 80, 10);

  level4AddOneWay(4350, L4_FLOOR_Y - 60, 72, 10);
  level4AddClimbColumn(4420, L4_FLOOR_Y - 128, 26, 128, false);

  level4AddClimbColumn(4560, L4_FLOOR_Y - 188, 26, 188, false);

  level4AddClimbColumn(4715, L4_FLOOR_Y - 154, 26, 154, false);
  level4AddOneWay(4765, L4_FLOOR_Y - 176, 78, 10);

  level4AddMovingPlatform(4890, L4_FLOOR_Y - 94, 90, 12, 4890, 5060, 1.0);
  level4AddOneWay(5118, L4_FLOOR_Y - 130, 86, 10);
  level4AddOneWay(5228, L4_FLOOR_Y - 96, 74, 10);

  level4AddSolid(5325, L4_FLOOR_Y - 28, 88, 28);
  level4AddSolid(5480, L4_FLOOR_Y - 52, 94, 52);
  level4AddSolid(5650, L4_FLOOR_Y - 78, 114, 78);

  // smaller moving platform to the left of the final top platform
  level4AddMovingPlatform(5838, L4_FLOOR_Y - 112, 58, 12, 5838, 5920, 0.9);

  // platform above the fire stays here
  level4AddOneWay(5980, L4_FLOOR_Y - 142, 100, 10);

  level4AddIcicleTrap(720);
  level4AddIcicleTrap(880);
  level4AddIcicleTrap(980);
  level4AddIcicleTrap(1120);
  level4AddIcicleTrap(1260);
  level4AddIcicleTrap(1450);
  level4AddIcicleTrap(1710);
  level4AddIcicleTrap(1890);
  level4AddIcicleTrap(2140);
  level4AddIcicleTrap(2260);
  level4AddIcicleTrap(2385);
  level4AddIcicleTrap(2470);
  level4AddIcicleTrap(2605);
  level4AddIcicleTrap(2745);
  level4AddIcicleTrap(2920);
  level4AddIcicleTrap(3060);
  level4AddIcicleTrap(3200);
  level4AddIcicleTrap(3360);
  level4AddIcicleTrap(3500);
  level4AddIcicleTrap(3660);
  level4AddIcicleTrap(3900);
  level4AddIcicleTrap(4060);
  level4AddIcicleTrap(4320);
  level4AddIcicleTrap(4480);
  level4AddIcicleTrap(4700);
  level4AddIcicleTrap(4880);
  level4AddIcicleTrap(5200);
  level4AddIcicleTrap(5360);
  level4AddIcicleTrap(5480);
  level4AddIcicleTrap(5660);
  level4AddIcicleTrap(5900);
  level4AddIcicleTrap(6040);

  level4AddGroundSpikeStrip(530, 3);
  level4AddGroundSpikeStrip(905, 3);
  level4AddGroundSpikeStrip(1185, 4);
  level4AddGroundSpikeStrip(1510, 3);
  level4AddGroundSpikeStrip(2935, 4);
  level4AddGroundSpikeStrip(3725, 3);
  level4AddGroundSpikeStrip(4010, 4);
  level4AddGroundSpikeStrip(4355, 3);
  level4AddGroundSpikeStrip(4890, 4);
  level4AddGroundSpikeStrip(4958, 4);
  level4AddGroundSpikeStrip(5026, 4);
  level4AddGroundSpikeStrip(5075, 4);
  level4AddGroundSpikeStrip(5410, 3);
  level4AddGroundSpikeStrip(5660, 4);
  level4AddGroundSpikeStrip(5728, 4);
  level4AddGroundSpikeStrip(5796, 4);
  level4AddGroundSpikeStrip(5864, 4);
  level4AddGroundSpikeStrip(5932, 4);

  for (let x = 100; x < L4_LEVEL_LENGTH; x += 150) {
    l4_wallMarks.push({
      x: x,
      y: L4_TUNNEL_TOP + 30 + (x % 90)
    });
  }
}

function level4AddSolid(x, y, w, h) {
  l4_solids.push({
    x, y, w, h,
    kind: "solid",
    hidden: false
  });
}

function level4AddOneWay(x, y, w, h) {
  l4_oneWays.push({ x, y, w, h });
}

function level4AddMovingPlatform(x, y, w, h, minX, maxX, speed) {
  l4_movers.push({
    x, y, w, h,
    minX, maxX,
    speed,
    vx: speed,
    dx: 0
  });
}

function level4AddClimbColumn(x, y, w, h, isWhite) {
  l4_climbWalls.push({
    x, y, w, h,
    isWhite: !!isWhite
  });

  l4_standCaps.push({
    x: x - 8,
    y: y - 8,
    w: w + 16,
    h: 8,
    hidden: true,
    isWhite: !!isWhite
  });
}

function level4AddIcicleTrap(x) {
  l4_icicleTraps.push({
    x: x,
    state: "ready",
    timer: 0,
    spike: null,
    baseLen: random(18, 28)
  });
}

function level4AddGroundSpikeStrip(x, count) {
  l4_groundSpikes.push({
    x: x,
    y: L4_FLOOR_Y,
    count: count,
    spacing: 16,
    h: 18
  });
}

function level4ResetMovingPlatforms() {
  for (let p of l4_movers) {
    p.x = p.minX;
    p.vx = abs(p.speed);
    p.dx = 0;
  }
}

function level4ResetIcicleTraps() {
  for (let t of l4_icicleTraps) {
    t.state = "ready";
    t.timer = 0;
    t.spike = null;
  }
}

function level4UpdateCamera() {
  let target = l4_player.x - width * 0.38;
  target = constrain(target, 0, L4_LEVEL_LENGTH - width);
  l4_worldScroll = lerp(l4_worldScroll, target, L4_CAMERA_LERP);
}

function level4UpdateMovingPlatforms() {
  for (let p of l4_movers) {
    let oldX = p.x;
    p.x += p.vx;

    if (p.x <= p.minX) {
      p.x = p.minX;
      p.vx = abs(p.speed);
    }
    if (p.x + p.w >= p.maxX) {
      p.x = p.maxX - p.w;
      p.vx = -abs(p.speed);
    }

    p.dx = p.x - oldX;
  }
}

function level4UpdateSnowball() {
  let targetX = l4_player.x - 225;
  let newX = l4_snowball.x + L4_BALL_SPEED;

  if (newX < targetX) {
    newX += (targetX - newX) * L4_BALL_CATCHUP;
  }

  newX = max(newX, l4_snowball.x);
  newX = max(newX, 70);

  l4_snowball.x = newX;
}

function level4UpdateIcicleTraps() {
  for (let t of l4_icicleTraps) {
    let sx = t.x - l4_worldScroll;
    let aheadOfPlayer = t.x > l4_player.x - 10 && t.x < l4_player.x + 135;
    let nearPlayer = abs(l4_player.x - t.x) < 150;
    let inView = sx > 20 && sx < width - 20;

    if (t.state === "ready") {
      if (inView && nearPlayer) {
        let triggerChance = 0.02;

        if (aheadOfPlayer) triggerChance = 0.055;
        if (t.x > l4_player.x + 45 && t.x < l4_player.x + 95) {
          triggerChance = 0.075;
        }

        if (random(1) < triggerChance) {
          t.state = "warning";
          t.timer = L4_TRAP_WARN_FRAMES;
        }
      }
    } else if (t.state === "warning") {
      t.timer--;
      if (t.timer <= 0) {
        t.state = "missing";
        t.timer = L4_TRAP_GAP_FRAMES;
        t.spike = {
          x: t.x,
          y: L4_TUNNEL_TOP + 12,
          w: 16,
          h: 28,
          vy: random(9.4, 11.9)
        };
      }
    } else if (t.state === "missing") {
      t.timer--;
      if (t.timer <= 0) {
        t.state = "growing";
        t.timer = L4_TRAP_GROW_FRAMES;
      }
    } else if (t.state === "growing") {
      t.timer--;
      if (t.timer <= 0) {
        t.state = "ready";
        t.timer = 0;
      }
    }

    if (t.spike) {
      t.spike.y += t.spike.vy;

      let sr = {
        x: t.spike.x - l4_worldScroll - t.spike.w / 2,
        y: t.spike.y - t.spike.h / 2,
        w: t.spike.w,
        h: t.spike.h
      };

      if (level4RectsOverlap(level4PlayerRect(), sr)) {
        safePlayOnce(hitPickaxeSound, 1.2);
        l4_gameState = "lose";
      }

      if (t.spike.y - t.spike.h / 2 > height + 60) {
        t.spike = null;
      }
    }
  }
}

function level4UpdatePlayer() {
  let left = keyIsDown(LEFT_ARROW) || keyIsDown(65);
  let right = keyIsDown(RIGHT_ARROW) || keyIsDown(68);
  let up = keyIsDown(UP_ARROW) || keyIsDown(87);
  let down = keyIsDown(DOWN_ARROW) || keyIsDown(83);

  let carriedPlatform = l4_player.onGround ? l4_player.standingPlatform : null;
  if (carriedPlatform) {
    l4_player.x += carriedPlatform.dx;
  }

  l4_player.onGround = false;
  l4_player.standingPlatform = null;

  if (!l4_player.climbing) {
    let col = level4GetClimbColumnTouching();
    if (col && !l4_player.onGround && (up || left || right)) {
      level4StartClimbing(col);
    }
  }

  if (l4_player.climbing) {
    level4UpdateClimbing(up, down, left, right);
  } else {
    level4UpdateNormalMovement(left, right);
    level4MoveAndResolveX();
    level4MoveAndResolveY();

    let col = level4GetClimbColumnTouching();
    if (col && !l4_player.onGround && (up || left || right)) {
      level4StartClimbing(col);
    }
  }

  l4_player.x = constrain(l4_player.x, l4_player.w / 2, L4_LEVEL_LENGTH - l4_player.w / 2);

    let l4Moving =
    abs(l4_player.vx) > 0.4 &&
    (
      keyIsDown(LEFT_ARROW) || keyIsDown(65) ||
      keyIsDown(RIGHT_ARROW) || keyIsDown(68)
    );

  updateMovementSounds(
    l4_player.onGround,
    l4Moving,
    false
  );
  
  if (l4_player.y > height + 140) {
    l4_gameState = "lose";
  }
}

function level4UpdateNormalMovement(left, right) {
  if (l4_player.onGround) {
    if (left) l4_player.vx -= L4_MOVE_ACCEL;
    if (right) l4_player.vx += L4_MOVE_ACCEL;
  } else {
    if (left) l4_player.vx -= L4_AIR_ACCEL;
    if (right) l4_player.vx += L4_AIR_ACCEL;
  }

  if (!left && !right && abs(l4_player.vx) < 0.08) {
    l4_player.vx = 0;
  }

  l4_player.vx = constrain(l4_player.vx, -L4_MAX_VX, L4_MAX_VX);
  l4_player.vy += L4_GRAVITY;

  if (l4_player.onGround) l4_player.vx *= L4_GROUND_FRICTION;
  else l4_player.vx *= L4_AIR_DRAG;
}

function level4StartClimbing(col) {
  l4_player.climbing = true;
  l4_player.climbColumn = col;
  l4_player.vx = 0;
  l4_player.vy = 0;
  l4_player.standingPlatform = null;
  l4_player.x = col.x + col.w / 2;
}

function level4StopClimbing() {
  l4_player.climbing = false;
  l4_player.climbColumn = null;
}

function level4UpdateClimbing(up, down, left, right) {
  let col = l4_player.climbColumn;
  if (!col) {
    level4StopClimbing();
    return;
  }

  let cx = col.x + col.w / 2;
  l4_player.x = lerp(l4_player.x, cx, 0.7);
  l4_player.vx = 0;
  l4_player.vy = 0;

  if (up) l4_player.y -= L4_CLIMB_SPEED;
  if (down) l4_player.y += L4_CLIMB_SPEED;

  let topLimit = col.y - l4_player.h / 2 + 6;
  let bottomLimit = col.y + col.h - l4_player.h / 2;
  l4_player.y = constrain(l4_player.y, topLimit, bottomLimit);

  if (up && l4_player.y - l4_player.h / 2 <= col.y + 6) {
    let cap = level4GetStandCapForColumn(col);

    level4StopClimbing();

    if (cap) {
      l4_player.x = col.x + col.w / 2;
      l4_player.y = cap.y - l4_player.h / 2;
      l4_player.vx = 0;
      l4_player.vy = 0;
      l4_player.onGround = true;
      l4_player.standingPlatform = null;
    } else {
      l4_player.x = col.x + col.w / 2;
      l4_player.y = col.y - 8 - l4_player.h / 2;
      l4_player.vx = 0;
      l4_player.vy = 0;
      l4_player.onGround = true;
      l4_player.standingPlatform = null;
    }
    return;
  }

  if (!level4PlayerStillOnColumn(col)) {
    level4StopClimbing();
    return;
  }

  if (left && !right) {
    level4StopClimbing();
    l4_player.vx = -2.0;
    return;
  }

  if (right && !left) {
    level4StopClimbing();
    l4_player.vx = 2.0;
    return;
  }
}

function level4PlayerStillOnColumn(col) {
  let px = l4_player.x;
  let py1 = l4_player.y - l4_player.h / 2;
  let py2 = l4_player.y + l4_player.h / 2;
  let cx = col.x + col.w / 2;

  return (
    py1 < col.y + col.h &&
    py2 > col.y &&
    abs(px - cx) < col.w
  );
}

function level4GetClimbColumnTouching() {
  let pr = level4WorldPlayerRect();

  for (let col of l4_climbWalls) {
    let closeX = pr.x + pr.w > col.x - 6 && pr.x < col.x + col.w + 6;
    let overlapY = pr.y < col.y + col.h && pr.y + pr.h > col.y;

    if (closeX && overlapY) {
      return col;
    }
  }

  return null;
}

function level4GetStandCapForColumn(col) {
  for (let cap of l4_standCaps) {
    let sameX = abs(cap.x - (col.x - 8)) < 0.1;
    let sameY = abs(cap.y - (col.y - 8)) < 0.1;
    let sameW = abs(cap.w - (col.w + 16)) < 0.1;

    if (sameX && sameY && sameW) {
      return cap;
    }
  }
  return null;
}

function level4MoveAndResolveX() {
  let dx = l4_player.vx;
  let steps = max(1, ceil(abs(dx)));
  let stepX = dx / steps;

  for (let i = 0; i < steps; i++) {
    l4_player.x += stepX;

    let pr = level4WorldPlayerRect();

    for (let s of l4_solids) {
      if (!level4RectsOverlap(pr, s)) continue;

      if (stepX > 0) {
        l4_player.x = s.x - l4_player.w / 2;
      } else if (stepX < 0) {
        l4_player.x = s.x + s.w + l4_player.w / 2;
      }

      l4_player.vx = 0;
      break;
    }
  }
}

function level4MoveAndResolveY() {
  let prevBottom = l4_player.y + l4_player.h / 2;
  l4_player.y += l4_player.vy;

  let pr = level4WorldPlayerRect();

  if (pr.y < L4_TUNNEL_TOP) {
    l4_player.y = L4_TUNNEL_TOP + l4_player.h / 2;
    l4_player.vy = 0;
    pr = level4WorldPlayerRect();
  }

  for (let s of l4_solids) {
    if (!level4RectsOverlap(pr, s)) continue;

    if (l4_player.vy > 0) {
      l4_player.y = s.y - l4_player.h / 2;
      l4_player.vy = 0;
      l4_player.onGround = true;
      pr = level4WorldPlayerRect();
    } else if (l4_player.vy < 0) {
      l4_player.y = s.y + s.h + l4_player.h / 2;
      l4_player.vy = 0;
      pr = level4WorldPlayerRect();
    }
  }

  if (l4_player.vy >= 0) {
    let landingSurfaces = l4_standCaps.concat(l4_oneWays, l4_movers);

    for (let p of landingSurfaces) {
      let nowBottom = l4_player.y + l4_player.h / 2;

      let overlapX = pr.x + pr.w > p.x + 1 && pr.x < p.x + p.w - 1;
      let crossedTop = prevBottom <= p.y && nowBottom >= p.y;

      if (overlapX && crossedTop) {
        l4_player.y = p.y - l4_player.h / 2;
        l4_player.vy = 0;
        l4_player.onGround = true;

        if (l4_movers.includes(p)) {
          l4_player.standingPlatform = p;
        }

        pr = level4WorldPlayerRect();
      }
    }
  }
}

function level4DoJump() {
  if (l4_player.climbing) {
    let left = keyIsDown(LEFT_ARROW) || keyIsDown(65);
    let right = keyIsDown(RIGHT_ARROW) || keyIsDown(68);

    l4_player.vy = L4_CLIMB_JUMP_Y;

    if (left && !right) {
      l4_player.vx = -L4_CLIMB_JUMP_X;
    } else if (right && !left) {
      l4_player.vx = L4_CLIMB_JUMP_X;
    } else {
      let col = l4_player.climbColumn;
      if (col && l4_player.x <= col.x + col.w / 2) {
        l4_player.vx = -L4_CLIMB_JUMP_X;
      } else {
        l4_player.vx = L4_CLIMB_JUMP_X;
      }
    }

    level4StopClimbing();
    return;
  }

  if (l4_player.onGround) {
    l4_player.vy = L4_JUMP_VY;
    l4_player.onGround = false;
    l4_player.standingPlatform = null;
  }
}

function level4UpdateTemperature() {
  if (!l4_hasTorch) {
    l4_cold += L4_COLD_RATE_NO_TORCH;
  } else if (!level4IsAtFire()) {
    l4_cold -= L4_TORCH_COOL_RATE;
  }

  if (level4IsAtFire()) {
    l4_cold -= L4_FIRE_COOL_RATE;
  }

  l4_cold = constrain(l4_cold, 0, 1);

  if (l4_cold >= 1 && l4_gameState === "play") {
    level4StartFreezeDeath();
  }
}

function level4StartFreezeDeath() {
  safePlayOnce(deathByColdSound, 1.5);

  l4_player.frozen = true;
  l4_player.vx = 0;
  l4_player.vy = 0;
  l4_player.climbing = false;
  l4_player.climbColumn = null;
  l4_player.onGround = false;
  l4_player.standingPlatform = null;
  l4_freezeTimer = L4_FREEZE_SHOW_FRAMES;
  l4_gameState = "freeze";
}

function level4UpdateFreezeState() {
  l4_player.vx = 0;
  l4_player.vy = 0;
  l4_freezeTimer--;

  if (l4_freezeTimer <= 0) {
    l4_gameState = "lose";
  }
}

function level4CheckTorchPickup() {
  if (l4_torchPickup.taken) return;

  let dx = l4_player.x - l4_torchPickup.x;
  let dy = (l4_player.y - 8) - l4_torchPickup.y;

  if (dx * dx + dy * dy <= (l4_torchPickup.r + 12) * (l4_torchPickup.r + 12)) {
    l4_torchPickup.taken = true;
    l4_hasTorch = true;
    l4_checkpointActive = true;
    safePlayOnce(fireSound, 2.0);
    l4_cold = max(0, l4_cold - 0.35);
  }
}

function level4CheckWin() {
  let dx = l4_player.x - l4_fireGoal.x;
  let dy = (l4_player.y - 10) - l4_fireGoal.y;

  if (dx * dx + dy * dy <= l4_fireGoal.r * l4_fireGoal.r) {
    l4_gameState = "win";
  }
}

function level4IsAtFire() {
  let dx = l4_player.x - l4_fireGoal.x;
  let dy = (l4_player.y - 10) - l4_fireGoal.y;
  return dx * dx + dy * dy <= l4_fireGoal.r * l4_fireGoal.r;
}

function level4CheckSnowballDeath() {
  let dx = l4_player.x - l4_snowball.x;
  let dy = (l4_player.y - 4) - (L4_FLOOR_Y - l4_snowball.r);
  let hitR = l4_snowball.r * 0.92;

  if (dx * dx + dy * dy <= hitR * hitR) {
  safePlayOnce(hitSnowballSound, 1.2);
  l4_gameState = "lose";
  }
}

function level4CheckGroundSpikes() {
  let pr = level4WorldPlayerRect();

  for (let strip of l4_groundSpikes) {
    for (let i = 0; i < strip.count; i++) {
      let sx = strip.x + i * strip.spacing;
      let tri = {
        x: sx - 7,
        y: strip.y - strip.h,
        w: 14,
        h: strip.h
      };

      if (level4RectsOverlap(pr, tri)) {
      safePlayOnce(hitPickaxeSound, 1.2);
      l4_gameState = "lose";
      return;
      }
    }
  }
}

function level4UpdateDanger() {
  let safeX = l4_snowball.x + l4_snowball.r * 0.58;
  let dist = (l4_player.x - l4_player.w / 2) - safeX;
  l4_dangerAmount = constrain(map(dist, 20, 170, 1, 0), 0, 1);
}

function level4ApplyDangerShake() {
  if ((l4_gameState !== "play" && l4_gameState !== "freeze") || l4_dangerAmount <= 0) {
    return;
  }

  let amt = 3 * l4_dangerAmount;
  translate(random(-amt, amt), random(-amt * 0.5, amt * 0.5));
}

function level4DrawBackground() {
  background(255);

  for (let y = 0; y < height; y++) {
    let t = map(y, 0, height, 0, 1);
    let c = lerpColor(color(244, 249, 253), color(255, 255, 255), t);
    stroke(c);
    line(0, y, width, y);
  }
  noStroke();
}

function level4DrawTunnel() {
  noStroke();

  fill(255);
  rect(0, 0, width, height);

  fill(240, 246, 251);
  rect(0, L4_TUNNEL_TOP - 20, width, L4_FLOOR_Y - L4_TUNNEL_TOP + 40, 28);

  fill(105, 150, 195, 195);
  rect(0, L4_TUNNEL_TOP, width, L4_FLOOR_Y - L4_TUNNEL_TOP, 24);

  fill(70, 110, 155, 52);
  rect(12, L4_TUNNEL_TOP + 18, width - 24, L4_FLOOR_Y - L4_TUNNEL_TOP - 36, 18);

  fill(220, 245, 255, 42);
  rect(12, L4_TUNNEL_TOP + 8, width - 24, 10, 8);

  level4DrawWallTexture();
  level4DrawCeilingIcicles();
}

function level4DrawWallTexture() {
  push();
  translate(-(l4_worldScroll * 0.45), 0);
  noStroke();

  for (let m of l4_wallMarks) {
    let x = m.x;
    let sx = x - l4_worldScroll * 0.45;

    if (sx < -100 || sx > width + 100) continue;

    fill(90, 135, 180, 42);
    rect(sx, L4_TUNNEL_TOP + 55, 16, L4_FLOOR_Y - L4_TUNNEL_TOP - 110, 10);

    fill(200, 235, 255, 12);
    rect(sx + 3, L4_TUNNEL_TOP + 65, 6, L4_FLOOR_Y - L4_TUNNEL_TOP - 140, 6);
  }

  fill(80, 120, 165, 28);
  for (let x = -80; x < L4_LEVEL_LENGTH; x += 90) {
    let sx = x - l4_worldScroll * 0.45;
    beginShape();
    vertex(sx, L4_TUNNEL_TOP + 16);
    vertex(sx + 25, L4_TUNNEL_TOP + 48);
    vertex(sx + 54, L4_TUNNEL_TOP + 20);
    vertex(sx + 82, L4_TUNNEL_TOP + 52);
    vertex(sx + 110, L4_TUNNEL_TOP + 18);
    vertex(sx + 110, L4_TUNNEL_TOP);
    vertex(sx, L4_TUNNEL_TOP);
    endShape(CLOSE);
  }

  pop();
}

function level4DrawCeilingIcicles() {
  push();
  translate(-(l4_worldScroll * 0.55), 0);
  noStroke();
  fill(230, 248, 255, 110);

  for (let x = -30; x < L4_LEVEL_LENGTH; x += 38) {
    let sx = x;
    let h = 10 + ((floor(x / 38) % 4) * 5);
    triangle(sx, L4_TUNNEL_TOP + 1, sx + 15, L4_TUNNEL_TOP + 1, sx + 7.5, L4_TUNNEL_TOP + h);
  }

  pop();
}

function level4DrawFloorAndPlatforms() {
  rectMode(CORNER);
  noStroke();

  for (let s of l4_solids) {
    if (s.hidden) continue;

    let x = s.x - l4_worldScroll;
    if (x + s.w < -80 || x > width + 80) continue;

    fill(242);
    rect(x, s.y, s.w, s.h, 6);

    fill(255, 255, 255, 80);
    rect(x + 2, s.y + 2, max(0, s.w - 4), 4, 3);

    if (s.h > 18) {
      fill(228);
      rect(x, s.y + 16, s.w, s.h - 16, 4);
    }
  }

  for (let p of l4_oneWays) {
    let x = p.x - l4_worldScroll;
    if (x + p.w < -80 || x > width + 80) continue;

    fill(225, 245, 255, 170);
    rect(x, p.y, p.w, p.h, 6);
    fill(255, 255, 255, 110);
    rect(x + 2, p.y + 2, max(0, p.w - 4), 3, 3);
  }

  for (let p of l4_movers) {
    let x = p.x - l4_worldScroll;
    if (x + p.w < -80 || x > width + 80) continue;

    fill(210, 240, 255, 190);
    rect(x, p.y, p.w, p.h, 6);
    fill(255, 255, 255, 120);
    rect(x + 2, p.y + 2, max(0, p.w - 4), 3, 3);
  }
}

function level4DrawGroundSpikes() {
  noStroke();

  for (let strip of l4_groundSpikes) {
    for (let i = 0; i < strip.count; i++) {
      let sx = strip.x + i * strip.spacing - l4_worldScroll;
      if (sx < -20 || sx > width + 20) continue;

      fill(205, 235, 250);
      triangle(
        sx - 7, strip.y,
        sx + 7, strip.y,
        sx, strip.y - strip.h
      );

      fill(255, 255, 255, 120);
      triangle(
        sx - 3, strip.y - 5,
        sx + 2, strip.y - 5,
        sx, strip.y - strip.h + 4
      );
    }
  }
}

function level4DrawClimbWalls() {
  noStroke();

  for (let w of l4_climbWalls) {
    let x = w.x - l4_worldScroll;
    if (x + w.w < -80 || x > width + 80) continue;

    if (w.isWhite) {
      fill(252);
      rect(x, w.y, w.w, w.h, 8);

      fill(255, 255, 255, 120);
      rect(x + 3, w.y + 4, 7, w.h - 8, 5);

      fill(235);
      rect(x, w.y + 14, w.w, w.h - 14, 6);
    } else {
      fill(198, 235, 255, 115);
      rect(x, w.y, w.w, w.h, 8);

      fill(255, 255, 255, 95);
      rect(x + 3, w.y + 4, 6, w.h - 8, 5);

      fill(225, 245, 255, 60);
      rect(x + 12, w.y + 4, 5, w.h - 8, 4);
    }
  }
}

function level4DrawIcicleTraps() {
  for (let t of l4_icicleTraps) {
    let x = t.x - l4_worldScroll;
    if (x < -40 || x > width + 40) continue;

    if (t.state === "warning") {
      noStroke();
      fill(255, 70, 70, 235);
      triangle(x - 10, L4_TUNNEL_TOP + 16, x + 10, L4_TUNNEL_TOP + 16, x, L4_TUNNEL_TOP + 36);
    }

    let len = 0;
    if (t.state === "ready" || t.state === "warning") {
      len = t.baseLen;
    } else if (t.state === "growing") {
      let growT = 1 - t.timer / L4_TRAP_GROW_FRAMES;
      len = t.baseLen * constrain(growT, 0, 1);
    }

    if (len > 0.1) {
      noStroke();
      fill(180, 245, 255, 145);
      triangle(x - 8, L4_TUNNEL_TOP, x + 8, L4_TUNNEL_TOP, x, L4_TUNNEL_TOP + len);

      fill(120, 220, 255, 115);
      triangle(x - 5, L4_TUNNEL_TOP, x + 5, L4_TUNNEL_TOP, x, L4_TUNNEL_TOP + len * 0.9);
    }

    if (t.spike) {
      let s = t.spike;
      let sx = s.x - l4_worldScroll;

      rectMode(CENTER);
      noStroke();
      fill(210, 245, 255);
      rect(sx, s.y, s.w, s.h, 2);

      fill(255);
      triangle(
        sx - s.w / 2, s.y + s.h / 2 - 6,
        sx + s.w / 2, s.y + s.h / 2 - 6,
        sx, s.y + s.h / 2 + 10
      );
      rectMode(CORNER);
    }
  }
}

function level4DrawTorch() {
  if (l4_torchPickup.taken) return;

  let x = l4_torchPickup.x - l4_worldScroll;
  let y = l4_torchPickup.y;

  if (x < -60 || x > width + 60) return;

  noStroke();
  for (let i = 0; i < 5; i++) {
    fill(255, 170, 70, 28 - i * 5);
    ellipse(x, y, 58 - i * 10);
  }

  stroke(90, 60, 30);
  strokeWeight(4);
  line(x, y + 14, x, y + 32);

  noStroke();
  fill(255, 190, 80);
  level4Flame(x, y + 2, 14, 18);
  fill(255, 70, 55);
  level4Flame(x + 2, y + 6, 10, 14);
}

function level4DrawFire() {
  let x = l4_fireGoal.x - l4_worldScroll;
  let y = l4_fireGoal.y;

  if (x < -120 || x > width + 120) return;

  noStroke();
  for (let i = 0; i < 7; i++) {
    fill(255, 150, 70, 28 - i * 4);
    ellipse(x, y, 180 - i * 18);
  }

  rectMode(CENTER);
  fill(95, 60, 35);
  rect(x, y + 22, 46, 8, 4);

  fill(255, 170, 70);
  level4Flame(x - 6, y + 14, 22, 28);
  fill(255, 70, 50);
  level4Flame(x + 8, y + 18, 18, 24);
  fill(255, 235, 110);
  level4Flame(x + 1, y + 22, 12, 18);

  rectMode(CORNER);
}

function level4DrawSnowball() {
  let x = l4_snowball.x - l4_worldScroll;
  let y = L4_FLOOR_Y - l4_snowball.r;

  noStroke();

  for (let i = 0; i < 5; i++) {
    fill(220, 240, 250, 22 - i * 4);
    ellipse(x, y, l4_snowball.r * 2 + 30 - i * 10);
  }

  fill(244);
  ellipse(x, y, l4_snowball.r * 2);

  fill(255, 255, 255, 78);
  ellipse(x - 18, y - 22, l4_snowball.r * 0.95, l4_snowball.r * 0.72);

  stroke(220);
  strokeWeight(3);
  noFill();

  let spin = frameCount * 0.16;
  push();
  translate(x, y);
  rotate(spin);
  arc(0, 0, l4_snowball.r * 1.55, l4_snowball.r * 1.55, 0.4, 2.0);
  arc(0, 0, l4_snowball.r * 1.18, l4_snowball.r * 1.18, 2.7, 4.45);
  line(-l4_snowball.r * 0.55, 0, l4_snowball.r * 0.55, 0);
  line(0, -l4_snowball.r * 0.55, 0, l4_snowball.r * 0.55);
  pop();

  noStroke();

  for (let i = 0; i < 8; i++) {
    fill(255, 255, 255, 88 - i * 9);
    ellipse(
      x - l4_snowball.r * 0.95 - i * 12,
      L4_FLOOR_Y - 2 - (i % 2) * 3,
      14 - i,
      8 - i * 0.45
    );
  }
}

function level4DrawPlayer() {
  rectMode(CENTER);
  noStroke();

  let x = l4_player.x - l4_worldScroll;
  let y = l4_player.y;
  let p = 4;

  fill(0, 0, 0, 60);
  rect(x, y + 16, p * 5, p * 2);

  if (l4_player.frozen || l4_gameState === "freeze") {
    level4DrawFrozenPlayer(x, y, p);
    rectMode(CORNER);
    return;
  }

  if (l4_hasTorch) {
    for (let i = 0; i < 6; i++) {
      fill(255, 170, 70, 20 - i * 3);
      ellipse(x + 10, y - 10, 120 - i * 18);
    }
  }

  if (!l4_hasTorch && l4_cold > 0) {
    fill(180, 230, 255, 70 * l4_cold);
    ellipse(x, y - 6, 38, 46);
  }

  let f = l4_cold;

  function icy(r, g, b, a = 255) {
    let base = color(r, g, b, a);
    let ice = color(170, 235, 255, a);
    return lerpColor(base, ice, f);
  }

  fill(icy(55, 40, 30));
  rect(x - p, y + p * 3, p, p * 2);
  rect(x + p, y + p * 3, p, p * 2);

  fill(30, 25, 20);
  rect(x - p, y + p * 4, p * 1.5, p);
  rect(x + p, y + p * 4, p * 1.5, p);

  fill(icy(205, 60, 60));
  rect(x, y + p, p * 5, p * 4);

  fill(icy(240, 240, 240));
  rect(x, y + p, p * 0.8, p * 4);

  fill(icy(120, 85, 45));
  rect(x - p * 3, y + p, p * 2, p * 4);

  fill(icy(255, 220, 185));
  rect(x, y - p * 3, p * 3.5, p * 3.5);

  fill(icy(25, 35, 80));
  rect(x, y - p * 4.5, p * 3.5, p * 2);

  fill(0);
  rect(x + p * 0.8, y - p * 3, p * 0.6, p * 0.6);

  level4DrawPickaxe(x, y, p);
  rectMode(CORNER);
}

function level4DrawFrozenPlayer(x, y, p) {
  fill(155, 215, 245, 210);
  rect(x - p, y + p * 3, p, p * 2);
  rect(x + p, y + p * 3, p, p * 2);
  rect(x, y + p, p * 5, p * 4);
  rect(x - p * 3, y + p, p * 2, p * 4);
  rect(x, y - p * 3, p * 3.5, p * 3.5);
  rect(x, y - p * 4.5, p * 3.5, p * 2);

  rectMode(CENTER);
  noStroke();
  fill(175, 235, 255, 95);
  rect(x, y - 2, 38, 46, 6);

  stroke(235, 250, 255, 170);
  strokeWeight(2);
  noFill();
  rect(x, y - 2, 38, 46, 6);

  stroke(255, 255, 255, 120);
  line(x - 12, y - 20, x - 4, y - 12);
  line(x - 6, y + 2, x + 8, y + 12);
  line(x + 4, y - 18, x + 13, y - 8);

  noStroke();
  fill(220, 245, 255, 80);
  rect(x - 4, y - 12, 10, 28, 4);
}

function level4DrawPickaxe(x, y, p) {
  push();
  translate(x + p * 3.2, y - p * 1.5);

  stroke(70, 55, 40);
  strokeWeight(3);
  line(0, 0, 0, -p * 7.0);

  stroke(170);
  strokeWeight(4);
  line(-p * 2.2, -p * 7.0, p * 2.2, -p * 7.0);

  strokeWeight(2);
  line(-p * 2.2, -p * 7.0, -p * 2.7, -p * 6.2);
  line(p * 2.2, -p * 7.0, p * 2.7, -p * 6.2);

  pop();
}

function level4DrawHUD() {
  rectMode(CORNER);

  noStroke();
  fill(0, 0, 0, 90);
  rect(12, 12, 180, 16, 6);

  let progress = l4_player.x / (L4_LEVEL_LENGTH - 80);
  fill(160, 220, 255, 190);
  rect(12, 12, 180 * constrain(progress, 0, 1), 16, 6);

  fill(255);
  textSize(12);
  textAlign(LEFT, CENTER);
  text("TUNNEL", 18, 20);

  fill(0, 0, 0, 90);
  rect(12, 36, 140, 14, 6);

  fill(255, 170, 70, 180);
  rect(12, 36, 140 * (l4_hasTorch ? 1 : 0), 14, 6);

  fill(255);
  textAlign(LEFT, TOP);
  text(l4_hasTorch ? "TORCH: YES" : "TORCH: NO", 12, 54);

  if (!l4_hasTorch || l4_cold > 0) {
    fill(0, 0, 0, 90);
    rect(12, 72, 140, 14, 6);

    fill(120, 200, 255, 190);
    rect(12, 72, 140 * l4_cold, 14, 6);

    fill(255);
    text("COLD", 12, 90);
  }
}

function level4WorldPlayerRect() {
  return {
    x: l4_player.x - l4_player.w / 2,
    y: l4_player.y - l4_player.h / 2,
    w: l4_player.w,
    h: l4_player.h
  };
}

function level4PlayerRect() {
  return {
    x: l4_player.x - l4_worldScroll - l4_player.w / 2,
    y: l4_player.y - l4_player.h / 2,
    w: l4_player.w,
    h: l4_player.h
  };
}

function level4RectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function level4Flame(x, y, w, h) {
  beginShape();
  vertex(x, y);
  bezierVertex(
    x - w * 0.5, y - h * 0.2,
    x - w * 0.4, y - h * 0.9,
    x, y - h
  );
  bezierVertex(
    x + w * 0.4, y - h * 0.9,
    x + w * 0.5, y - h * 0.2,
    x, y
  );
  endShape(CLOSE);
}

function level4InitSnow() {
  l4_snow = [];
  for (let i = 0; i < 110; i++) {
    l4_snow.push({
      x: random(width),
      y: random(height),
      r: random(1.2, 3.0),
      vy: random(0.35, 1.0),
      drift: random(-0.15, 0.12),
      a: random(110, 210)
    });
  }
}

function level4UpdateSnow() {
  for (let s of l4_snow) {
    s.y += s.vy;
    s.x += s.drift - 0.7;

    if (s.y > height + 6) {
      s.y = -6;
      s.x = random(width);
    }
    if (s.x < -10) s.x = width + 10;
    if (s.x > width + 10) s.x = -10;
  }
}

function level4DrawSnow() {
  noStroke();
  for (let s of l4_snow) {
    fill(255, 255, 255, s.a);
    ellipse(s.x, s.y, s.r);
  }
}

function level5ResetGame() {
  l5_player = {
    x: width / 2,
    y: height - 40,
    w: 24,
    h: 14,
    speedX: 5,
    speedY: 3,
    hp: L5_PLAYER_MAX_HP,
    freeze: 0,
    iceLocked: false
  };

  l5_boss = {
    x: width / 2,
    y: 80,
    size: 96,
    hp: L5_BOSS_MAX_HP
  };

  l5_stage = 0;
  l5_snowflakes = [];
  l5_bullets = [];
  l5_lastShotTime = millis();
  l5_freezeFlash = 0;
  l5_loseStartMs = 0;
  l5_gameState = "play";

  level5SpawnSnowForStage(0, true);
}

function level5SpawnSnowForStage(newStage, initial = false) {
  let addCount = 0;
  let bigChance = 0;
  let vyMin = 1.0, vyMax = 2.0;
  let driftMin = -0.25, driftMax = 0.25;
  let rMin = 6, rMax = 12;

  if (newStage === 0) {
    addCount = initial ? 35 : 10;
    bigChance = 0.08;
  } else if (newStage === 1) {
    addCount = 14;
    bigChance = 0.18;
    vyMin = 1.4; vyMax = 2.6;
  } else if (newStage === 2) {
    addCount = 16;
    bigChance = 0.25;
    vyMin = 1.8; vyMax = 3.1;
  } else {
    addCount = 18;
    bigChance = 0.33;
    vyMin = 2.2; vyMax = 3.8;
  }

  for (let i = 0; i < addCount; i++) {
    let isBig = random(1) < bigChance;
    let r = isBig ? random(18, 28) : random(rMin, rMax);

    l5_snowflakes.push({
      x: random(width),
      y: random(-height, height),
      r: r,
      vy: random(vyMin, vyMax),
      drift: random(driftMin, driftMax),
      hit: false
    });
  }
}

function level5HandlePlayer() {
  let left = keyIsDown(LEFT_ARROW) || keyIsDown(65);
  let right = keyIsDown(RIGHT_ARROW) || keyIsDown(68);
  let up = keyIsDown(UP_ARROW);
  let down = keyIsDown(DOWN_ARROW);

  if (left) l5_player.x -= l5_player.speedX;
  if (right) l5_player.x += l5_player.speedX;
  if (up) l5_player.y -= l5_player.speedY;
  if (down) l5_player.y += l5_player.speedY;

  l5_player.x = constrain(l5_player.x, l5_player.w / 2, width - l5_player.w / 2);
  l5_player.y = constrain(l5_player.y, l5_player.h / 2 + 20, height - l5_player.h / 2);

  let l5Moving = left || right;
  updateMovementSounds(true, l5Moving, false);
}

function level5UpdateSnow() {
  for (let s of l5_snowflakes) {
    s.y += s.vy;
    s.x += s.drift;

    if (s.y - s.r > height) {
      s.y = random(-200, -10);
      s.x = random(width);
      s.hit = false;
    }
  }
}

function level5TryShoot() {
  if (millis() - l5_lastShotTime >= L5_FIRE_RATE_MS) {
    l5_bullets.push({
      x: l5_player.x,
      y: l5_player.y - l5_player.h / 2,
      r: 3,
      vy: -L5_BULLET_SPEED
    });
    l5_lastShotTime = millis();
  }
}

function level5UpdateBullets() {
  for (let i = l5_bullets.length - 1; i >= 0; i--) {
    let b = l5_bullets[i];
    b.y += b.vy;

    if (b.y < -30) {
      l5_bullets.splice(i, 1);
      continue;
    }

    let half = l5_boss.size * 0.40;

    if (
      b.x > l5_boss.x - half &&
      b.x < l5_boss.x + half &&
      b.y > l5_boss.y - half &&
      b.y < l5_boss.y + half
    ) {
      let d = dist(l5_player.x, l5_player.y, l5_boss.x, l5_boss.y);
      let t = constrain(map(d, 360, 80, 0, 1), 0, 1);
      let dmg = lerp(20, 100, t);

      l5_boss.hp -= dmg;
      l5_bullets.splice(i, 1);
    }
  }
}

function level5CheckSnowCollision() {
  let px1 = l5_player.x - l5_player.w / 2;
  let px2 = l5_player.x + l5_player.w / 2;
  let py1 = l5_player.y - l5_player.h / 2;
  let py2 = l5_player.y + l5_player.h / 2;

  for (let s of l5_snowflakes) {
    if (s.hit) continue;

    let cx = constrain(s.x, px1, px2);
    let cy = constrain(s.y, py1, py2);
    let dx = s.x - cx;
    let dy = s.y - cy;

    if (dx * dx + dy * dy < (s.r * 0.5) * (s.r * 0.5)) {
      safePlayOnce(hitSnowballSound, 1.1);
      
      l5_player.hp -= 1;
      l5_player.freeze = 1 - (l5_player.hp / L5_PLAYER_MAX_HP);
      l5_freezeFlash = 1;

      if (l5_player.hp <= 0) {
        l5_player.iceLocked = true;
        l5_player.freeze = 1;
        safePlayOnce(deathByColdSound, 1.2);
        l5_gameState = "lose";
        l5_loseStartMs = millis();
      }

      s.hit = true;
      return;
    }
  }
}

function level5UpdateStages() {
  let newStage = 0;
  if (l5_boss.hp <= L5_STAGE_THRESHOLDS[0]) newStage = 1;
  if (l5_boss.hp <= L5_STAGE_THRESHOLDS[1]) newStage = 2;
  if (l5_boss.hp <= L5_STAGE_THRESHOLDS[2]) newStage = 3;

  if (newStage !== l5_stage) {
    l5_stage = newStage;
    level5SpawnSnowForStage(l5_stage, false);
  }
}

function level5CheckBossDefeated() {
  if (l5_boss.hp <= 0) {
    l5_boss.hp = 0;
    l5_gameState = "win";
  }
}

function level5DrawWorld() {
  level5DrawSnow();
  level5DrawBoss();
  level5DrawBullets();
  level5DrawPlayer();
  level5DrawIceBlock();
  level5DrawBossHP();
}

function level5DrawIcyGradient() {
  noStroke();
  fill(0, 0, 0, 18);
  rect(0, 0, width, 70);
  fill(255, 255, 255, 10);
  rect(0, height - 90, width, 90);
}

function level5DrawSnow() {
  noStroke();
  fill(255);
  for (let s of l5_snowflakes) ellipse(s.x, s.y, s.r);
}

function level5DrawBullets() {
  noStroke();
  fill(255, 245, 170);
  for (let b of l5_bullets) ellipse(b.x, b.y, b.r * 2);
}

function level5DrawPlayer() {
  rectMode(CENTER);
  noStroke();

  let x = l5_player.x;
  let y = l5_player.y;
  let p = 4;

  let f = constrain(l5_player.freeze + l5_freezeFlash * 0.25, 0, 1);

  function icy(r, g, b, a = 255) {
    let base = color(r, g, b, a);
    let ice = color(170, 235, 255, a);
    return lerpColor(base, ice, f);
  }

  fill(0, 0, 0, 60);
  rect(x, y + 16, p * 5, p * 2);

  fill(icy(55, 40, 30));
  rect(x - p, y + p * 3, p, p * 2);
  rect(x + p, y + p * 3, p, p * 2);

  fill(30, 25, 20);
  rect(x - p, y + p * 4, p * 1.5, p);
  rect(x + p, y + p * 4, p * 1.5, p);

  fill(icy(205, 60, 60));
  rect(x, y + p, p * 5, p * 4);

  fill(icy(240, 240, 240));
  rect(x, y + p, p * 0.8, p * 4);

  fill(icy(120, 85, 45));
  rect(x - p * 3, y + p, p * 2, p * 4);

  fill(icy(255, 220, 185));
  rect(x, y - p * 3, p * 3.5, p * 3.5);

  fill(icy(25, 35, 80));
  rect(x, y - p * 4.5, p * 3.5, p * 2);

  fill(0);
  rect(x + p * 0.8, y - p * 3, p * 0.6, p * 0.6);
}

function level5DrawBoss() {
  rectMode(CENTER);
  noStroke();

  let x = l5_boss.x;
  let y = l5_boss.y;
  let p = 6;

  fill(175, 225, 255);
  rect(x, y, p * 18, p * 14);

  fill(245);
  rect(x, y, p * 16, p * 12);

  fill(245);
  rect(x - p * 9, y + p, p * 4, p * 8);
  rect(x + p * 9, y + p, p * 4, p * 8);

  fill(210, 245, 255);
  rect(x - p * 5, y - p * 7, p * 2, p * 2);
  rect(x + p * 5, y - p * 7, p * 2, p * 2);

  fill(220);
  rect(x, y - p, p * 10, p * 6);

  fill(180);
  rect(x - p * 3, y - p * 3.8, p * 3, p);
  rect(x + p * 3, y - p * 3.8, p * 3, p);

  fill(0);
  rect(x - p * 3, y - p * 3, p * 2, p * 2);
  rect(x + p * 3, y - p * 3, p * 2, p * 2);

  fill(0, 205, 255);
  rect(x - p * 3, y - p * 3, p, p);
  rect(x + p * 3, y - p * 3, p, p);

  fill(150);
  rect(x, y - p, p * 2, p * 1.5);

  fill(140);
  rect(x, y + p * 1.8, p * 6, p * 2);

  fill(255);
  rect(x - p * 2, y + p * 1.8, p, p * 0.8);
  rect(x, y + p * 1.8, p, p * 0.8);
  rect(x + p * 2, y + p * 1.8, p, p * 0.8);
}

function level5DrawIceBlock() {
  if (!l5_player.iceLocked) return;

  rectMode(CENTER);
  let w = l5_player.w + 34;
  let h = l5_player.h + 54;

  noStroke();
  fill(120, 220, 255, 90);
  rect(l5_player.x, l5_player.y - 6, w, h, 10);

  fill(180, 245, 255, 70);
  rect(l5_player.x, l5_player.y - 6, w - 10, h - 10, 8);
}

function level5DrawBossHP() {
  rectMode(CORNER);
  noStroke();

  let barW = 340;
  let barH = 14;
  let barX = width / 2 - barW / 2;
  let barY = 12;

  fill(10, 25, 45);
  rect(barX - 3, barY - 3, barW + 6, barH + 6, 6);

  let ratio = constrain(l5_boss.hp / L5_BOSS_MAX_HP, 0, 1);

  fill(0, 200, 255);
  rect(barX, barY, barW * ratio, barH, 6);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(12);
  text(Math.ceil(l5_boss.hp) + " / " + L5_BOSS_MAX_HP, width / 2, barY + barH / 2);
}

function updateWinScenePlayer() {
  const gravity = 0.8;
  const jumpVy = -10.5;
  const groundY = 138;

  if ((keyIsDown(32) || keyIsDown(87) || keyIsDown(UP_ARROW)) &&
      winScenePlayer.onGround) {
    winScenePlayer.vy = jumpVy;
    winScenePlayer.onGround = false;
    safePlayOnce(jumpSound, 0.35);
  }

  winScenePlayer.vy += gravity;
  winScenePlayer.y += winScenePlayer.vy;

  if (winScenePlayer.y >= groundY) {
    winScenePlayer.y = groundY;
    winScenePlayer.vy = 0;
    winScenePlayer.onGround = true;
  }
}

function drawWinPlayer(x, y) {
  rectMode(CENTER);
  noStroke();

  let p = 4;

  fill(0, 0, 0, 50);
  rect(x, y + 16, p * 5, p * 2);

  fill(55, 40, 30);
  rect(x - p, y + p * 3, p, p * 2);
  rect(x + p, y + p * 3, p, p * 2);

  fill(30, 25, 20);
  rect(x - p, y + p * 4, p * 1.5, p);
  rect(x + p, y + p * 4, p * 1.5, p);

  fill(205, 60, 60);
  rect(x, y + p, p * 5, p * 4);

  fill(240);
  rect(x, y + p, p * 0.8, p * 4);

  fill(120, 85, 45);
  rect(x - p * 3, y + p, p * 2, p * 4);

  fill(255, 220, 185);
  rect(x, y - p * 3, p * 3.5, p * 3.5);

  fill(25, 35, 80);
  rect(x, y - p * 4.5, p * 3.5, p * 2);

  fill(0);
  rect(x + p * 0.8, y - p * 3, p * 0.6, p * 0.6);

  stroke(70, 55, 40);
  strokeWeight(3);
  line(x + p * 3.2, y - p * 1.5, x + p * 3.2, y - p * 8.5);

  stroke(170);
  strokeWeight(4);
  line(x + p * 1.0, y - p * 8.5, x + p * 5.4, y - p * 8.5);

  strokeWeight(2);
  line(x + p * 1.0, y - p * 8.5, x + p * 0.5, y - p * 7.7);
  line(x + p * 5.4, y - p * 8.5, x + p * 5.9, y - p * 7.7);

  noStroke();
  rectMode(CORNER);
}

function drawWinYeti(x, y) {
  rectMode(CENTER);
  noStroke();

  let p = 9;

  fill(175, 225, 255);
  rect(x, y, p * 18, p * 12, 20);

  fill(245);
  rect(x, y, p * 15, p * 10, 18);

  fill(245);
  rect(x - p * 8, y + p * 0.5, p * 4, p * 7, 14);
  rect(x + p * 8, y + p * 0.5, p * 4, p * 7, 14);

  fill(220);
  rect(x, y - p * 1.2, p * 9, p * 5, 12);

  fill(180);
  rect(x - p * 2.8, y - p * 3.3, p * 2.8, p * 0.8, 3);
  rect(x + p * 2.8, y - p * 3.3, p * 2.8, p * 0.8, 3);

  fill(0);
  rect(x - p * 2.8, y - p * 2.5, p * 1.6, p * 1.6, 3);
  rect(x + p * 2.8, y - p * 2.5, p * 1.6, p * 1.6, 3);

  fill(0, 205, 255);
  rect(x - p * 2.8, y - p * 2.5, p * 0.8, p * 0.8, 2);
  rect(x + p * 2.8, y - p * 2.5, p * 0.8, p * 0.8, 2);

  fill(150);
  rect(x, y - p * 0.7, p * 1.6, p * 1.1, 2);

  stroke(120);
  strokeWeight(4);
  noFill();
  arc(x, y + p * 1.8, p * 4.8, p * 2.4, PI, TWO_PI);
  noStroke();

  rectMode(CORNER);
}

