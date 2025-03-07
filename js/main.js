import { updatePlayer } from './player.js';
import { updateEnemies } from './enemy.js';
import { updateBullets } from './bullet.js';
import { createEnemies } from './enemy.js';
import { updateSpaceBackground } from './background.js';
import { 
  gameOver as gameOverFunc, 
  startGame as startGameFunc,
  handleResize as handleResizeFunc 
} from './gameState.js';

document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const svg = document.getElementById('game-svg');
  const scoreElement = document.getElementById('score');
  const finalScoreElement = document.getElementById('final-score');
  const gameOverScreen = document.getElementById('game-over');
  const startScreen = document.getElementById('start-screen');
  const startButton = document.getElementById('start-button');
  const restartButton = document.getElementById('restart-button');

  // Game state
  let gameRunning = false;
  let player;
  let enemies = [];
  let bullets = [];
  let enemyBullets = [];
  let lastEnemyShot = 0;
  let enemyDirection = 1;
  let enemySpeed = 1;
  let keyStates = {};
  let lastFrameTime = 0;
  let animationFrameId;
  let width, height, scale;
  let spaceBackground;

  // Game over
  function gameOver() {
    gameOverFunc(gameOverScreen, finalScoreElement);
    gameRunning = false;
  }

  // Game loop
  function gameLoop(timestamp) {
    if (!gameRunning) return;
    
    const deltaTime = timestamp - lastFrameTime;
    lastFrameTime = timestamp;
    
    // Update space background animation
    updateSpaceBackground(spaceBackground, deltaTime, height);
    
    // Update player
    bullets = updatePlayer(player, keyStates, width, deltaTime, svg, bullets);
    
    // Update enemies
    const enemyResult = updateEnemies(
      enemies, player, enemyDirection, enemySpeed, 
      width, height, scale, deltaTime, lastEnemyShot, 
      svg, enemyBullets, gameOver
    );
    
    enemies = enemyResult.enemies;
    enemyDirection = enemyResult.enemyDirection;
    lastEnemyShot = enemyResult.lastEnemyShot;
    enemyBullets = enemyResult.enemyBullets;
    
    // Update bullets
    const bulletResult = updateBullets(
      bullets, enemyBullets, enemies, player, 
      svg, scoreElement, deltaTime, height, gameOver
    );
    
    bullets = bulletResult.bullets;
    enemyBullets = bulletResult.enemyBullets;
    enemies = bulletResult.enemies;
    enemySpeed = bulletResult.enemySpeed;
    
    // Check if all enemies are defeated
    if (enemies.length === 0) {
      enemySpeed = 1;
      enemies = createEnemies(svg, width, height, scale);
    }
    
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  // Start the game
  function startGame() {
    const gameState = startGameFunc(svg, scoreElement, startScreen, gameOverScreen);
    
    // Set local variables from game state
    gameRunning = gameState.gameRunning;
    player = gameState.player;
    enemies = gameState.enemies;
    bullets = gameState.bullets;
    enemyBullets = gameState.enemyBullets;
    lastEnemyShot = gameState.lastEnemyShot;
    enemyDirection = gameState.enemyDirection;
    enemySpeed = gameState.enemySpeed;
    keyStates = gameState.keyStates;
    lastFrameTime = gameState.lastFrameTime;
    width = gameState.width;
    height = gameState.height;
    scale = gameState.scale;
    spaceBackground = gameState.spaceBackground;
    
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  // Handle keyboard input
  function handleKeyDown(e) {
    keyStates[e.key] = true;
    // Prevent scrolling with arrow keys or space
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }
  }

  function handleKeyUp(e) {
    keyStates[e.key] = false;
  }

  // Handle window resize
  function handleResize() {
    const dimensions = handleResizeFunc(svg, animationFrameId, gameRunning, startGame);
    if (!gameRunning) {
      width = dimensions.width;
      height = dimensions.height;
      scale = dimensions.scale;
    }
  }

  // Event listeners
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  window.addEventListener('resize', handleResize);
  startButton.addEventListener('click', startGame);
  restartButton.addEventListener('click', startGame);

  // Initial setup
  handleResize();
});