/**
 * SPRITE_ATLAS — sprite map for the Snake game.
 * Image source: https://www.spriters-resource.com/browser_games/googlesnakegame/
 *
 * Coordinates detected by pixel analysis of the PNG. Structure: { x, y, w, h } — crop inside fruits.png.
 * Names follow what the image shows, left to right (the reference atlas had them shifted).
 *
 * Usage:
 *   const a = window.SPRITE_ATLAS;
 *   ctx.drawImage(img, a.fruits.apple.x, a.fruits.apple.y,
 *                      a.fruits.apple.w, a.fruits.apple.h,
 *                      dx, dy, dw, dh);
 */
window.SPRITE_ATLAS = {

  sources: {
    fruits: 'fruits.png',  // transparent bg
  },

  // Fruits (pixel-art middle row of fruits.png).
  // Sheet: 3790x442 px. Transparent background. Row used: y=136–295 (160px tall).
  fruits: {
    apple: { x: 34, y: 136, w: 110, h: 160 },
    banana: { x: 186, y: 136, w: 150, h: 160 },
    pineapple: { x: 378, y: 136, w: 110, h: 160 },
    grape: { x: 540, y: 136, w: 130, h: 160 },
    pumpkin: { x: 712, y: 136, w: 130, h: 160 },
    turnip: { x: 894, y: 136, w: 110, h: 160 },
    eggplant: { x: 1066, y: 136, w: 110, h: 160 },
    strawberry: { x: 1228, y: 136, w: 130, h: 160 },
    cherry: { x: 1400, y: 136, w: 130, h: 160 },
    carrot: { x: 1582, y: 136, w: 110, h: 160 },
    mushroom: { x: 1734, y: 136, w: 150, h: 160 },
    broccoli: { x: 1906, y: 136, w: 150, h: 160 },
    watermelon: { x: 2068, y: 136, w: 170, h: 160 },
    pepper: { x: 2250, y: 136, w: 140, h: 160 },
    kiwi: { x: 2432, y: 136, w: 130, h: 160 },
    lemon: { x: 2604, y: 136, w: 130, h: 160 },
    orange: { x: 2786, y: 136, w: 110, h: 160 },
    peach: { x: 2948, y: 136, w: 130, h: 160 },
    peanut: { x: 3110, y: 136, w: 150, h: 160 },
    raspberry: { x: 3302, y: 136, w: 110, h: 160 },
    tomato: { x: 3454, y: 136, w: 150, h: 160 },
    salad: { x: 3637, y: 136, w: 130, h: 160 },
  },
};
