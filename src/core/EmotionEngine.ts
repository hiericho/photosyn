import { EmotionType } from '../types/vision';

export class EmotionEngine {
  static detect(blendshapes: any[]): EmotionType {
    if (!blendshapes || blendshapes.length === 0) return 'NEUTRAL';

    const shapes = blendshapes[0].categories;
    const find = (name: string) => {
      return shapes.find((s: any) => s.categoryName.toLowerCase().includes(name.toLowerCase()))?.score || 0;
    };

    const smile = (find('mouthSmileLeft') + find('mouthSmileRight')) / 2;
    const surprise = find('jawOpen');
    const anger = (find('browDownLeft') + find('browDownRight')) / 2;
    
    // TRISTEZA REFORZADA: Boca hacia abajo + Cejas internas hacia arriba
    const mouthFrown = (find('mouthFrownLeft') + find('mouthFrownRight')) / 2;
    const browInnerUp = find('browInnerUp');
    const sadScore = (mouthFrown * 0.6) + (browInnerUp * 0.4);

    // Prioridades de detección
    if (smile > 0.3) return 'HAPPY';
    if (anger > 0.4) return 'ANGRY';
    if (surprise > 0.5) return 'SURPRISED';
    if (sadScore > 0.15) return 'SAD'; // Umbral más sensible para tristeza

    return 'NEUTRAL';
  }

  static getEmotionColor(emotion: EmotionType): string {
    switch (emotion) {
      case 'HAPPY': return '#fef3c7'; // Oro
      case 'SAD': return '#3b82f6';   // Azul Profundo
      case 'ANGRY': return '#f87171'; // Rojo Carmesí
      case 'SURPRISED': return '#c084fc'; // Violeta
      default: return '#2ecc71';      // Verde Bio
    }
  }
}
