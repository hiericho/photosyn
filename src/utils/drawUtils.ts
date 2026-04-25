import { HandData } from '../types/vision';

const getX = (ctx: CanvasRenderingContext2D, x: number) => (1 - x) * ctx.canvas.width;

export const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20], [0, 17]
];

export function drawHand(ctx: CanvasRenderingContext2D, hand: HandData) {
  const { landmarks, handedness, gesture } = hand;
  const color = handedness === 'Left' ? '#2ecc71' : '#fef3c7';
  
  ctx.save();
  ctx.shadowBlur = 15; ctx.shadowColor = color;
  ctx.strokeStyle = color; ctx.lineWidth = 2;
  
  // Conexiones
  for (const [s, e] of HAND_CONNECTIONS) {
    ctx.beginPath();
    ctx.moveTo(getX(ctx, landmarks[s].x), landmarks[s].y * ctx.canvas.height);
    ctx.lineTo(getX(ctx, landmarks[e].x), landmarks[e].y * ctx.canvas.height);
    ctx.stroke();
  }

  // Gesto Label
  if (gesture !== 'NONE') {
    ctx.font = '8px monospace'; ctx.fillStyle = '#fff';
    ctx.fillText(gesture, getX(ctx, landmarks[0].x), landmarks[0].y * ctx.canvas.height + 20);
  }
  ctx.restore();
}
