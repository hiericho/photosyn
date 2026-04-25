import { createStore } from 'zustand/vanilla';
import { EcosystemState, Synapse } from '../types/ecosystem';

const PROJECT_MANIFEST = [
  { 
    title: "NEURAL_CORTEX", 
    description: "Dual-model AI inference for real-time symbiotic face and hand tracking.", 
    tech: ["MediaPipe", "WASM", "Dual-Inference"] 
  },
  { 
    title: "BIO_SENSORY", 
    description: "High-frequency computer vision optimized for micro-expression capture.", 
    tech: ["Canvas API", "60 FPS", "Low-Latency"] 
  },
  { 
    title: "ECO_STIMULI", 
    description: "Procedural physics engine simulating fractal growth and emotional inertia.", 
    tech: ["Zustand", "Fractal Math", "Mitosis"] 
  }
];

export const ecosystemStore = createStore<EcosystemState>((set) => ({
  spores: [],
  plants: [],
  spirits: [],
  synapses: PROJECT_MANIFEST.map((d: any, i: number) => ({
    id: `syn-${i}`, x: 0.2 + i * 0.3, y: 0.45, vx: (Math.random()-0.5)*0.001, vy: (Math.random()-0.5)*0.001,
    grabbedBy: null, title: d.title, description: d.description, tech: d.tech
  })),
  singularity: null,
  
  updateEcosystem: (fn: (state: EcosystemState) => Partial<EcosystemState>) => set((state: EcosystemState) => fn(state)),

  addPlant: (x: number, y: number) => set((state: EcosystemState) => ({
    plants: [{
      id: Math.random().toString(36), rootX: x, rootY: y, age: 0, maxAge: 110 + Math.random()*70,
      color: ['#2ecc71', '#a2fca2', '#16a085', '#00f3ff'][Math.floor(Math.random()*4)],
      type: 'FLOWER', growthSpeed: 2.5, flexibility: 0.5,
      structure: { x, y, angle: -Math.PI/2, length: 0.05, children: [], isTerminal: false, blossom: 0, phase: Math.random()*100 }
    }, ...state.plants].slice(0, 12)
  })),

  addSpirit: (x: number, y: number, color: string) => set((state: EcosystemState) => ({
    spirits: [{ id: Math.random().toString(36), x, y, vx: 0, vy: 0, targetX: Math.random(), targetY: Math.random(), color, life: 1, flap: 0 }, ...state.spirits].slice(0, 20)
  })),
  addSynapse: (d: any) => {}
}));

export const useEcosystemStore = ecosystemStore;
