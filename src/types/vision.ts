export type EmotionType = 'NEUTRAL' | 'HAPPY' | 'SAD' | 'ANGRY' | 'SURPRISED';
export type GestureType = 'NONE' | 'POINTING' | 'OPEN_PALM' | 'CLOSED_FIST' | 'PINCH';

export interface Landmark { x: number; y: number; z: number; }

export interface HandData {
  landmarks: Landmark[];
  handedness: 'Left' | 'Right';
  gesture: GestureType;
}

export interface VisionState {
  isModelLoading: boolean;
  hands: HandData[];
  emotion: EmotionType;
  faceBlendshapes: any;
  fps: number;
  updateHands: (hands: HandData[]) => void;
  updateEmotion: (emotion: EmotionType, blendshapes: any) => void;
  setModelLoading: (loading: boolean) => void;
  setFPS: (fps: number) => void;
}
