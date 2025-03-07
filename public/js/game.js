document.addEventListener('DOMContentLoaded', () => {
  // Game constants and variables
  const svg = document.getElementById('game-svg');
  const scoreElement = document.getElementById('score');
  const finalScoreElement = document.getElementById('final-score');
  const gameOverScreen = document.getElementById('game-over');
  const startScreen = document.getElementById('start-screen');
  const startButton = document.getElementById('start-button');
  const restartButton = document.getElementById('restart-button');

  // Game state
  let gameRunning = false;
  let score = 0;
  let lives = 3;
  let width, height, scale;
  let player;
  let enemies = [];
  let bullets = [];
  let enemyBullets = [];
  let lastEnemyShot = 0;
  let enemyDirection = 1;
  let enemySpeed = 1;
  let enemyMoveDownAmount = 30;
  let keyStates = {};
  let lastFrameTime = 0;
  let animationFrameId;

  // Set dimensions based on screen size
  function setDimensions() {
    width = window.innerWidth;
    height = window.innerHeight;
    scale = Math.min(width, height) / 800;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  }

  // Create SVG element with attributes
  function createSVGElement(type, attributes) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', type);
    for (const key in attributes) {
      element.setAttribute(key, attributes[key]);
    }
    return element;
  }

  // Initialize player
  function createPlayer() {
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
      shootCooldown: 300
    };
  }

  // Create enemies
  function createEnemies() {
    const enemies = [];
    const enemySize = 40 * scale;
    const rows = 5;
    const cols = 10;
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

  // Create a bullet
  function createBullet(x, y, direction, isEnemy = false) {
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

  // Collision detection
  function checkCollision(obj1, obj2) {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    );
  }

  // Update player
  function updatePlayer(deltaTime) {
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
      const bulletX = player.x + player.width / 2 - 2 * scale;
      const bulletY = player.y;
      bullets.push(createBullet(bulletX, bulletY, -1));
      player.lastShot = Date.now();
    }
  }

  // Update enemies
  function updateEnemies(deltaTime) {
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
      return;
    }
    
    // Move enemies
    for (const enemy of enemies) {
      enemy.x += moveAmount;
      
      if (moveDown) {
        enemy.y += enemyMoveDownAmount * scale;
      }
      
      // Update enemy element position
      enemy.element.setAttribute('transform', `translate(${enemy.x}, ${enemy.y})`);
    }
    
    // Enemy shooting
    if (enemies.length > 0 && Date.now() - lastEnemyShot > 1000) {
      const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
      const bulletX = randomEnemy.x + randomEnemy.width / 2 - 2 * scale;
      const bulletY = randomEnemy.y + randomEnemy.height;
      enemyBullets.push(createBullet(bulletX, bulletY, 1, true));
      lastEnemyShot = Date.now();
    }
  }

  // Update bullets
  function updateBullets(deltaTime) {
    const moveAmount = deltaTime / 16;
    
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
          enemySpeed = 1 + (1 - enemies.length / (5 * 10)) * 3;
          
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
  }

  // Game over
  function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationFrameId);
    finalScoreElement.textContent = score;
    gameOverScreen.style.display = 'block';
  }

  // Game loop
  function gameLoop(timestamp) {
    if (!gameRunning) return;
    
    const deltaTime = timestamp - lastFrameTime;
    lastFrameTime = timestamp;
    
    updatePlayer(deltaTime);
    updateEnemies(deltaTime);
    updateBullets(deltaTime);
    
    // Check if all enemies are defeated
    if (enemies.length === 0) {
      enemySpeed = 1;
      enemies = createEnemies();
    }
    
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  // Handle keyboard input
  function handleKeyDown(e) {
    keyStates[e.key] = true;
    // Prevent scrolling with arrow keys or space
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }
  }

  function handleKeyUp(e) {
    keyStates[e.key] = false;
  }

  // Start the game
  function startGame() {
    setDimensions();
    svg.innerHTML = '';
    enemies = [];
    bullets = [];
    enemyBullets = [];
    score = 0;
    keyStates = {};
    
    scoreElement.textContent = score;
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    
    player = createPlayer();
    enemies = createEnemies();
    
    lastFrameTime = performance.now();
    gameRunning = true;
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  // Handle window resize
  function handleResize() {
    if (gameRunning) {
      cancelAnimationFrame(animationFrameId);
      startGame();
    } else {
      setDimensions();
    }
  }

  // Event listeners
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  window.addEventListener('resize', handleResize);
  startButton.addEventListener('click', startGame);
  restartButton.addEventListener('click', startGame);

  // Initial setup
  setDimensions();
});