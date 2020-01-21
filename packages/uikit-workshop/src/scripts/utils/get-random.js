/* Returns a random number between min and max */
export function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
