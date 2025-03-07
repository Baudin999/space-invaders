import { POWERUP_TYPES } from './constants.js';

class PowerUp {
  constructor(x, y, type, svg) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.typeInfo = POWERUP_TYPES[type];
    this.width = 25;
    this.height = 25;
    this.element = null;
    this.svg = svg;
    this.active = true;
    this.speed = 1;
    this.createSvgElement();
  }

  createSvgElement() {
    const powerUpElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    powerUpElement.setAttribute('x', this.x);
    powerUpElement.setAttribute('y', this.y);
    powerUpElement.setAttribute('width', this.width);
    powerUpElement.setAttribute('height', this.height);
    powerUpElement.setAttribute('fill', this.typeInfo.color);
    
    // Add animated pulse effect
    const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    animate.setAttribute('attributeName', 'opacity');
    animate.setAttribute('values', '1;0.5;1');
    animate.setAttribute('dur', '1s');
    animate.setAttribute('repeatCount', 'indefinite');
    powerUpElement.appendChild(animate);
    
    this.element = powerUpElement;
    this.svg.appendChild(this.element);
  }

  update(deltaTime, player) {
    // Get player position
    if (player) {
      // Calculate direction vector towards player
      const dx = player.x + player.width/2 - (this.x + this.width/2);
      const dy = player.y + player.height/2 - (this.y + this.height/2);
      
      // Normalize the vector
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0) {
        // Move the power-up toward the player, faster if closer
        const moveSpeed = Math.min(this.speed * (1 + (300 / distance)), 5);
        this.x += (dx / distance) * moveSpeed;
        this.y += (dy / distance) * moveSpeed;
      }
    } else {
      // Default movement if player not provided
      this.x -= this.speed;
    }
    
    // Update the element position
    this.element.setAttribute('x', this.x);
    this.element.setAttribute('y', this.y);
    
    // Check if power-up is out of bounds
    if (this.y > window.innerHeight || this.y < 0 || 
        this.x > window.innerWidth || this.x < 0) {
      this.destroy();
    }
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.active = false;
  }

  getBoundingBox() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }
}

export default PowerUp;