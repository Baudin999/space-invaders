import { createSVGElement, checkCollision } from './utils.js';

// Create a bullet
function createBullet(svg, x, y, direction, isEnemy = false) {
  // Get the current scale from the SVG's viewBox
  const viewBox = svg.getAttribute('viewBox').split(' ');
  const width = parseFloat(viewBox[2]);
  const scale = Math.min(width, window.innerHeight) / 800;
  
  const bulletWidth = 4 * scale;
  const bulletHeight = 15 * scale;
  
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
    speed: (isEnemy ? 5 : 10) * scale,
    direction
  };
}

// Update bullets
function updateBullets(bullets, enemyBullets, enemies, player, svg, scoreElement, 
                      deltaTime, height, gameOver) {
  const moveAmount = deltaTime / 16;
  let score = parseInt(scoreElement.textContent);
  
  // Player bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    bullet.y += bullet.speed * bullet.direction * moveAmount;
    
    // Remove bullets that are off-screen
    if (bullet.y < 0) {
      svg.removeChild(bullet.element);
      bullets.splice(i, 1);
      continue;
    }
    
    // Update bullet element position
    bullet.element.setAttribute('y', bullet.y);
    
    // Check for collisions with enemies
    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j];
      
      if (checkCollision(bullet, enemy)) {
        // Remove bullet
        svg.removeChild(bullet.element);
        bullets.splice(i, 1);
        
        // Remove enemy
        svg.removeChild(enemy.element);
        enemies.splice(j, 1);
        
        // Update score
        score += enemy.points;
        scoreElement.textContent = score;
        
        // Increase enemy speed as fewer enemies remain
        const enemySpeed = 1 + (1 - enemies.length / (5 * 10)) * 3;
        
        break;
      }
    }
  }
  
  // Enemy bullets
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const bullet = enemyBullets[i];
    bullet.y += bullet.speed * bullet.direction * moveAmount;
    
    // Remove bullets that are off-screen
    if (bullet.y > height) {
      svg.removeChild(bullet.element);
      enemyBullets.splice(i, 1);
      continue;
    }
    
    // Update bullet element position
    bullet.element.setAttribute('y', bullet.y);
    
    // Check for collisions with player
    if (checkCollision(bullet, player)) {
      // Remove bullet
      svg.removeChild(bullet.element);
      enemyBullets.splice(i, 1);
      
      // Player hit!
      gameOver();
      break;
    }
  }
  
  // Calculate enemy speed based on number of enemies left
  const enemySpeed = enemies.length > 0 ? 1 + (1 - enemies.length / (5 * 10)) * 3 : 1;
  
  return { bullets, enemyBullets, enemies, score, enemySpeed };
}

export { createBullet, updateBullets };