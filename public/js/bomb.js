import { createSVGElement } from './utils.js';

// Create a bomb
function createBomb(svg, x, y, targetEnemy, scale) {
  const bombSize = 10 * scale;
  
  const bombElement = createSVGElement('circle', {
    cx: x,
    cy: y,
    r: bombSize,
    fill: 'red',
    stroke: 'orange',
    'stroke-width': 2
  });
  
  svg.appendChild(bombElement);
  
  // Start position
  const startX = x;
  const startY = y;
  
  // Target position
  const targetX = targetEnemy.x + targetEnemy.width / 2;
  const targetY = targetEnemy.y + targetEnemy.height / 2;
  
  // Control point for quadratic bezier curve (to create the arc)
  // Make the control point higher and between the start and end points
  const controlX = (startX + targetX) / 2;
  const controlY = Math.min(startY, targetY) - 200 * scale;
  
  return {
    element: bombElement,
    x: x,
    y: y,
    size: bombSize,
    speed: 0.015, // Increased speed to catch up with moving enemies
    progress: 0,
    startX,
    startY,
    targetX,
    targetY,
    controlX,
    controlY,
    target: targetEnemy
  };
}

// Update bomb
function updateBomb(bomb, deltaTime, svg, enemyState, hitboxesVisible = false) {
  // Find the current position of the target enemy
  const targetEnemy = enemyState.enemies.find(enemy => enemy === bomb.target);
  
  // If target enemy no longer exists, continue to last known position
  if (!targetEnemy) {
    // Increase progress along the path to final destination
    bomb.progress += bomb.speed * deltaTime / 16;
    
    if (bomb.progress >= 1) {
      // Bomb reached last known target position but enemy is gone
      createExplosion(svg, bomb.x, bomb.y, bomb.size * 3);
      
      // Remove bomb
      if (bomb.element.parentNode) {
        bomb.element.parentNode.removeChild(bomb.element);
      }
      
      return { completed: true, enemyState };
    }
  } else {
    // Target enemy exists, update its target position
    bomb.targetX = targetEnemy.x + targetEnemy.width / 2;
    bomb.targetY = targetEnemy.y + targetEnemy.height / 2;
    
    // **IMPROVED COLLISION DETECTION**
    // Check if bomb is close to the enemy with a larger collision radius
    // This makes bombs explode as soon as they get close to the enemy
    const bombRadius = bomb.size * 2; // Increased collision radius
    const distance = Math.sqrt(
      Math.pow(bomb.x - bomb.targetX, 2) + 
      Math.pow(bomb.y - bomb.targetY, 2)
    );
    
    // Check both distance-based collision and rect-based collision
    const rectCollision = (
      bomb.x - bomb.size < targetEnemy.x + targetEnemy.width &&
      bomb.x + bomb.size > targetEnemy.x &&
      bomb.y - bomb.size < targetEnemy.y + targetEnemy.height &&
      bomb.y + bomb.size > targetEnemy.y
    );
    
    if (distance < bombRadius + targetEnemy.width / 2 || rectCollision) {
      // Bomb hit the target - create explosion at enemy's position for better visual feedback
      createExplosion(svg, targetEnemy.x + targetEnemy.width / 2, targetEnemy.y + targetEnemy.height / 2, bomb.size * 3);
      
      // Remove bomb
      if (bomb.element.parentNode) {
        bomb.element.parentNode.removeChild(bomb.element);
      }
      
      // Remove the enemy
      const targetIndex = enemyState.enemies.indexOf(targetEnemy);
      if (targetIndex !== -1) {
        // Remove enemy element
        if (targetEnemy.element.parentNode) {
          targetEnemy.element.parentNode.removeChild(targetEnemy.element);
        }
        
        // Remove from array
        enemyState.enemies.splice(targetIndex, 1);
      }
      
      return { completed: true, enemyState };
    }
    
    // Increase progress but cap at 0.95 to ensure we don't overshoot
    // with the bezier curve and actually hit the collision detection
    bomb.progress = Math.min(bomb.progress + bomb.speed * deltaTime / 16, 0.95);
  }
  
  // Calculate position along quadratic bezier curve with updated target
  const t = bomb.progress;
  const u = 1 - t;
  
  // Quadratic bezier formula
  bomb.x = u * u * bomb.startX + 2 * u * t * bomb.controlX + t * t * bomb.targetX;
  bomb.y = u * u * bomb.startY + 2 * u * t * bomb.controlY + t * t * bomb.targetY;
  
  // Update bomb position
  bomb.element.setAttribute('cx', bomb.x);
  bomb.element.setAttribute('cy', bomb.y);
  
  // Create trail effect
  if (Math.random() < 0.3) {
    const trailElement = createSVGElement('circle', {
      cx: bomb.x,
      cy: bomb.y,
      r: bomb.size / 2,
      fill: 'rgba(255, 165, 0, 0.7)'
    });
    
    svg.appendChild(trailElement);
    
    // Fade out and remove the trail particle
    setTimeout(() => {
      if (trailElement.parentNode) {
        trailElement.parentNode.removeChild(trailElement);
      }
    }, 200);
  }
  
  return { completed: false, enemyState };
}

