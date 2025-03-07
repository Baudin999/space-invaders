import { createSVGElement } from './utils.js';
import { SCROLL_SPEED } from './constants.js';

// Create a star with random properties
function createStar(svg, width, height) {
  const size = Math.random() * 2 + 1;
  const opacity = Math.random() * 0.7 + 0.3;
  const x = Math.random() * width;
  const y = Math.random() * height;
  const speed = Math.random() * 2 + 1;
  
  const star = createSVGElement('circle', {
    cx: x,
    cy: y,
    r: size,
    fill: 'white',
    opacity: opacity
  });
  
  svg.appendChild(star);
  
  return {
    element: star,
    x,
    y,
    size,
    speed,
    opacity
  };
}

// Create a distant galaxy with random properties
function createGalaxy(svg, width, height) {
  const size = Math.random() * 60 + 20;
  const opacity = Math.random() * 0.4 + 0.1;
  const x = Math.random() * width;
  const y = Math.random() * height;
  const speed = Math.random() * 0.5 + 0.2;
  
  // Random color for galaxy - blues, purples, pinks
  const colors = ['#8A2BE2', '#4B0082', '#9400D3', '#9932CC', '#1E90FF', '#FF1493'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  const galaxy = createSVGElement('circle', {
    cx: x,
    cy: y,
    r: size,
    fill: color,
    opacity: opacity,
    filter: 'blur(8px)'
  });
  
  // Add the galaxy as the first child of SVG to ensure it's in the background
  svg.prepend(galaxy);
  
  return {
    element: galaxy,
    x,
    y,
    size,
    speed,
    opacity
  };
}

// Initialize space background for side-scrolling
function createSpaceBackground(svg, width, height) {
  // Add a space gradient background
  const defs = createSVGElement('defs', {});
  
  const gradient = createSVGElement('linearGradient', {
    id: 'spaceGradient',
    x1: '0%',
    y1: '0%',
    x2: '100%',
    y2: '0%'
  });
  
  // Add gradient stops
  const stop1 = createSVGElement('stop', {
    offset: '0%',
    'stop-color': '#000000'
  });
  
  const stop2 = createSVGElement('stop', {
    offset: '50%',
    'stop-color': '#0A0A2A'
  });
  
  const stop3 = createSVGElement('stop', {
    offset: '100%',
    'stop-color': '#000000'
  });
  
  gradient.appendChild(stop1);
  gradient.appendChild(stop2);
  gradient.appendChild(stop3);
  defs.appendChild(gradient);
  svg.appendChild(defs);
  
  // Create background rectangle with gradient
  const background = createSVGElement('rect', {
    x: 0,
    y: 0,
    width: width,
    height: height,
    fill: 'url(#spaceGradient)'
  });
  
  svg.appendChild(background);
  
  // Create stars - we'll create two layers for parallax effect
  const starsFar = [];
  const starsNear = [];
  const numStars = 100;
  
  for (let i = 0; i < numStars; i++) {
    if (i < numStars / 2) {
      starsNear.push(createStar(svg, width, height));
    } else {
      starsFar.push(createStar(svg, width, height));
    }
  }
  
  // Create distant galaxies
  const galaxies = [];
  const numGalaxies = 5;
  
  for (let i = 0; i < numGalaxies; i++) {
    galaxies.push(createGalaxy(svg, width, height));
  }
  
  return { starsNear, starsFar, galaxies, background };
}

// Update space background to create side-scrolling effect
function updateSpaceBackground(background, deltaTime, width) {
  const { starsNear, starsFar, galaxies } = background;
  const baseSpeed = SCROLL_SPEED * (deltaTime / 16);
  
  // Update near stars (faster)
  for (const star of starsNear) {
    star.x -= (star.speed + baseSpeed) * 1.5;
    
    // Reset star position when it moves off screen
    if (star.x < 0) {
      star.x = width;
      star.y = Math.random() * parseInt(star.element.ownerSVGElement.getAttribute('height'));
    }
    
    star.element.setAttribute('cx', star.x);
  }
  
  // Update far stars (slower)
  for (const star of starsFar) {
    star.x -= (star.speed + baseSpeed) * 0.7;
    
    // Reset star position when it moves off screen
    if (star.x < 0) {
      star.x = width;
      star.y = Math.random() * parseInt(star.element.ownerSVGElement.getAttribute('height'));
    }
    
    star.element.setAttribute('cx', star.x);
  }
  
  // Update galaxies (slowest - background layer)
  for (const galaxy of galaxies) {
    galaxy.x -= galaxy.speed + baseSpeed * 0.3;
    
    // Reset galaxy position when it moves off screen
    if (galaxy.x < -galaxy.size) {
      galaxy.x = width + galaxy.size;
      galaxy.y = Math.random() * parseInt(galaxy.element.ownerSVGElement.getAttribute('height'));
    }
    
    galaxy.element.setAttribute('cx', galaxy.x);
  }
}

export { createSpaceBackground, updateSpaceBackground };