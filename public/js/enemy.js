import { createSVGElement } from './utils.js';
import { ENEMY_TYPES, ENEMY_SPAWN_INTERVAL, POWERUP_SPAWN_CHANCE, ENEMY_SHOOT_COOLDOWN, POWERUP_TYPES } from './constants.js';
import { createBullet } from './bullet.js';
import PowerUp from './powerup.js';

// Create a single enemy
function createEnemy(svg, x, y, type, scale) {
  const enemyInfo = ENEMY_TYPES[type];
  const enemySize = enemyInfo.size * scale;
  
  // Create enemy group
  const enemyGroup = createSVGElement('g', {
    class: 'enemy-group',
    transform: `translate(${x}, ${y})`
  });
  
  // Create different shapes for different enemy types
  let element;
  
  switch (type) {
    case 'BASIC':
      // Triangle enemy
      element = createSVGElement('polygon', {
        points: `${enemySize/2},0 ${enemySize},${enemySize} 0,${enemySize}`,
        fill: enemyInfo.color,
        stroke: 'white',
        'stroke-width': 2
      });
      break;
    case 'FAST':
      // Diamond enemy
      element = createSVGElement('polygon', {
        points: `${enemySize/2},0 ${enemySize},${enemySize/2} ${enemySize/2},${enemySize} 0,${enemySize/2}`,
        fill: enemyInfo.color,
        stroke: 'white',
        'stroke-width': 2
      });
      break;
    case 'TANK':
      // Hexagon enemy
      element = createSVGElement('polygon', {
        points: `${enemySize/4},0 ${enemySize*3/4},0 ${enemySize},${enemySize/2} ${enemySize*3/4},${enemySize} ${enemySize/4},${enemySize} 0,${enemySize/2}`,
        fill: enemyInfo.color,
        stroke: 'white',
        'stroke-width': 2
      });
      break;
  }
  
  // Create hitbox outline
  const hitboxOutline = createSVGElement('rect', {
    x: 0,
    y: 0,
    width: enemySize,
    height: enemySize,
    fill: 'none',
    stroke: enemyInfo.color,
    'stroke-width': 2,
    'stroke-dasharray': '3,3',
    class: 'hitbox',
    'pointer-events': 'none',
    opacity: 0 // Hidden by default
  });
  
  // Add elements to group - add visual first so hitbox appears on top
  enemyGroup.appendChild(element);
  enemyGroup.appendChild(hitboxOutline);
  
  svg.appendChild(enemyGroup);
  
  return {
    element,
    x,
    y,
    width: enemySize,
    height: enemySize,
    speed: enemyInfo.speed * scale,
    armor: enemyInfo.armor,
    points: enemyInfo.points,
    type,
    patternY: y, // Original Y position for wave movement pattern
    patternOffset: Math.random() * Math.PI * 2, // Random offset for wave pattern
    lastShot: 0
  };
}

// Initialize enemies array
function initEnemies() {
  return {
    enemies: [],
    lastSpawnTime: 0
  };
}

// Spawn new enemies based on time
function spawnEnemies(enemyState, width, height, scale, svg, currentTime) {
  if (currentTime - enemyState.lastSpawnTime > ENEMY_SPAWN_INTERVAL) {
    // Determine enemy type with weighted probability
    let enemyType;
    const rand = Math.random();
    
    if (rand < 0.6) {
      enemyType = 'BASIC';
    } else if (rand < 0.9) {
      enemyType = 'FAST';
    } else {
      enemyType = 'TANK';
    }
    
    // Determine spawn position - always from right side for side-scroller
    const y = Math.random() * (height - ENEMY_TYPES[enemyType].size * scale);
    const x = width + 50; // Off-screen to the right
    
    // Create and add the enemy
    const enemy = createEnemy(svg, x, y, enemyType, scale);
    enemyState.enemies.push(enemy);
    
    // Update spawn time
    enemyState.lastSpawnTime = currentTime;
  }
  
  return enemyState;
}

// Update enemies
function updateEnemies(enemyState, player, width, height, scale, deltaTime, svg, 
                     enemyBullets, gameOver, currentTime, powerUps) {
  // Spawn new enemies
  enemyState = spawnEnemies(enemyState, width, height, scale, svg, currentTime);
  
  // Update existing enemies
  for (let i = enemyState.enemies.length - 1; i >= 0; i--) {
    const enemy = enemyState.enemies[i];
    
    // Move enemy from right to left for side-scroller
    enemy.x -= enemy.speed * deltaTime / 16;
    
    // Add movement patterns based on enemy type
    switch (enemy.type) {
      case 'BASIC':
        // Moves straight
        break;
      case 'FAST':
        // Sine wave movement
        const frequency = 0.005;
        const amplitude = 50 * scale;
        enemy.y = enemy.patternY + Math.sin((currentTime + enemy.patternOffset) * frequency) * amplitude;
        break;
      case 'TANK':
        // Slower zigzag movement
        if (Math.floor(currentTime / 1000) % 2 === 0) {
          enemy.y += 0.5 * scale;
        } else {
          enemy.y -= 0.5 * scale;
        }
        // Keep within bounds
        if (enemy.y < 0) enemy.y = 0;
        if (enemy.y > height - enemy.height) enemy.y = height - enemy.height;
        break;
    }
    
    // Update enemy group position
    const enemyGroup = enemy.element.parentNode;
    if (enemyGroup) {
      enemyGroup.setAttribute('transform', `translate(${enemy.x}, ${enemy.y})`);
    }
    
    // Remove enemies that move off-screen to the left
    if (enemy.x + enemy.width < 0) {
      enemy.element.remove();
      enemyState.enemies.splice(i, 1);
      continue;
    }
    
    // Check collision with player (game over)
    if (isColliding(enemy, player)) {
      gameOver();
      return { enemyState, enemyBullets, powerUps };
    }
    
    // Enemy shooting based on type and random chance
    if (Date.now() - enemy.lastShot > ENEMY_SHOOT_COOLDOWN) {
      const shootChance = enemy.type === 'BASIC' ? 0.001 : 
                         enemy.type === 'FAST' ? 0.0005 : 
                         0.002; // Tank enemies shoot more often
      
      if (Math.random() < shootChance * deltaTime) {
        const bulletX = enemy.x;
        const bulletY = enemy.y + enemy.height / 2;
        enemyBullets.push(createBullet(svg, bulletX, bulletY, -1, true));
        enemy.lastShot = Date.now();
      }
    }
  }
  
  return { enemyState, enemyBullets, powerUps };
}

// Handle enemy hit by bullet
function enemyHit(enemy, enemies, svg, score, powerUps) {
  enemy.armor--;
  
  // Flash enemy when hit
  enemy.element.setAttribute('fill', 'white');
  setTimeout(() => {
    if (enemy.element && enemy.element.parentNode) {
      enemy.element.setAttribute('fill', ENEMY_TYPES[enemy.type].color);
    }
  }, 50);
  
  // If enemy is destroyed
  if (enemy.armor <= 0) {
    // Remove enemy from list and svg
    const index = enemies.indexOf(enemy);
    if (index > -1) {
      enemies.splice(index, 1);
    }
    // Find the enemy group (parent of the element) and remove it
    const enemyGroup = enemy.element.parentNode;
    if (enemyGroup && enemyGroup.parentNode) {
      enemyGroup.parentNode.removeChild(enemyGroup);
    }
    
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

export { initEnemies, updateEnemies, enemyHit };