// Snake — placeholder until step 3 of SPEC 11: only draws the fruit atlas.
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const fruitsImg = new Image();
fruitsImg.src = window.SPRITE_ATLAS.sources.fruits;
fruitsImg.onload = () => {
  ctx.imageSmoothingEnabled = false;
  Object.values(window.SPRITE_ATLAS.fruits).forEach((s, i) => {
    const dx = (i % 5) * 120 + 10, dy = Math.floor(i / 5) * 120 + 10;
    ctx.drawImage(fruitsImg, s.x, s.y, s.w, s.h, dx, dy, s.w * 0.6, s.h * 0.6);
  });
};
