import { createSVGElement } from './utils.js';

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

// Initialize space background
function createSpaceBackground(svg, width, height) {
  // Add a space gradient background
  const defs = createSVGElement('defs', {});
  
  const gradient = createSVGElement('radialGradient', {
    id: 'spaceGradient',
    cx: '50%',
    cy: '50%',
    r: '100%',
    fx: '50%',
    fy: '50%'
  });
  
  // Add gradient stops
  const stop1 = createSVGElement('stop', {
    offset: '0%',
    'stop-color': '#0A0A2A'
  });
  
  const stop2 = createSVGElement('stop', {
    offset: '100%',
    'stop-color': '#000000'
  });
  
  gradient.appendChild(stop1);
  gradient.appendChild(stop2);
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
  
  // Create stars
  const stars = [];
  const numStars = 100;
  
  for (let i = 0; i < numStars; i++) {
    stars.push(createStar(svg, width, height));
  }
  
  // Create distant galaxies
  const galaxies = [];
  const numGalaxies = 5;
  
  for (let i = 0; i < numGalaxies; i++) {
    galaxies.push(createGalaxy(svg, width, height));
  }
  
  return { stars, galaxies, background };
}

// Update space background to create moving effect
function updateSpaceBackground(background, deltaTime, height) {
  const { stars, galaxies } = background;
  
  // Update stars
  for (const star of stars) {
    star.y += star.speed * (deltaTime / 16);
    
    // Reset star position when it moves off screen
    if (star.y > height) {
      star.y = 0;
      star.x = Math.random() * parseInt(star.element.ownerSVGElement.getAttribute('width'));
    }
    
    star.element.setAttribute('cy', star.y);
  }
  
  // Update galaxies
  for (const galaxy of galaxies) {
    galaxy.y += galaxy.speed * (deltaTime / 16);
    
    // Reset galaxy position when it moves off screen
    if (galaxy.y > height + galaxy.size) {
      galaxy.y = -galaxy.size;
      galaxy.x = Math.random() * parseInt(galaxy.element.ownerSVGElement.getAttribute('width'));
    }
    
    galaxy.element.setAttribute('cy', galaxy.y);
  }
}

export { createSpaceBackground, updateSpaceBackground };