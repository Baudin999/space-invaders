import { setDimensions } from './utils.js';
import { createPlayer } from './player.js';
import { initEnemies } from './enemy.js';
import { createSpaceBackground } from './background.js';
import { ENEMY_SHOOT_COOLDOWN } from './constants.js';

// Game state variables
let gameRunning = false;
let score = 0;
let lives = 3;
let width, height, scale;
let player;
let enemyState = null;
let bullets = [];
let enemyBullets = [];
let bombs = [];
let powerUps = [];
let lastEnemyShot = 0;
let keyStates = {};
let lastFrameTime = 0;
let animationFrameId;
let spaceBackground;

// Game over
function gameOver(gameOverScreen, finalScoreElement) {
  gameRunning = false;
  cancelAnimationFrame(animationFrameId);
  finalScoreElement.textContent = score;
  gameOverScreen.style.display = 'block';
}

// Start the game
function startGame(svg, scoreElement, startScreen, gameOverScreen) {
  const dimensions = setDimensions(svg);
  width = dimensions.width;
  height = dimensions.height;
  scale = dimensions.scale;

  svg.innerHTML = '';
  enemyState = initEnemies();
  bullets = [];
  enemyBullets = [];
  bombs = [];
  powerUps = [];
  score = 0;
  keyStates = {};
  
  scoreElement.textContent = score;
  startScreen.style.display = 'none';
  gameOverScreen.style.display = 'none';
  
  // Create dynamic space background
  spaceBackground = createSpaceBackground(svg, width, height);
  
  // Create player
  player = createPlayer(svg, width, height, scale);
  
  lastFrameTime = performance.now();
  gameRunning = true;
  lastEnemyShot = 0;
  
  return {
    gameRunning,
    player,
    enemyState,
    bullets,
    enemyBullets,
    bombs,
    powerUps,
    lastEnemyShot,
    keyStates,
    lastFrameTime,
    width,
    height,
    scale,
    spaceBackground
  };
}

// Handle resize
function handleResize(svg, animationFrameId, gameRunning, startGame) {
  if (gameRunning) {
    cancelAnimationFrame(animationFrameId);
    return startGame();
  } else {
    return setDimensions(svg);
  }
}

export {
  gameOver,
  startGame,
  handleResize,
  gameRunning,
  score,
  lives,
  player,
  enemyState,
  bullets,
  enemyBullets,
  bombs,
  powerUps,
  lastEnemyShot,
  keyStates,
  lastFrameTime,
  animationFrameId,
  spaceBackground
};