import { Spirit, Plant, Synapse, PlantNode } from '../types/ecosystem';
import { EmotionType, GestureType } from '../types/vision';

const getX = (ctx: CanvasRenderingContext2D, x: number) => (1 - x) * ctx.canvas.width;

function drawMajesticFlower(ctx: CanvasRenderingContext2D, x: number, y: number, bloom: number, color: string) {
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha = bloom; ctx.shadowBlur = 25; ctx.shadowColor = color;
  for (let i = 0; i < 8; i++) {
    ctx.rotate(Math.PI / 4);
    ctx.beginPath(); ctx.fillStyle = color;
    ctx.ellipse(18 * bloom, 0, 18 * bloom, 6 * bloom, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.5; ctx.globalAlpha = 0.2;
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(30*bloom, 0); ctx.stroke();
  }
  ctx.fillStyle = "#fff"; ctx.globalAlpha = bloom;
  ctx.beginPath(); ctx.arc(0,0, 5 * bloom, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawNodeRecursive(ctx: CanvasRenderingContext2D, node: PlantNode, color: string, alpha: number) {
  if (!node || !node.children) return;
  node.children.forEach(c => {
    ctx.beginPath(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = 3;
    const x1 = getX(ctx, node.x), y1 = node.y * ctx.canvas.height;
    const x2 = getX(ctx, c.x), y2 = c.y * ctx.canvas.height;
    const sway = Math.sin(Date.now() / 900 + node.phase) * 6;
    ctx.moveTo(x1, y1); ctx.quadraticCurveTo(x1 + sway, (y1 + y2) / 2, x2, y2); ctx.stroke();
    drawNodeRecursive(ctx, c, color, alpha * 0.85);
  });
  if (node.isTerminal && node.blossom > 0) {
    drawMajesticFlower(ctx, getX(ctx, node.x), node.y * ctx.canvas.height, node.blossom, color);
  }
}

export function drawPlant(ctx: CanvasRenderingContext2D, p: Plant) {
  ctx.save();
  drawNodeRecursive(ctx, p.structure, p.color, 0.6);
  ctx.restore();
}

export function drawSynapse(ctx: CanvasRenderingContext2D, s: Synapse, all: Synapse[]) {
  const x = getX(ctx, s.x), y = s.y * ctx.canvas.height;
  const isGrabbed = s.grabbedBy !== null;
  const time = Date.now() / 1000;
  ctx.save();
  ctx.shadowBlur = isGrabbed ? 40 : 15; ctx.shadowColor = '#2ecc71';
  const grad = ctx.createRadialGradient(x,y,0,x,y,15);
  grad.addColorStop(0, '#fff'); grad.addColorStop(0.4, '#2ecc71'); grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.arc(x,y,15,0,Math.PI*2); ctx.fill();

  if (isGrabbed) {
    ctx.translate(x + (s.x > 0.5 ? -230 : 30), y - 60);
    ctx.fillStyle = 'rgba(2, 44, 34, 0.95)'; ctx.strokeStyle = '#2ecc7166'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(0,0,210,100,15); ctx.fill(); ctx.stroke();
    ctx.font = 'bold 12px monospace'; ctx.fillStyle = '#fef3c7'; ctx.fillText(s.title, 15, 30);
    ctx.font = '10px sans-serif'; ctx.fillStyle = '#fff';
    const lines = s.description.match(/.{1,35}/g) || [];
    lines.forEach((l, i) => ctx.fillText(l, 15, 50 + i*13));
  }
  ctx.restore();
}

export function drawEmpathyAura(ctx: CanvasRenderingContext2D, emotion: EmotionType, color: string, globalG: GestureType) {
  const w = ctx.canvas.width, h = ctx.canvas.height, time = Date.now() / 1500;
  ctx.save();
  const grad = ctx.createRadialGradient(w/2, h/2, w/5, w/2, h/2, w * 0.9);
  grad.addColorStop(0, 'transparent');
  grad.addColorStop(1, `${color}${globalG === 'STASIS_X' ? '66' : '33'}`);
  ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);

  for(let i=0; i<12; i++) {
    const px = (Math.sin(time + i*1.5)*0.4 + 0.5)*w, py = (Math.cos(time*0.8 + i*2.1)*0.4 + 0.5)*h;
    ctx.globalAlpha = 0.2; ctx.fillStyle = "#fff"; ctx.shadowBlur = 10; ctx.shadowColor = "#fff";
    ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = "#fff1"; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(w/2, h/2); ctx.stroke();
  }
  ctx.restore();
}

export function drawSpirit(ctx: CanvasRenderingContext2D, s: Spirit) {
  const x = getX(ctx, s.x), y = s.y * ctx.canvas.height;
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(s.vy, -s.vx));
  ctx.globalAlpha = s.life; const grad = ctx.createRadialGradient(0,0,0,0,0,20);
  grad.addColorStop(0, '#fff'); grad.addColorStop(0.3, s.color); grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(0,0,20,0,Math.PI*2); ctx.fill();
  ctx.restore();
}
