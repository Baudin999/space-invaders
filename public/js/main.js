import { updatePlayer } from './player.js';
import { updateEnemies } from './enemy.js';
import { updateBullets } from './bullet.js';
import { updateSpaceBackground } from './background.js';
import { updateBomb } from './bomb.js';
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
  let enemyState = null;
  let bullets = [];
  let enemyBullets = [];
  let bombs = [];
  let powerUps = [];
  let lastEnemyShot = 0;
  let keyStates = {};
  let lastFrameTime = 0;
  let animationFrameId;
  let width, height, scale;
  let spaceBackground;
  let hitboxesVisible = false;

  // Game over
  function gameOver() {
    gameOverFunc(gameOverScreen, finalScoreElement);
    gameRunning = false;
  }

  // Game loop
  function gameLoop(timestamp) {
    if (!gameRunning) return;
    
    const deltaTime = timestamp - lastFrameTime;
    const currentTime = performance.now();
    lastFrameTime = timestamp;
    
    // Update space background animation (horizontal scrolling)
    updateSpaceBackground(spaceBackground, deltaTime, width);
    
    // Update player - now with height parameter for vertical movement
    const playerResult = updatePlayer(player, keyStates, width, height, deltaTime, svg, bullets, bombs, enemyState);
    bullets = playerResult.bullets;
    bombs = playerResult.bombs;
    
    // Update enemies - now with side-scrolling behavior
    const enemyResult = updateEnemies(
      enemyState, player, width, height, scale, 
      deltaTime, svg, enemyBullets, gameOver, 
      currentTime, powerUps
    );
    
    enemyState = enemyResult.enemyState;
    enemyBullets = enemyResult.enemyBullets;
    powerUps = enemyResult.powerUps;
    
    // Update bombs
    for (let i = bombs.length - 1; i >= 0; i--) {
      const bombResult = updateBomb(bombs[i], deltaTime, svg, enemyState);
      
      if (bombResult.completed) {
        bombs.splice(i, 1);
        enemyState = bombResult.enemyState;
      }
    }
    
    // Update bullets and powerups
    const bulletResult = updateBullets(
      bullets, enemyBullets, enemyState, player, 
      svg, scoreElement, deltaTime, width, height, 
      gameOver, powerUps
    );
    
    bullets = bulletResult.bullets;
    enemyBullets = bulletResult.enemyBullets;
    enemyState = bulletResult.enemyState;
    powerUps = bulletResult.powerUps;
    
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  // Start the game
  function startGame() {
    const gameState = startGameFunc(svg, scoreElement, startScreen, gameOverScreen);
    
    // Set local variables from game state
    gameRunning = gameState.gameRunning;
    player = gameState.player;
    enemyState = gameState.enemyState;
    bullets = gameState.bullets;
    enemyBullets = gameState.enemyBullets;
    bombs = gameState.bombs;
    powerUps = gameState.powerUps;
    lastEnemyShot = gameState.lastEnemyShot;
    keyStates = gameState.keyStates;
    lastFrameTime = gameState.lastFrameTime;
    width = gameState.width;
    height = gameState.height;
    scale = gameState.scale;
    spaceBackground = gameState.spaceBackground;
    
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  // Toggle hitbox visibility
  function toggleHitboxes() {
    hitboxesVisible = !hitboxesVisible;
    
    // Get all hitbox elements
    const hitboxes = document.querySelectorAll('.hitbox');
    
    // Set opacity based on visibility state
    hitboxes.forEach(hitbox => {
      hitbox.style.opacity = hitboxesVisible ? '1' : '0';
    });
  }
  
  // Handle keyboard input
  function handleKeyDown(e) {
    keyStates[e.key] = true;
    // Prevent scrolling with arrow keys or space
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }
    
    // Toggle hitbox display with 'h' key
    if (e.key === 'h' && gameRunning) {
      toggleHitboxes();
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