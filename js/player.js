import { createSVGElement } from './utils.js';
import { PLAYER_SHOOT_COOLDOWN, POWERUP_TYPES } from './constants.js';
import { createBullet } from './bullet.js';

// Initialize player
function createPlayer(svg, width, height, scale) {
  const playerSize = 50 * scale;
  const playerY = height / 2; // Position player in middle of screen vertically for side-scroller
  
  const playerElement = createSVGElement('polygon', {
    points: `0,${playerSize/2} ${playerSize},${playerSize/2} ${playerSize/2},${playerSize}`,
    fill: 'green',
    stroke: 'lime',
    'stroke-width': 2,
    transform: `translate(${100 * scale}, ${playerY})`
  });
  
  svg.appendChild(playerElement);
  
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
    // Power-up properties
    powerUpActive: false,
    currentPowerUp: null,
    powerUpEndTime: 0,
    weaponLevel: 1
  };
}

// Update player
function updatePlayer(player, keyStates, width, height, deltaTime, svg, bullets) {
  const moveAmount = player.speed * deltaTime / 16;
  
  // Horizontal movement
  if (keyStates['ArrowLeft'] && player.x > 0) {
    player.x -= moveAmount;
  }
  if (keyStates['ArrowRight'] && player.x < width / 3) { // Limit rightward movement for side-scroller
    player.x += moveAmount;
  }
  
  // Vertical movement for side-scroller
  if (keyStates['ArrowUp'] && player.y > 0) {
    player.y -= moveAmount;
  }
  if (keyStates['ArrowDown'] && player.y < height - player.height) {
    player.y += moveAmount;
  }
  
  // Update player element position
  player.element.setAttribute('transform', `translate(${player.x}, ${player.y})`);
  
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
  
  return bullets;
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
  
  // Visual indicator of powered-up state
  player.element.setAttribute('stroke', POWERUP_TYPES[powerUpType].color);
  player.element.setAttribute('stroke-width', 4);
  
  // Update UI indicator
  updatePowerUpIndicator(powerUpType, POWERUP_TYPES[powerUpType].duration);
}

// Deactivate power-up
function deactivatePowerUp(player) {
  player.powerUpActive = false;
  player.currentPowerUp = null;
  player.weaponLevel = 1;
  
  // Reset visual appearance
  player.element.setAttribute('stroke', 'lime');
  player.element.setAttribute('stroke-width', 2);
  
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

export { createPlayer, updatePlayer, activatePowerUp };