import { createSVGElement } from './utils.js';
import { PLAYER_SHOOT_COOLDOWN } from './constants.js';
import { createBullet } from './bullet.js';

// Initialize player
function createPlayer(svg, width, height, scale) {
  const playerSize = 50 * scale;
  const playerY = height - 100 * scale;
  
  const playerElement = createSVGElement('polygon', {
    points: `0,${playerSize} ${playerSize/2},0 ${playerSize},${playerSize}`,
    fill: 'green',
    stroke: 'lime',
    'stroke-width': 2,
    transform: `translate(${width/2 - playerSize/2}, ${playerY})`
  });
  
  svg.appendChild(playerElement);
  
  return {
    element: playerElement,
    x: width/2 - playerSize/2,
    y: playerY,
    width: playerSize,
    height: playerSize,
    speed: 8 * scale,
    canShoot: true,
    lastShot: 0,
    shootCooldown: PLAYER_SHOOT_COOLDOWN
  };
}

// Update player
function updatePlayer(player, keyStates, width, deltaTime, svg, bullets) {
  const moveAmount = player.speed * deltaTime / 16;
  
  if (keyStates['ArrowLeft'] && player.x > 0) {
    player.x -= moveAmount;
  }
  if (keyStates['ArrowRight'] && player.x < width - player.width) {
    player.x += moveAmount;
  }
  
  // Update player element position
  player.element.setAttribute('transform', `translate(${player.x}, ${player.y})`);
  
  // Shooting
  if (keyStates[' '] && player.canShoot && Date.now() - player.lastShot > player.shootCooldown) {
    const bulletX = player.x + player.width / 2 - 2;
    const bulletY = player.y;
    bullets.push(createBullet(svg, bulletX, bulletY, -1, false));
    player.lastShot = Date.now();
  }
  
  return bullets;
}

export { createPlayer, updatePlayer };