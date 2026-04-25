export type EmotionType = 'NEUTRAL' | 'HAPPY' | 'SAD' | 'ANGRY' | 'SURPRISED';

export interface Landmark { x: number; y: number; z: number; }

export interface HandData {
  landmarks: Landmark[];
  handedness: 'Left' | 'Right';
  gesture: any;
}

export interface VisionState {
  isModelLoading: boolean;
  hands: HandData[];
  emotion: EmotionType;
  faceBlendshapes: any;
  updateHands: (hands: HandData[]) => void;
  updateEmotion: (emotion: EmotionType, blendshapes: any) => void;
  setModelLoading: (loading: boolean) => void;
}
