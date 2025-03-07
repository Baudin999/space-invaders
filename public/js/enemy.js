import { createSVGElement } from './utils.js';
import { ENEMY_ROWS, ENEMY_COLS, ENEMY_MOVE_DOWN_AMOUNT } from './constants.js';
import { createBullet } from './bullet.js';

// Create enemies
function createEnemies(svg, width, height, scale) {
  const enemies = [];
  const enemySize = 40 * scale;
  const rows = ENEMY_ROWS;
  const cols = ENEMY_COLS;
  const startX = width/2 - (cols * (enemySize + 20 * scale)) / 2;
  const startY = 100 * scale;
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = startX + col * (enemySize + 20 * scale);
      const y = startY + row * (enemySize + 20 * scale);
      
      // Create different shapes for different rows
      let points;
      let fill;
      
      if (row === 0) {
        // Top row - UFO style
        points = `${enemySize/2},0 ${enemySize},${enemySize/3} ${enemySize},${enemySize*2/3} ${enemySize/2},${enemySize} 0,${enemySize*2/3} 0,${enemySize/3}`;
        fill = 'purple';
      } else if (row <= 2) {
        // Middle rows - Crab style
        points = `0,0 ${enemySize},0 ${enemySize},${enemySize} ${enemySize*3/4},${enemySize/2} ${enemySize/4},${enemySize/2} 0,${enemySize}`;
        fill = 'red';
      } else {
        // Bottom rows - Squid style
        points = `${enemySize/4},0 ${enemySize*3/4},0 ${enemySize},${enemySize/3} ${enemySize},${enemySize} 0,${enemySize} 0,${enemySize/3}`;
        fill = 'cyan';
      }
      
      const enemyElement = createSVGElement('polygon', {
        points,
        fill,
        stroke: 'white',
        'stroke-width': 2,
        transform: `translate(${x}, ${y})`
      });
      
      svg.appendChild(enemyElement);
      
      enemies.push({
        element: enemyElement,
        x,
        y,
        width: enemySize,
        height: enemySize,
        points: 10 * (rows - row),
        type: row
      });
    }
  }
  
  return enemies;
}

// Update enemies
function updateEnemies(enemies, player, enemyDirection, enemySpeed, width, height, 
                      scale, deltaTime, lastEnemyShot, svg, enemyBullets, gameOver) {
  let moveDown = false;
  const moveAmount = enemySpeed * deltaTime / 16 * enemyDirection;
  let leftMostX = width;
  let rightMostX = 0;
  let lowestY = 0;
  
  // Find the boundaries of enemies
  for (const enemy of enemies) {
    leftMostX = Math.min(leftMostX, enemy.x);
    rightMostX = Math.max(rightMostX, enemy.x + enemy.width);
    lowestY = Math.max(lowestY, enemy.y + enemy.height);
  }
  
  // Check if enemies hit the edges
  if (leftMostX + moveAmount < 0 || rightMostX + moveAmount > width) {
    enemyDirection *= -1;
    moveDown = true;
  }
  
  // Check if enemies reached the player
  if (lowestY > player.y) {
    gameOver();
    return { enemies, enemyDirection, lastEnemyShot, enemyBullets };
  }
  
  // Move enemies
  for (const enemy of enemies) {
    enemy.x += moveAmount;
    
    if (moveDown) {
      enemy.y += ENEMY_MOVE_DOWN_AMOUNT * scale;
    }
    
    // Update enemy element position
    enemy.element.setAttribute('transform', `translate(${enemy.x}, ${enemy.y})`);
  }
  
  // Enemy shooting
  if (enemies.length > 0 && Date.now() - lastEnemyShot > 1000) {
    const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
    const bulletX = randomEnemy.x + randomEnemy.width / 2 - 2 * scale;
    const bulletY = randomEnemy.y + randomEnemy.height;
    enemyBullets.push(createBullet(svg, bulletX, bulletY, 1, true));
    lastEnemyShot = Date.now();
  }
  
  return { enemies, enemyDirection, lastEnemyShot, enemyBullets };
}

export { createEnemies, updateEnemies };