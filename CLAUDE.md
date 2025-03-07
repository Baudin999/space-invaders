# CLAUDE.md - Guidelines for Space Invaders Project

## Server Commands
- Install dependencies: `npm install`
- Start server: `npm start`
- Run in development mode: `npm run dev` (if nodemon is installed)

## Directory Structure
- `/public`: Static files served by Express
- `/public/js`: JavaScript files for game logic
- `/public/css`: CSS files (if added later)

## Code Style Guidelines
- Indentation: 2 spaces
- Line length: 80 characters maximum
- Naming: camelCase for variables/functions, PascalCase for classes/components
- Error handling: use try/catch blocks with descriptive error messages
- SVG creation: Use SVG namespace with createElementNS
- Game objects: Represent as objects with position, size, and element properties
- Animation: Use requestAnimationFrame for smooth game loop
- Scaling: Calculate positions relative to screen size for responsiveness

## Game Implementation
- Use SVG for all game graphics
- Implement collision detection with bounding box approach
- Handle keyboard input with keydown/keyup events
- Maintain game state with separate update functions
- Scale game elements based on viewport size