// Create explosion particle
function createExplosionParticle(svg, x, y, size, angle, speed, life) {
  const colors = ['#ff5500', '#ffaa00', '#ff7700', '#ff2200'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  const particle = createSVGElement('circle', {
    cx: x,
    cy: y,
    r: size,
    fill: color
  });
  
  svg.appendChild(particle);
  
  // Calculate velocity based on angle and speed
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;
  
  // Start animation
  let elapsed = 0;
  const interval = 1000 / 60; // 60 fps
  
  const animate = () => {
    elapsed += interval;
    
    if (elapsed >= life) {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
      return;
    }
    
    // Move particle
    const currentX = parseFloat(particle.getAttribute('cx')) + vx;
    const currentY = parseFloat(particle.getAttribute('cy')) + vy;
    
    particle.setAttribute('cx', currentX);
    particle.setAttribute('cy', currentY);
    
    // Shrink particle
    const scale = 1 - elapsed / life;
    particle.setAttribute('r', size * scale);
    
    // Fade out
    particle.setAttribute('fill-opacity', scale);
    
    requestAnimationFrame(animate);
  };
  
  requestAnimationFrame(animate);
}

// Create explosion effect
function createExplosion(svg, x, y, size) {
  // Create a flash effect
  const flash = createSVGElement('circle', {
    cx: x,
    cy: y,
    r: size * 1.5,
    fill: 'white',
    'fill-opacity': 0.8
  });
  
  svg.appendChild(flash);
  
  // Fade out flash
  let opacity = 0.8;
  const fadeInterval = setInterval(() => {
    opacity -= 0.1;
    flash.setAttribute('fill-opacity', opacity);
    
    if (opacity <= 0) {
      clearInterval(fadeInterval);
      if (flash.parentNode) {
        flash.parentNode.removeChild(flash);
      }
    }
  }, 30);
  
  // Create explosion particles
  for (let i = 0; i < 30; i++) {
    const particleSize = Math.random() * (size / 5) + (size / 10);
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + 1;
    const life = Math.random() * 500 + 300;
    
    createExplosionParticle(svg, x, y, particleSize, angle, speed, life);
  }
}

// Find nearest enemy
function findNearestEnemy(player, enemies) {
  if (enemies.length === 0) return null;
  
  let nearest = null;
  let nearestDistance = Infinity;
  
  const playerX = player.x + player.width / 2;
  const playerY = player.y + player.height / 2;
  
  for (const enemy of enemies) {
    const enemyX = enemy.x + enemy.width / 2;
    const enemyY = enemy.y + enemy.height / 2;
    
    const dx = enemyX - playerX;
    const dy = enemyY - playerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = enemy;
    }
  }
  
  return nearest;
}

export { createBomb, updateBomb, findNearestEnemy };