import { createSVGElement } from './utils.js';
import { ENEMY_TYPES } from './constants.js';
import { createBullet } from './bullet.js';
import { gameState } from './gameState.js';

// Base Enemy class - all enemy types inherit from this
class Enemy {
  constructor(svg, x, y, scale) {
    this.svg = svg;
    this.x = x;
    this.y = y;
    this.scale = scale;
    this.group = null;
    this.element = null;
    this.hitboxElement = null;
    this.width = 0;
    this.height = 0;
    this.lastShot = 0;
    this.patternY = y; // Original Y position for wave movement
    this.patternOffset = Math.random() * Math.PI * 2; // Random offset for patterns
  }

  // Create SVG elements for the enemy
  createElements() {
    // Create enemy group
    this.group = createSVGElement('g', {
      class: 'enemy-group',
      transform: `translate(${this.x}, ${this.y})`
    });
    
    // Create hitbox outline
    this.hitboxElement = createSVGElement('rect', {
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
      fill: 'none',
      stroke: this.color,
      'stroke-width': 2,
      'stroke-dasharray': '3,3',
      class: 'hitbox',
      'pointer-events': 'none',
      opacity: 0 // Hidden by default
    });
    
    // Add elements to group - add visual first so hitbox appears on top
    this.group.appendChild(this.element);
    this.group.appendChild(this.hitboxElement);
    
    this.svg.appendChild(this.group);
  }

  // Update method called every frame
  update(deltaTime, currentTime, width, height, hitboxesVisible) {
    // Apply movement pattern
    this.move(deltaTime, currentTime, width, height);
    
    // Update position in DOM
    this.updatePosition();
    
    // Update hitbox visibility
    if (this.hitboxElement) {
      this.hitboxElement.style.opacity = hitboxesVisible ? '1' : '0';
    }
    
    // Return true if enemy is still active, false if it should be removed
    return this.x + this.width >= 0;
  }
  
  // Movement pattern - to be overridden by subclasses
  move(deltaTime, currentTime, width, height) {
    // Basic movement from right to left
    this.x -= this.speed * deltaTime / 16;
  }
  
  // Update DOM position
  updatePosition() {
    if (this.group) {
      this.group.setAttribute('transform', `translate(${this.x}, ${this.y})`);
    }
  }
  
  // Check if should shoot
  shouldShoot(deltaTime) {
    const shootChance = this.getShootChance() * deltaTime;
    return Math.random() < shootChance && Date.now() - this.lastShot > this.shootCooldown;
  }
  
  // Get shoot chance - can be overridden by subclasses
  getShootChance() {
    return 0.001; // Default chance
  }
  
  // Create a bullet
  shoot(svg) {
    const bulletX = this.x;
    const bulletY = this.y + this.height / 2;
    this.lastShot = Date.now();
    return createBullet(svg, bulletX, bulletY, -1, true);
  }
  
  // Take damage
  takeDamage() {
    this.armor--;
    
    // Flash enemy when hit
    this.element.setAttribute('fill', 'white');
    setTimeout(() => {
      if (this.element && this.element.parentNode) {
        this.element.setAttribute('fill', this.color);
      }
    }, 50);
    
    return this.armor <= 0; // Return true if destroyed
  }
  
  // Remove from DOM
  remove() {
    if (this.group && this.group.parentNode) {
      this.group.parentNode.removeChild(this.group);
    }
  }
}

// Basic Enemy class - regular triangle enemy
class BasicEnemy extends Enemy {
  constructor(svg, x, y, scale) {
    super(svg, x, y, scale);
    
    const enemyInfo = ENEMY_TYPES.BASIC;
    this.type = 'BASIC';
    this.speed = enemyInfo.speed * scale;
    // Apply difficulty-based armor bonus
    this.armor = enemyInfo.armor + (gameState.enemyArmorBonus || 0);
    this.points = enemyInfo.points;
    this.color = enemyInfo.color;
    this.width = enemyInfo.size * scale;
    this.height = enemyInfo.size * scale;
    this.shootCooldown = 2000;
    
    // Create visual element
    this.element = createSVGElement('polygon', {
      points: `${this.width/2},0 ${this.width},${this.height} 0,${this.height}`,
      fill: this.color,
      stroke: 'white',
      'stroke-width': 2
    });
    
    this.createElements();
  }
  
  // Basic enemies move in a straight line
  move(deltaTime, currentTime, width, height) {
    super.move(deltaTime, currentTime, width, height);
  }
  
  getShootChance() {
    return 0.001;
  }
}

// Fast Enemy class - diamond shape with wave movement
class FastEnemy extends Enemy {
  constructor(svg, x, y, scale) {
    super(svg, x, y, scale);
    
    const enemyInfo = ENEMY_TYPES.FAST;
    this.type = 'FAST';
    this.speed = enemyInfo.speed * scale;
    // Apply difficulty-based armor bonus
    this.armor = enemyInfo.armor + (gameState.enemyArmorBonus || 0);
    this.points = enemyInfo.points;
    this.color = enemyInfo.color;
    this.width = enemyInfo.size * scale;
    this.height = enemyInfo.size * scale;
    this.shootCooldown = 3000;
    
    // Create visual element
    this.element = createSVGElement('polygon', {
      points: `${this.width/2},0 ${this.width},${this.height/2} ${this.width/2},${this.height} 0,${this.height/2}`,
      fill: this.color,
      stroke: 'white',
      'stroke-width': 2
    });
    
    this.createElements();
  }
  
