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
  
  // Difficulty settings
  difficultyLevel: 1,
  lastDifficultyIncrease: 0,
  difficultyThreshold: 100, // Points needed for next difficulty level
  enemyArmorBonus: 0,       // Additional armor for enemies
  enemySpawnRateMultiplier: 1.0, // Multiplier for enemy spawn rate
  
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
  
  // Reset difficulty settings
  gameState.difficultyLevel = 1;
  gameState.lastDifficultyIncrease = 0;
  gameState.enemyArmorBonus = 0;
  gameState.enemySpawnRateMultiplier = 1.0;
  
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

// Update difficulty based on score
function updateDifficulty(score, previousScore) {
  // Check if we've crossed a difficulty threshold
  const currentThreshold = gameState.difficultyLevel * gameState.difficultyThreshold;
  
  if (score >= currentThreshold && previousScore < currentThreshold) {
    // Increase difficulty level
    gameState.difficultyLevel++;
    gameState.lastDifficultyIncrease = score;
    
    // Increase enemy armor
    gameState.enemyArmorBonus++;
    
    // Increase spawn rate by 5% per level
    gameState.enemySpawnRateMultiplier = 1 + ((gameState.difficultyLevel - 1) * 0.05);
    
    // Create a difficulty notification
    createDifficultyNotification();
    
    return true;
  }
  
  return false;
}

// Create visual notification for difficulty increase
function createDifficultyNotification() {
  // Create a notification element
  const notification = document.createElement('div');
  notification.className = 'difficulty-notification';
  notification.textContent = `Difficulty Increased to Level ${gameState.difficultyLevel}!`;
  notification.style.position = 'absolute';
  notification.style.top = '20%';
  notification.style.left = '50%';
  notification.style.transform = 'translateX(-50%)';
  notification.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
  notification.style.color = 'white';
  notification.style.padding = '10px 20px';
  notification.style.borderRadius = '5px';
  notification.style.fontWeight = 'bold';
  notification.style.fontSize = '24px';
  notification.style.zIndex = '1000';
  notification.style.textAlign = 'center';
  
  // Add animation
  notification.style.animation = 'fadeInOut 2s forwards';
  
  // Add animation keyframes if they don't exist
  if (!document.getElementById('difficulty-animation-style')) {
    const style = document.createElement('style');
    style.id = 'difficulty-animation-style';
    style.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -20px); }
        20% { opacity: 1; transform: translate(-50%, 0); }
        80% { opacity: 1; transform: translate(-50%, 0); }
        100% { opacity: 0; transform: translate(-50%, -20px); }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Add to document
  document.body.appendChild(notification);
  
  // Remove after animation completes
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 2000);
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
  updateHitboxVisibility,
  updateDifficulty
};