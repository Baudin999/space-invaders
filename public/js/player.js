import { createSVGElement } from './utils.js';
import { PLAYER_SHOOT_COOLDOWN, POWERUP_TYPES, BOMB_COOLDOWN } from './constants.js';
import { createBullet } from './bullet.js';
import { createBomb, findNearestEnemy } from './bomb.js';

// Initialize player
function createPlayer(svg, width, height, scale) {
  const playerSize = 50 * scale;
  const playerY = height / 2; // Position player in middle of screen vertically for side-scroller
  
  // Create a group for player elements
  const playerGroup = createSVGElement('g', {
    id: 'player-group'
  });
  
  // Create image element for player
  const playerElement = createSVGElement('image', {
    href: '/images/ship.png',
    width: playerSize,
    height: playerSize,
    x: 0,
    y: 0,
    transform: `rotate(90, ${playerSize/2}, ${playerSize/2})`  // Rotate around center point
  });
  
  // Create hitbox outline for debugging
  const hitboxOutline = createSVGElement('rect', {
    x: 0,
    y: 0,
    width: playerSize,
    height: playerSize,
    fill: 'none',
    stroke: 'lime',
    'stroke-width': 2,
    'stroke-dasharray': '5,5',
    class: 'hitbox',
    'pointer-events': 'none'
  });
  
  // Add elements to group - add playerElement first so hitbox appears on top
  playerGroup.appendChild(playerElement);
  playerGroup.appendChild(hitboxOutline);
  
  // Position the group
  playerGroup.setAttribute('transform', `translate(${100 * scale}, ${playerY})`);
  
  svg.appendChild(playerGroup);
  
  return {
    element: playerElement,
    x: 100 * scale,
    y: playerY,
    width: playerSize,
    height: playerSize,
    speed: 8 * scale,
    canShoot: true,
    lastShot: 0,
    shootCooldown: PLAYER_SHOOT_COOLDOWN,
    // Bomb properties
    canUseBomb: true,
    lastBomb: 0,
    bombCooldown: BOMB_COOLDOWN,
    // Power-up properties
    powerUpActive: false,
    currentPowerUp: null,
    powerUpEndTime: 0,
    weaponLevel: 1
  };
}

// Update player
function updatePlayer(player, keyStates, width, height, deltaTime, svg, bullets, bombs = [], enemyState = null) {
  const moveAmount = player.speed * deltaTime / 16;
  
  // Horizontal movement - allow player to move across most of the screen
  if (keyStates['ArrowLeft'] && player.x > 0) {
    player.x -= moveAmount;
  }
  if (keyStates['ArrowRight'] && player.x < width * 0.8) { // Allow player to move further right
    player.x += moveAmount;
  }
  
  // Vertical movement for side-scroller
  if (keyStates['ArrowUp'] && player.y > 0) {
    player.y -= moveAmount;
  }
  if (keyStates['ArrowDown'] && player.y < height - player.height) {
    player.y += moveAmount;
  }
  
  // Update player group position
  const playerGroup = document.getElementById('player-group');
  if (playerGroup) {
    playerGroup.setAttribute('transform', `translate(${player.x}, ${player.y})`);
  }
  
  // Check if power-up has expired
  if (player.powerUpActive && Date.now() > player.powerUpEndTime) {
    deactivatePowerUp(player);
  }
  
  // Shooting
  if (keyStates[' '] && player.canShoot && Date.now() - player.lastShot > player.shootCooldown) {
    const bulletX = player.x + player.width;
    const bulletY = player.y + player.height / 2 - 5;
    
    // Different shooting patterns based on weapon level
    switch (player.weaponLevel) {
      case 1: // Basic shot
        bullets.push(createBullet(svg, bulletX, bulletY, 1, false)); // Horizontal bullets
        break;
      case 2: // Double shot
        bullets.push(createBullet(svg, bulletX, bulletY - 10, 1, false));
        bullets.push(createBullet(svg, bulletX, bulletY + 10, 1, false));
        break;
      case 3: // Triple shot
        bullets.push(createBullet(svg, bulletX, bulletY, 1, false));
        bullets.push(createBullet(svg, bulletX, bulletY - 15, 1, false));
        bullets.push(createBullet(svg, bulletX, bulletY + 15, 1, false));
        break;
    }
    
    player.lastShot = Date.now();
    
    // Rapid fire power-up reduces cooldown
    if (player.currentPowerUp === 'RAPID_FIRE') {
      player.lastShot += player.shootCooldown * 0.5; // Shoot twice as fast
    }
  }
  
  // Using bomb with B key
  if (keyStates['b'] && player.canUseBomb && Date.now() - player.lastBomb > player.bombCooldown && enemyState) {
    const nearestEnemy = findNearestEnemy(player, enemyState.enemies);
    
    if (nearestEnemy) {
      // Create bomb from player position targeting the nearest enemy
      const bombX = player.x + player.width;
      const bombY = player.y + player.height / 2;
      
      bombs.push(createBomb(svg, bombX, bombY, nearestEnemy, 1));
      
      // Set cooldown
      player.lastBomb = Date.now();
      
      // Create visual cooldown indicator in UI
      updateBombCooldownIndicator(player.bombCooldown);
    }
  }
  
  return { bullets, bombs };
}

