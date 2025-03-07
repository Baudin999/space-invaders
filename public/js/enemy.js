import { ENEMY_SPAWN_INTERVAL, POWERUP_SPAWN_CHANCE, POWERUP_TYPES } from './constants.js';
import { createBullet } from './bullet.js';
import PowerUp from './powerup.js';
import { createEnemyByType } from './enemyClasses.js';
import { gameState } from './gameState.js';

// Initialize enemies array
function initEnemies() {
  return {
    enemies: [],
    lastSpawnTime: 0
  };
}

// Spawn new enemies based on time
function spawnEnemies(enemyState, width, height, scale, svg, currentTime) {
  // Adjust spawn interval based on difficulty multiplier
  const adjustedInterval = ENEMY_SPAWN_INTERVAL / (gameState.enemySpawnRateMultiplier || 1);
  
  if (currentTime - enemyState.lastSpawnTime > adjustedInterval) {
    // Determine enemy type with weighted probability
    let enemyType;
    const rand = Math.random();
    
    if (rand < 0.5) {
      enemyType = 'BASIC';
    } else if (rand < 0.75) {
      enemyType = 'FAST';
    } else if (rand < 0.9) {
      enemyType = 'TANK';
    } else {
      enemyType = 'ARC';
    }
    
    // Determine spawn position - always from right side for side-scroller
    const y = Math.random() * (height - 50 * scale);
    const x = width + 50; // Off-screen to the right
    
    // Create and add the enemy
    const enemy = createEnemyByType(svg, x, y, enemyType, scale);
    enemyState.enemies.push(enemy);
    
    // Update spawn time
    enemyState.lastSpawnTime = currentTime;
  }
  
  return enemyState;
}

// Update enemies
function updateEnemies(enemyState, player, width, height, scale, deltaTime, svg, 
                     enemyBullets, gameOver, currentTime, powerUps, hitboxesVisible = false) {
  // Spawn new enemies
  enemyState = spawnEnemies(enemyState, width, height, scale, svg, currentTime);
  
  // Update existing enemies
  for (let i = enemyState.enemies.length - 1; i >= 0; i--) {
    const enemy = enemyState.enemies[i];
    
    // Update enemy position and state
    const isActive = enemy.update(deltaTime, currentTime, width, height, hitboxesVisible);
    
    // Remove enemies that move off-screen or are no longer active
    if (!isActive) {
      enemy.remove();
      enemyState.enemies.splice(i, 1);
      continue;
    }
    
    // Check collision with player (game over)
    if (isColliding(enemy, player)) {
      gameOver();
      return { enemyState, enemyBullets, powerUps };
    }
    
    // Enemy shooting
    if (enemy.shouldShoot(deltaTime)) {
      enemyBullets.push(enemy.shoot(svg));
    }
  }
  
  return { enemyState, enemyBullets, powerUps };
}

// Handle enemy hit by bullet
function enemyHit(enemy, enemies, svg, score, powerUps) {
  // Process damage
  const isDestroyed = enemy.takeDamage();
  
  // If enemy is destroyed
  if (isDestroyed) {
    // Remove enemy from list
    const index = enemies.indexOf(enemy);
    if (index > -1) {
      enemies.splice(index, 1);
    }
    
    // Remove from DOM
    enemy.remove();
    
    // Increment score
    score += enemy.points;
    
    // Chance to spawn power-up
    if (Math.random() < POWERUP_SPAWN_CHANCE) {
      // Determine power-up type
      const powerUpTypes = Object.keys(POWERUP_TYPES);
      let selectedType = null;
      
      // Weighted random selection based on probability
      const rand = Math.random();
      let cumulativeProbability = 0;
      
      for (const type of powerUpTypes) {
        cumulativeProbability += POWERUP_TYPES[type].probability;
        if (rand < cumulativeProbability) {
          selectedType = type;
          break;
        }
      }
      
      if (selectedType) {
        powerUps.push(new PowerUp(enemy.x, enemy.y, selectedType, svg));
      }
    }
  }
  
  return { enemies, score, powerUps };
}

// Helper function to check collision
function isColliding(rect1, rect2) {
  return rect1.x < rect2.x + rect2.width &&
         rect1.x + rect1.width > rect2.x &&
         rect1.y < rect2.y + rect2.height &&
         rect1.y + rect1.height > rect2.y;
}

export { initEnemies, updateEnemies, enemyHit, isColliding };