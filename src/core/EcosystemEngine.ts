import { Spirit, Plant, PlantNode, Synapse, EcosystemState } from '../types/ecosystem';
import { HandData, EmotionType, GestureType } from '../types/vision';
import { EmotionEngine } from './EmotionEngine';

export class EcosystemEngine {
  private static grow(node: PlantNode, angleVar: number, depth: number, canGrow: boolean): void {
    if (depth > 4) {
      node.isTerminal = true;
      if (!canGrow) node.blossom = Math.min(1, node.blossom + 0.05);
      return;
    }
    if (node.children.length === 0 && canGrow) {
      const a = node.angle + (Math.random() - 0.5) * 0.4 + angleVar;
      node.children.push({
        x: node.x + Math.cos(a) * node.length, y: node.y + Math.sin(a) * node.length,
        angle: a, length: node.length * 0.85, children: [], isTerminal: false, blossom: 0,
        phase: Math.random() * Math.PI * 2
      });
    } else {
      node.children.forEach(c => this.grow(c, angleVar, depth + 1, canGrow));
    }
  }

  static update(state: EcosystemState, hands: HandData[], emotion: EmotionType, globalG: GestureType): Partial<EcosystemState> {
    if (globalG === 'STASIS_X') return state;

    const { plants, spirits, synapses } = state;
    const emotionColor = EmotionEngine.getEmotionColor(emotion);
    const isSun = globalG === 'SUN_RAY';
    const isHealing = globalG === 'HEART';
    const newSpirits: Spirit[] = [];

    // 1. Lógica de Nodos (Magnetismo + Repulsión + Agarre)
    const nextSynapses = synapses.map((s, i) => {
      let nx = s.x + s.vx, ny = s.y + s.vy;
      let nvx = s.vx * 0.95, nvy = s.vy * 0.95;
      let grabbedBy = null;

      // Repulsión entre nodos
      synapses.forEach((other, j) => {
        if (i === j) return;
        const dx = s.x - other.x, dy = s.y - other.y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < 0.15) { nvx += dx * 0.005; nvy += dy * 0.005; }
      });

      hands.forEach((h, hIdx) => {
        const hPos = h.landmarks[0];
        const dist = Math.sqrt(Math.pow(s.x - hPos.x, 2) + Math.pow(s.y - hPos.y, 2));

        // Magnetismo suave
        if (dist < 0.25) { nvx -= (s.x - hPos.x) * 0.004; nvy -= (s.y - hPos.y) * 0.004; }

        // Agarre con ROOT_FIST
        if (h.gesture === 'ROOT_FIST' && dist < 0.12) {
          grabbedBy = hIdx; nx = hPos.x; ny = hPos.y; nvx = 0; nvy = 0;
        }
      });

      if (nx < 0 || nx > 1) nvx *= -1;
      if (ny < 0 || ny > 1) nvy *= -1;
      return { ...s, x: nx, y: ny, vx: nvx, vy: nvy, grabbedBy };
    });

    // 2. Lógica de Flora
    const nextPlants = plants.map(p => {
      const canGrow = p.age < p.maxAge;
      const angleVar = isSun ? (0.5 - p.rootX) * 0.4 : Math.sin(Date.now() / 800 + p.structure.phase) * 0.1;
      this.grow(p.structure, angleVar, 0, canGrow);
      if (p.age >= p.maxAge && p.age < p.maxAge + 2) {
        newSpirits.push({ id: Math.random().toString(36), x: p.rootX, y: p.rootY - 0.2, vx: 0, vy: 0, targetX: Math.random(), targetY: Math.random(), color: p.color, life: 1, flap: 0 });
      }
      return { ...p, age: isHealing ? Math.max(0, p.age - 5) : p.age + 2 };
    }).filter(p => p.age < p.maxAge + 1500);

    // 3. Lógica de Espíritus (Simbiosis)
    const nextSpirits = [...spirits, ...newSpirits].map(s => {
      let tx = s.targetX, ty = s.targetY;
      const grabbed = nextSynapses.find(n => n.grabbedBy !== null);
      if (grabbed) { tx = grabbed.x; ty = grabbed.y; }
      else if (hands.length > 0) { tx = hands[0].landmarks[0].x; ty = hands[0].landmarks[0].y; }
      return { ...s, x: s.x + (tx - s.x) * 0.04, y: s.y + (ty - s.y) * 0.04, color: emotion === 'NEUTRAL' ? s.color : emotionColor, life: s.life - 0.0015, flap: Math.sin(Date.now() / 120) };
    }).filter(s => s.life > 0);

    return { synapses: nextSynapses, plants: nextPlants, spirits: nextSpirits };
  }
}