// Update bomb cooldown indicator
function updateBombCooldownIndicator(cooldown) {
  // Check if indicator already exists
  let indicator = document.getElementById('bomb-cooldown-indicator');
  
  if (!indicator) {
    // Create indicator
    indicator = document.createElement('div');
    indicator.id = 'bomb-cooldown-indicator';
    indicator.style.position = 'absolute';
    indicator.style.bottom = '10px';
    indicator.style.right = '10px';
    indicator.style.padding = '5px 10px';
    indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    indicator.style.color = 'white';
    indicator.style.borderRadius = '5px';
    
    document.body.appendChild(indicator);
  }
  
  // Set initial text
  indicator.textContent = 'Bomb: Ready in 5s';
  
  // Start countdown
  let timeLeft = cooldown / 1000;
  const interval = setInterval(() => {
    timeLeft--;
    
    if (timeLeft <= 0) {
      clearInterval(interval);
      indicator.textContent = 'Bomb: Ready (B)';
      indicator.style.backgroundColor = 'rgba(0, 255, 0, 0.7)';
      
      // Fade out after 2 seconds
      setTimeout(() => {
        let opacity = 0.7;
        const fadeInterval = setInterval(() => {
          opacity -= 0.05;
          indicator.style.backgroundColor = `rgba(0, 255, 0, ${opacity})`;
          
          if (opacity <= 0) {
            clearInterval(fadeInterval);
            if (indicator.parentNode) {
              indicator.parentNode.removeChild(indicator);
            }
          }
        }, 50);
      }, 2000);
    } else {
      indicator.textContent = `Bomb: Ready in ${timeLeft}s`;
    }
  }, 1000);
}

// Activate power-up
function activatePowerUp(player, powerUpType) {
  player.powerUpActive = true;
  player.currentPowerUp = powerUpType;
  
  // Set power-up end time
  player.powerUpEndTime = Date.now() + POWERUP_TYPES[powerUpType].duration;
  
  // Apply power-up effect
  switch (powerUpType) {
    case 'DOUBLE_SHOT':
      player.weaponLevel = 2;
      break;
    case 'TRIPLE_SHOT':
      player.weaponLevel = 3;
      break;
    case 'RAPID_FIRE':
      player.weaponLevel = Math.max(player.weaponLevel, 1); // Keep current weapon level
      break;
  }
  
  // Visual indicator of powered-up state - add filter for glow effect
  player.element.setAttribute('filter', `drop-shadow(0 0 5px ${POWERUP_TYPES[powerUpType].color})`);
  
  // Update UI indicator
  updatePowerUpIndicator(powerUpType, POWERUP_TYPES[powerUpType].duration);
}

// Deactivate power-up
function deactivatePowerUp(player) {
  player.powerUpActive = false;
  player.currentPowerUp = null;
  player.weaponLevel = 1;
  
  // Reset visual appearance
  player.element.removeAttribute('filter');
  
  // Clear UI indicator
  clearPowerUpIndicator();
}

// Update the power-up indicator in the UI
function updatePowerUpIndicator(powerUpType, duration) {
  const indicator = document.getElementById('power-up-indicator');
  
  // Clear existing indicator content
  indicator.innerHTML = '';
  
  // Create power-up icon
  const icon = document.createElement('div');
  icon.className = 'power-up-icon';
  
  // Add specific power-up class for color
  switch (powerUpType) {
    case 'DOUBLE_SHOT':
      icon.classList.add('power-up-double');
      indicator.appendChild(icon);
      indicator.appendChild(document.createTextNode('Double Shot'));
      break;
    case 'TRIPLE_SHOT':
      icon.classList.add('power-up-triple');
      indicator.appendChild(icon);
      indicator.appendChild(document.createTextNode('Triple Shot'));
      break;
    case 'RAPID_FIRE':
      icon.classList.add('power-up-rapid');
      indicator.appendChild(icon);
      indicator.appendChild(document.createTextNode('Rapid Fire'));
      break;
  }
  
  // Set duration timer
  const durationInSeconds = Math.ceil(duration / 1000);
  const timerElement = document.createElement('span');
  timerElement.id = 'power-up-timer';
  timerElement.textContent = ` (${durationInSeconds}s)`;
  indicator.appendChild(timerElement);
  
  // Start countdown timer
  let timeLeft = durationInSeconds;
  const timer = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(timer);
    } else {
      const timerElement = document.getElementById('power-up-timer');
      if (timerElement) {
        timerElement.textContent = ` (${timeLeft}s)`;
      }
    }
  }, 1000);
}

// Clear the power-up indicator in the UI
function clearPowerUpIndicator() {
  const indicator = document.getElementById('power-up-indicator');
  indicator.innerHTML = '';
}

export { createPlayer, updatePlayer, activatePowerUp, updateBombCooldownIndicator };