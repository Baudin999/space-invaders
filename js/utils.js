// Utility functions

// Create SVG element with attributes
function createSVGElement(type, attributes) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', type);
  for (const key in attributes) {
    element.setAttribute(key, attributes[key]);
  }
  return element;
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

// Set dimensions based on screen size
function setDimensions(svg) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const scale = Math.min(width, height) / 800;
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  
  return { width, height, scale };
}

export { createSVGElement, checkCollision, setDimensions };