import { setDimensions } from './utils.js';
import { createPlayer } from './player.js';
import { initEnemies } from './enemy.js';
import { createSpaceBackground } from './background.js';
import { ENEMY_SHOOT_COOLDOWN } from './constants.js';

// Central game state object
export const gameState = {
  // Game status
  gameRunning: false,
  score: 0,
  lives: 3,
  hitboxesVisible: false,
  
  // Dimensions & scaling
  width: 0,
  height: 0,
  scale: 0,
  
  // Entities
  player: null,
  enemyState: null,
  bullets: [],
  enemyBullets: [],
  bombs: [],
  powerUps: [],
  spaceBackground: null,
  
  // Timing
  lastEnemyShot: 0,
  lastFrameTime: 0,
  animationFrameId: null,
  
  // Input
  keyStates: {}
};

// Game over
function gameOver(gameOverScreen, finalScoreElement) {
  gameState.gameRunning = false;
  cancelAnimationFrame(gameState.animationFrameId);
  finalScoreElement.textContent = gameState.score;
  gameOverScreen.style.display = 'block';
}

// Start the game
function startGame(svg, scoreElement, startScreen, gameOverScreen) {
  const dimensions = setDimensions(svg);
  gameState.width = dimensions.width;
  gameState.height = dimensions.height;
  gameState.scale = dimensions.scale;

  svg.innerHTML = '';
  gameState.enemyState = initEnemies();
  gameState.bullets = [];
  gameState.enemyBullets = [];
  gameState.bombs = [];
  gameState.powerUps = [];
  gameState.score = 0;
  gameState.keyStates = {};
  
  scoreElement.textContent = gameState.score;
  startScreen.style.display = 'none';
  gameOverScreen.style.display = 'none';
  
  // Create dynamic space background
  gameState.spaceBackground = createSpaceBackground(svg, gameState.width, gameState.height);
  
  // Create player
  gameState.player = createPlayer(svg, gameState.width, gameState.height, gameState.scale);
  
  gameState.lastFrameTime = performance.now();
  gameState.gameRunning = true;
  gameState.lastEnemyShot = 0;
}

// Toggle hitbox visibility
function toggleHitboxes() {
  gameState.hitboxesVisible = !gameState.hitboxesVisible;
  updateHitboxVisibility();
}

// Update hitbox visibility for all entities
function updateHitboxVisibility() {
  // Get all hitbox elements
  const hitboxes = document.querySelectorAll('.hitbox');
  
  // Set opacity based on visibility state
  hitboxes.forEach(hitbox => {
    hitbox.style.opacity = gameState.hitboxesVisible ? '1' : '0';
  });
}

// Handle resize
function handleResize(svg) {
  if (gameState.gameRunning) {
    cancelAnimationFrame(gameState.animationFrameId);
    return null; // Signal that a restart is needed
  } else {
    return setDimensions(svg);
  }
}

export {
  gameOver,
  startGame,
  handleResize,
  toggleHitboxes,
  updateHitboxVisibility
};