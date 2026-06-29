import { Game } from './Game.js';

const container = document.getElementById('app');
const game = new Game(container);
game.start();

// Expose for tinkering in the console.
window.__umbral = game;
