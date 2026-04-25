import { createStore } from 'zustand/vanilla';
import { VisionState, EmotionType } from '../types/vision';

export const visionStore = createStore<VisionState>((set) => ({
  isModelLoading: true,
  hands: [],
  emotion: 'NEUTRAL',
  faceBlendshapes: null,
  fps: 0,

  setModelLoading: (loading) => set({ isModelLoading: loading }),
  updateHands: (hands) => set({ hands }),
  updateEmotion: (emotion, blendshapes) => set({ emotion, faceBlendshapes: blendshapes }),
  setFPS: (fps) => set({ fps }),
}));

export const useVisionStore = visionStore;