  // Fast enemies move in a sine wave pattern
  move(deltaTime, currentTime, width, height) {
    // Horizontal movement
    this.x -= this.speed * deltaTime / 16;
    
    // Sine wave movement
    const frequency = 0.005;
    const amplitude = 50 * this.scale;
    this.y = this.patternY + Math.sin((currentTime + this.patternOffset) * frequency) * amplitude;
  }
  
  getShootChance() {
    return 0.0005;
  }
}

// Tank Enemy class - hexagon shape with zigzag movement
class TankEnemy extends Enemy {
  constructor(svg, x, y, scale) {
    super(svg, x, y, scale);
    
    const enemyInfo = ENEMY_TYPES.TANK;
    this.type = 'TANK';
    this.speed = enemyInfo.speed * scale;
    // Apply difficulty-based armor bonus
    this.armor = enemyInfo.armor + (gameState.enemyArmorBonus || 0);
    this.points = enemyInfo.points;
    this.color = enemyInfo.color;
    this.width = enemyInfo.size * scale;
    this.height = enemyInfo.size * scale;
    this.shootCooldown = 1500;
    
    // Create visual element
    this.element = createSVGElement('polygon', {
      points: `${this.width/4},0 ${this.width*3/4},0 ${this.width},${this.height/2} ${this.width*3/4},${this.height} ${this.width/4},${this.height} 0,${this.height/2}`,
      fill: this.color,
      stroke: 'white',
      'stroke-width': 2
    });
    
    this.createElements();
  }
  
  // Tank enemies move in a zigzag pattern
  move(deltaTime, currentTime, width, height) {
    // Horizontal movement
    this.x -= this.speed * deltaTime / 16;
    
    // Zigzag movement
    if (Math.floor(currentTime / 1000) % 2 === 0) {
      this.y += 0.5 * this.scale;
    } else {
      this.y -= 0.5 * this.scale;
    }
    
    // Keep within bounds
    if (this.y < 0) this.y = 0;
    if (this.y > height - this.height) this.y = height - this.height;
  }
  
  getShootChance() {
    return 0.002;
  }
}

// New Arc Enemy class - moves in an arc pattern across the screen
class ArcEnemy extends Enemy {
  constructor(svg, x, y, scale) {
    super(svg, x, y, scale);
    
    // Define properties for the new enemy type
    this.type = 'ARC';
    this.speed = 2.5 * scale;
    // Apply difficulty-based armor bonus
    this.armor = 2 + (gameState.enemyArmorBonus || 0);
    this.points = 25;
    this.color = '#FFAA00';
    this.width = 35 * scale;
    this.height = 35 * scale;
    this.shootCooldown = 2500;
    
    // Additional properties for arc movement
    this.arcProgress = 0;
    this.arcDirection = (y < window.innerHeight / 2) ? 1 : -1; // Down if in top half, up if in bottom half
    this.arcAmplitude = 300 * scale;
    this.startX = x;
    this.startY = y;
    
    // Create visual element - octagon shape
    this.element = createSVGElement('polygon', {
      points: `${this.width/3},0 ${this.width*2/3},0 ${this.width},${this.height/3} ${this.width},${this.height*2/3} 
              ${this.width*2/3},${this.height} ${this.width/3},${this.height} 0,${this.height*2/3} 0,${this.height/3}`,
      fill: this.color,
      stroke: 'white',
      'stroke-width': 2
    });
    
    this.createElements();
  }
  
  // Arc enemies move in a large arc pattern across the screen
  move(deltaTime, currentTime, width, height) {
    // Increase arc progress
    this.arcProgress += (this.speed / width) * (deltaTime / 16);
    
    // Calculate x position - moves from right to left
    this.x = this.startX - (this.startX + width) * this.arcProgress;
    
    // Calculate y position - follows a semicircle arc
    // Using sin for the arc: sin reaches max amplitude at arcProgress = 0.5
    const arcFactor = Math.sin(this.arcProgress * Math.PI);
    this.y = this.startY + (this.arcAmplitude * arcFactor * this.arcDirection);
    
    // Keep within bounds
    if (this.y < 0) this.y = 0;
    if (this.y > height - this.height) this.y = height - this.height;
  }
  
  getShootChance() {
    return 0.0015;
  }
  
  // Arc enemies can be on screen for their full arc even if X is negative
  update(deltaTime, currentTime, width, height, hitboxesVisible) {
    this.move(deltaTime, currentTime, width, height);
    this.updatePosition();
    
    if (this.hitboxElement) {
      this.hitboxElement.style.opacity = hitboxesVisible ? '1' : '0';
    }
    
    // Remove only when arc is complete and off-screen
    return this.arcProgress <= 1.2; // Allow some buffer to complete the arc
  }
}

// Factory function to create enemy by type
function createEnemyByType(svg, x, y, type, scale) {
  switch (type) {
    case 'BASIC':
      return new BasicEnemy(svg, x, y, scale);
    case 'FAST':
      return new FastEnemy(svg, x, y, scale);
    case 'TANK':
      return new TankEnemy(svg, x, y, scale);
    case 'ARC':
      return new ArcEnemy(svg, x, y, scale);
    default:
      return new BasicEnemy(svg, x, y, scale);
  }
}

export {
  Enemy,
  BasicEnemy,
  FastEnemy,
  TankEnemy,
  ArcEnemy,
  createEnemyByType
};