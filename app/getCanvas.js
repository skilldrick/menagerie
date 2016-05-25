export default function getCanvas(canvas, width, height) {
  const ctx = canvas.getContext('2d');
  fixForRetina(canvas, ctx, width, height);
  return ctx;
}

function fixForRetina(canvas, ctx, width, height) {
  const pixelRatio = window.devicePixelRatio || 1;

  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;

  canvas.style.width = width + "px";
  canvas.style.height = height + "px";

  ctx.scale(pixelRatio, pixelRatio);
}
