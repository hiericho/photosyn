export interface PlantNode {
  x: number; y: number; angle: number; length: number; children: PlantNode[];
  isTerminal: boolean; blossom: number; phase: number;
}

export interface Plant {
  id: string; rootX: number; rootY: number; age: number; maxAge: number;
  structure: PlantNode; color: string; 
  type: 'FERN' | 'MOSS' | 'FLOWER'; // Variedad restaurada
  growthSpeed: number;
}

export interface Spirit {
  id: string; x: number; y: number; vx: number; vy: number; targetX: number; targetY: number; color: string; life: number; flap: number;
}

export interface Synapse {
  id: string; x: number; y: number; vx: number; vy: number; grabbedBy: number | null;
  title: string; description: string; tech: string[];
}

export interface EcosystemState {
  spores: any[];
  plants: Plant[];
  spirits: Spirit[];
  synapses: Synapse[];
  singularity: any;
  updateEcosystem: (fn: (state: EcosystemState) => Partial<EcosystemState>) => void;
  addPlant: (x: number, y: number, color?: string) => void;
  addSpirit: (x: number, y: number, color: string) => void;
  addSynapse: (d: any) => void;
}
