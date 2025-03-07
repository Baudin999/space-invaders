import { updatePlayer } from './player.js';
import { updateEnemies } from './enemy.js';
import { updateBullets } from './bullet.js';
import { updateSpaceBackground } from './background.js';
import { updateBomb } from './bomb.js';
import { 
  gameState,
  gameOver as gameOverFunc, 
  startGame as startGameFunc,
  handleResize as handleResizeFunc,
  toggleHitboxes as toggleHitboxesFunc,
  updateHitboxVisibility,
  updateDifficulty
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

  // Game over
  function gameOver() {
    gameOverFunc(gameOverScreen, finalScoreElement);
  }

  // Game loop
  function gameLoop(timestamp) {
    if (!gameState.gameRunning) return;
    
    const deltaTime = timestamp - gameState.lastFrameTime;
    const currentTime = performance.now();
    gameState.lastFrameTime = timestamp;
    
    // Update all entities
    updateEntities(deltaTime, currentTime);
    
    // Request next frame
    gameState.animationFrameId = requestAnimationFrame(gameLoop);
  }
  
  // Update all entities with the current game state
  function updateEntities(deltaTime, currentTime) {
    // Update space background animation (horizontal scrolling)
    updateSpaceBackground(gameState.spaceBackground, deltaTime, gameState.width);
    
    // Update player
    const playerResult = updatePlayer(
      gameState.player, 
      gameState.keyStates, 
      gameState.width, 
      gameState.height, 
      deltaTime, 
      svg, 
      gameState.bullets, 
      gameState.bombs, 
      gameState.enemyState,
      gameState.hitboxesVisible
    );
    
    gameState.bullets = playerResult.bullets;
    gameState.bombs = playerResult.bombs;
    
    // Update enemies
    const enemyResult = updateEnemies(
      gameState.enemyState, 
      gameState.player, 
      gameState.width, 
      gameState.height, 
      gameState.scale, 
      deltaTime, 
      svg, 
      gameState.enemyBullets, 
      gameOver, 
      currentTime, 
      gameState.powerUps,
      gameState.hitboxesVisible
    );
    
    gameState.enemyState = enemyResult.enemyState;
    gameState.enemyBullets = enemyResult.enemyBullets;
    gameState.powerUps = enemyResult.powerUps;
    
    // Update bombs
    for (let i = gameState.bombs.length - 1; i >= 0; i--) {
      const bombResult = updateBomb(
        gameState.bombs[i], 
        deltaTime, 
        svg, 
        gameState.enemyState,
        gameState.hitboxesVisible
      );
      
      if (bombResult.completed) {
        gameState.bombs.splice(i, 1);
        gameState.enemyState = bombResult.enemyState;
      }
    }
    
    // Update bullets and powerups
    const bulletResult = updateBullets(
      gameState.bullets, 
      gameState.enemyBullets, 
      gameState.enemyState, 
      gameState.player, 
      svg, 
      scoreElement, 
      deltaTime, 
      gameState.width, 
      gameState.height, 
      gameOver, 
      gameState.powerUps,
      gameState.hitboxesVisible
    );
    
    gameState.bullets = bulletResult.bullets;
    gameState.enemyBullets = bulletResult.enemyBullets;
    gameState.enemyState = bulletResult.enemyState;
    gameState.powerUps = bulletResult.powerUps;
    // Store previous score for difficulty check
    const previousScore = gameState.score;
    gameState.score = bulletResult.score;
    
    // Update hitbox visibility if needed
    if (gameState.hitboxesVisible) {
      updateHitboxVisibility();
    }
    
    // Check if difficulty should increase based on score
    updateDifficulty(gameState.score, previousScore);
  }

  // Start the game
  function startGame() {
    startGameFunc(svg, scoreElement, startScreen, gameOverScreen);
    gameState.animationFrameId = requestAnimationFrame(gameLoop);
  }
  
  // Handle keyboard input
  function handleKeyDown(e) {
    gameState.keyStates[e.key] = true;
    // Prevent scrolling with arrow keys or space
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }
    
    // Toggle hitbox display with 'h' key
    if (e.key === 'h' && gameState.gameRunning) {
      toggleHitboxesFunc();
    }
  }

  function handleKeyUp(e) {
    gameState.keyStates[e.key] = false;
  }

  // Handle window resize
  function handleResize() {
    const dimensions = handleResizeFunc(svg);
    if (dimensions === null) {
      // Restart needed
      startGame();
    } else if (!gameState.gameRunning) {
      gameState.width = dimensions.width;
      gameState.height = dimensions.height;
      gameState.scale = dimensions.scale;
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