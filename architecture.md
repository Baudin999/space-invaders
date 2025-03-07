# Space Invaders Architecture Documentation

## Overview

Space Invaders is a browser-based game built with vanilla JavaScript and SVG graphics. The game follows a modular architecture with a focus on responsiveness, smooth animation, and maintainable code structure.

## Directory Structure

```
/public
  /css
    - styles.css              # Main stylesheet
  /js
    - background.js           # Background animation and stars
    - bullet.js               # Bullet logic for player and enemies
    - constants.js            # Game constants and configuration
    - enemy.js                # Enemy creation and behavior
    - game.js                 # Core game mechanics
    - gameState.js            # Game state management
    - main.js                 # Entry point and game loop
    - player.js               # Player ship logic
    - utils.js                # Utility functions and helpers
  - index.html                # Main HTML file
/server.js                    # Express server for local development
```

## Core Components

### Game Loop

The game uses `requestAnimationFrame` for smooth animation:

```javascript
function gameLoop(timestamp) {
  // Calculate delta time for frame-rate independent movement
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  
  // Update game components
  updateBackground(deltaTime);
  playerState = updatePlayer(playerState, deltaTime);
  enemyState = updateEnemies(enemyState, deltaTime);
  bulletState = updateBullets(bulletState, deltaTime, playerState, enemyState);
  
  // Check game conditions
  checkGameState();
  
  // Continue loop if game is active
  if (gameState.isActive) {
    animationId = requestAnimationFrame(gameLoop);
  }
}
```

### Rendering System

The game uses SVG for all rendering:

- All game elements are SVG elements (polygon, rect, circle)
- Elements scale based on viewport size
- SVG namespace is used with `createElementNS` for proper element creation
- Element positions are updated through transform attributes

```javascript
// Example SVG element creation from utils.js
function createSVGElement(type, attributes = {}) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', type);
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }
  return element;
}
```

### State Management

The game uses a combination of approaches for state management:

1. **Global Game State**: Managed in `gameState.js`
   - Tracks score, lives, game status
   - Handles game start/over conditions

2. **Component State**: Each entity manages its own state
   - Player state (position, cooldowns)
   - Enemy state (positions, movement direction)
   - Bullet state (active bullets, velocities)

3. **Immutable Updates**: State objects are updated immutably
   - Functions return updated state rather than modifying existing state
   - Helps prevent side effects and maintain predictable behavior

## Key Gameplay Mechanics

### Movement System

- **Player Movement**: Controlled by arrow keys with boundary limits
- **Enemy Movement**: Grid-based pattern with direction changes at screen edges
- **Adaptive Difficulty**: Enemies speed up as their numbers decrease

### Collision Detection

Simple AABB (Axis-Aligned Bounding Box) collision detection:

```javascript
function checkCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}
```

### Weapon Systems

- **Player Shooting**: Space bar with cooldown timer
- **Enemy Shooting**: Random intervals with increasing frequency
- **Bullet Management**: Creation, movement, collision detection, and cleanup

## Responsive Design

The game adapts to different screen sizes:

- Viewport-based scaling for all game elements
- Dynamic recalculation on window resize
- Maintains gameplay aspect ratio across devices

```javascript
window.addEventListener('resize', () => {
  // Cancel current animation frame
  cancelAnimationFrame(animationId);
  
  // Recalculate game dimensions
  calculateGameDimensions();
  
  // Reset game elements with new dimensions
  resetGameElements();
  
  // Restart game loop
  animationId = requestAnimationFrame(gameLoop);
});
```

## Technical Considerations

### Performance Optimization

- **Minimal DOM Updates**: Only updates transformed elements
- **Efficient Collision Detection**: Only checks relevant entities
- **Element Pooling**: Reuses bullet elements instead of creating new ones
- **Frame-Rate Independence**: Uses delta time for consistent movement

### Browser Compatibility

- Works in modern browsers with SVG support
- Responsive design works across desktop and mobile
- Uses standard DOM APIs for wide compatibility

## Deployment

The game is deployed to GitHub Pages using GitHub Actions:

- Automatic deployment on pushes to main branch
- Static files served directly from the /public directory
- No server-side dependencies in production

## Future Enhancements

Potential areas for improvement:

1. **Mobile Controls**: Touch-based controls for mobile devices
2. **Sound Effects**: Audio system for game events
3. **Power-ups**: Special abilities and temporary enhancements
4. **Local Storage**: Saving high scores between sessions
5. **Additional Enemy Types**: Different behaviors and movement patterns