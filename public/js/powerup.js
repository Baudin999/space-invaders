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
    this.hitboxElement = null;
    this.group = null;
    this.svg = svg;
    this.active = true;
    this.speed = 1;
    this.createSvgElement();
  }

  createSvgElement() {
    // Create group to hold power-up elements
    this.group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.group.setAttribute('transform', `translate(${this.x}, ${this.y})`);
    this.svg.appendChild(this.group);
    
    // Create power-up visual element
    const powerUpElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    powerUpElement.setAttribute('x', 0);
    powerUpElement.setAttribute('y', 0);
    powerUpElement.setAttribute('width', this.width);
    powerUpElement.setAttribute('height', this.height);
    powerUpElement.setAttribute('fill', this.typeInfo.color);
    
    // Create hitbox element
    const hitboxElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    hitboxElement.setAttribute('x', 0);
    hitboxElement.setAttribute('y', 0);
    hitboxElement.setAttribute('width', this.width);
    hitboxElement.setAttribute('height', this.height);
    hitboxElement.setAttribute('fill', 'none');
    hitboxElement.setAttribute('stroke', this.typeInfo.color);
    hitboxElement.setAttribute('stroke-width', 2);
    hitboxElement.setAttribute('stroke-dasharray', '3,3');
    hitboxElement.setAttribute('class', 'hitbox');
    hitboxElement.setAttribute('pointer-events', 'none');
    hitboxElement.setAttribute('opacity', 0); // Hidden by default
    
    // Add animated pulse effect
    const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    animate.setAttribute('attributeName', 'opacity');
    animate.setAttribute('values', '1;0.5;1');
    animate.setAttribute('dur', '1s');
    animate.setAttribute('repeatCount', 'indefinite');
    powerUpElement.appendChild(animate);
    
    this.element = powerUpElement;
    this.hitboxElement = hitboxElement;
    
    // Add elements to group
    this.group.appendChild(this.element);
    this.group.appendChild(this.hitboxElement);
  }

  update(deltaTime, player, hitboxesVisible = false) {
    // Update hitbox visibility
    if (this.hitboxElement) {
      this.hitboxElement.style.opacity = hitboxesVisible ? 1 : 0;
    }
    
    // Get player position
    if (player) {
      // Calculate direction vector towards player
      const dx = player.x + player.width/2 - this.x - this.width/2;
      const dy = player.y + player.height/2 - this.y - this.height/2;
      
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
    
    // Update the group position
    this.group.setAttribute('transform', `translate(${this.x}, ${this.y})`);
    
    // Check if power-up is out of bounds
    if (this.y > window.innerHeight || this.y < 0 || 
        this.x > window.innerWidth || this.x < 0) {
      this.destroy();
    }
  }

  destroy() {
    if (this.group && this.group.parentNode) {
      this.group.parentNode.removeChild(this.group);
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