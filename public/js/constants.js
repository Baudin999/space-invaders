// Game constants
const SCROLL_SPEED = 2;
const PLAYER_SHOOT_COOLDOWN = 300;
const ENEMY_SHOOT_COOLDOWN = 1000;
const BOMB_COOLDOWN = 5000; // 5 seconds between bombs

// Enemy types
const ENEMY_TYPES = {
  BASIC: {
    speed: 1.5,
    armor: 1,
    points: 10,
    color: '#FF5555',
    size: 30
  },
  FAST: {
    speed: 3,
    armor: 1,
    points: 20,
    color: '#55FF55',
    size: 25
  },
  TANK: {
    speed: 0.8,
    armor: 3,
    points: 30,
    color: '#5555FF',
    size: 40
  }
};

// Power-up types
const POWERUP_TYPES = {
  DOUBLE_SHOT: {
    color: '#FFFF00',
    duration: 10000, // 10 seconds
    probability: 0.3
  },
  TRIPLE_SHOT: {
    color: '#FF00FF',
    duration: 7000, // 7 seconds
    probability: 0.2
  },
  RAPID_FIRE: {
    color: '#00FFFF',
    duration: 5000, // 5 seconds
    probability: 0.1
  }
};

// Enemy spawn frequency (in milliseconds)
const ENEMY_SPAWN_INTERVAL = 2000;

// Power-up spawn probability (chance per enemy killed)
const POWERUP_SPAWN_CHANCE = 0.2;

export {
  SCROLL_SPEED,
  PLAYER_SHOOT_COOLDOWN,
  ENEMY_SHOOT_COOLDOWN,
  BOMB_COOLDOWN,
  ENEMY_TYPES,
  POWERUP_TYPES,
  ENEMY_SPAWN_INTERVAL,
  POWERUP_SPAWN_CHANCE
};