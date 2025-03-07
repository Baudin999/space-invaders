import { createSVGElement, checkCollision } from './utils.js';
import { enemyHit } from './enemy.js';
import { activatePowerUp } from './player.js';

// Create a bullet
function createBullet(svg, x, y, direction, isEnemy = false) {
  // Get the current scale from the SVG's viewBox
  const viewBox = svg.getAttribute('viewBox').split(' ');
  const width = parseFloat(viewBox[2]);
  const scale = Math.min(width, window.innerHeight) / 800;
  
  const bulletWidth = isEnemy ? 4 * scale : 8 * scale;
  const bulletHeight = isEnemy ? 4 * scale : 8 * scale;
  
  const bulletElement = createSVGElement('rect', {
    x,
    y,
    width: bulletWidth,
    height: bulletHeight,
    fill: isEnemy ? 'red' : 'white',
    rx: bulletWidth / 2,
    ry: bulletWidth / 2
  });
  
  svg.appendChild(bulletElement);
  
  return {
    element: bulletElement,
    x,
    y,
    width: bulletWidth,
    height: bulletHeight,
    speed: (isEnemy ? 5 : 15) * scale,
    direction,
    isEnemy
  };
}

// Update bullets
function updateBullets(bullets, enemyBullets, enemyState, player, svg, scoreElement, 
                     deltaTime, width, height, gameOver, powerUps) {
  const moveAmount = deltaTime / 16;
  let score = parseInt(scoreElement.textContent);
  
  // Player bullets - now move horizontally for side-scroller
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    bullet.x += bullet.speed * bullet.direction * moveAmount;
    
    // Remove bullets that are off-screen
    if (bullet.x > width) {
      bullet.element.remove();
      bullets.splice(i, 1);
      continue;
    }
    
    // Update bullet element position
    bullet.element.setAttribute('x', bullet.x);
    
    // Check for collisions with enemies
    for (let j = enemyState.enemies.length - 1; j >= 0; j--) {
      const enemy = enemyState.enemies[j];
      
      if (checkCollision(bullet, enemy)) {
        // Remove bullet
        bullet.element.remove();
        bullets.splice(i, 1);
        
        // Handle enemy hit (reduce armor or destroy)
        const result = enemyHit(enemy, enemyState.enemies, svg, score, powerUps);
        enemyState.enemies = result.enemies;
        score = result.score;
        powerUps = result.powerUps;
        
        scoreElement.textContent = score;
        break;
      }
    }
  }
  
  // Enemy bullets - now move horizontally for side-scroller
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const bullet = enemyBullets[i];
    bullet.x += bullet.speed * bullet.direction * moveAmount;
    
    // Remove bullets that are off-screen
    if (bullet.x < 0) {
      bullet.element.remove();
      enemyBullets.splice(i, 1);
      continue;
    }
    
    // Update bullet element position
    bullet.element.setAttribute('x', bullet.x);
    
    // Check for collisions with player
    if (checkCollision(bullet, player)) {
      // Remove bullet
      bullet.element.remove();
      enemyBullets.splice(i, 1);
      
      // Player hit!
      gameOver();
      break;
    }
  }
  
  // Update power-ups
  for (let i = powerUps.length - 1; i >= 0; i--) {
    const powerUp = powerUps[i];
    
    // Update power-up position
    powerUp.update(deltaTime);
    
    // Remove inactive power-ups
    if (!powerUp.active) {
      powerUps.splice(i, 1);
      continue;
    }
    
    // Check for collision with player
    if (checkCollision(powerUp, player)) {
      // Activate power-up
      activatePowerUp(player, powerUp.type);
      
      // Remove power-up
      powerUp.destroy();
      powerUps.splice(i, 1);
    }
  }
  
  return { bullets, enemyBullets, enemyState, score, powerUps };
}

export { createBullet, updateBullets };