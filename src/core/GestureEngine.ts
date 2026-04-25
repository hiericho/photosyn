import { Landmark, GestureType, HandData } from '../types/vision';

export class GestureEngine {
  private static PINCH_THRESHOLD = 0.05;
  private static lastHandsDist = 0;

  static calculateDistance(p1: Landmark, p2: Landmark): number {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  }

  static detectGesture(landmarks: Landmark[]): GestureType {
    const palm = landmarks[0];
    const thumb = landmarks[4];
    const index = landmarks[8];
    const mid = landmarks[12];
    const ring = landmarks[16];
    const pinky = landmarks[20];

    // 1. PINCH (Bloom)
    if (this.calculateDistance(thumb, index) < this.PINCH_THRESHOLD) return 'BLOOM_PINCH';

    // 2. FIST (Root/Grab)
    const fingers = [8, 12, 16, 20].map(i => this.calculateDistance(landmarks[i], palm));
    if (fingers.every(d => d < 0.18)) return 'ROOT_FIST';

    // 3. POINTING (Sun)
    if (this.calculateDistance(index, palm) > 0.35 && 
        [12, 16, 20].every(i => this.calculateDistance(landmarks[i], palm) < 0.2)) return 'POINTING';

    // 4. OPEN_PALM
    if (fingers.every(d => d > 0.35)) return 'OPEN_PALM';

    return 'NONE';
  }

  static detectComplexGestures(hands: HandData[]): GestureType {
    if (hands.length < 2) return 'NONE';
    const h1 = hands[0].landmarks[0];
    const h2 = hands[1].landmarks[0];
    const dist = this.calculateDistance(h1, h2);

    // HEART (Bio-Healing)
    const tDist = this.calculateDistance(hands[0].landmarks[4], hands[1].landmarks[4]);
    const iDist = this.calculateDistance(hands[0].landmarks[8], hands[1].landmarks[8]);
    if (tDist < 0.08 && iDist < 0.08) return 'HEART';

    // STASIS_X (Cruzar manos)
    const crossed = (hands[0].handedness === 'Left' && h1.x < h2.x) || (hands[0].handedness === 'Right' && h1.x > h2.x);
    if (dist < 0.18 && crossed) return 'STASIS_X';

    // SUN_RAY (Palmas arriba juntas)
    const h1Up = hands[0].landmarks[12].y < h1.y;
    const h2Up = hands[1].landmarks[12].y < h2.y;
    if (dist < 0.25 && h1Up && h2Up && hands[0].gesture === 'OPEN_PALM') return 'SUN_RAY';

    return 'NONE';
  }
}
