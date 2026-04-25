import { Component, onMount, onCleanup, createSignal } from 'solid-js';
import { HandLandmarker, FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { CameraManager } from '../core/CameraManager';
import { useVisionStore } from '../store/useVisionStore';
import { useEcosystemStore } from '../store/useEcosystemStore';
import { drawHand } from '../utils/drawUtils';
import { drawSpirit, drawPlant, drawEmpathyAura, drawSynapse } from '../utils/drawEcosystem';
import { GestureEngine } from '../core/GestureEngine';
import { EmotionEngine } from '../core/EmotionEngine';
import { EcosystemEngine } from '../core/EcosystemEngine';
import { EmotionType, GestureType } from '../types/vision';

const DigitalMirror: Component = () => {
  let videoRef!: HTMLVideoElement;
  let canvasRef!: HTMLCanvasElement;
  let handLandmarker: HandLandmarker | null = null;
  let faceLandmarker: FaceLandmarker | null = null;
  const cameraManager = new CameraManager();
  
  const [isModelLoading, setIsModelLoading] = createSignal(true);
  const [currentEmo, setCurrentEmo] = createSignal<EmotionType>('NEUTRAL');
  const [activePower, setActivePower] = createSignal<GestureType>('NONE');
  const [counts, setCounts] = createSignal({ spirits: 0, plants: 0 });

  let isPinching = false;

  const processLoop = async () => {
    if (videoRef && videoRef.readyState >= 2 && handLandmarker && faceLandmarker) {
      const time = performance.now();
      try {
        const hRes = handLandmarker.detectForVideo(videoRef, time);
        const fRes = faceLandmarker.detectForVideo(videoRef, time);

        const hands = hRes.landmarks.map((l, i) => {
          const gesture = GestureEngine.detectGesture(l);
          if (gesture === 'BLOOM_PINCH') {
            if (!isPinching) {
              useEcosystemStore.getState().addPlant(l[8].x, l[8].y);
              isPinching = true;
            }
          } else if (i === 0) isPinching = false;
          return { landmarks: l, handedness: hRes.handednesses[i][0].displayName as any, gesture };
        });

        useVisionStore.getState().updateHands(hands);

        if (fRes.faceBlendshapes && fRes.faceBlendshapes.length > 0) {
          const emo = EmotionEngine.detect(fRes.faceBlendshapes);
          useVisionStore.getState().updateEmotion(emo, fRes.faceBlendshapes);
          setCurrentEmo(emo);
        }

        const globalG = GestureEngine.detectComplexGestures(hands);
        setActivePower(globalG);

        useEcosystemStore.getState().updateEcosystem(state => 
          EcosystemEngine.update(state, hands, useVisionStore.getState().emotion, globalG) as any
        );

      } catch (e) {}
    }
    requestAnimationFrame(processLoop);
  };

  const drawLoop = () => {
    const ctx = canvasRef.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
    const { emotion, hands } = useVisionStore.getState();
    const eco = useEcosystemStore.getState();

    drawEmpathyAura(ctx, emotion, EmotionEngine.getEmotionColor(emotion), activePower());
    eco.synapses.forEach(s => drawSynapse(ctx, s, eco.synapses));
    eco.plants.forEach(p => drawPlant(ctx, p));
    eco.spirits.forEach(s => drawSpirit(ctx, s));
    hands.forEach(h => drawHand(ctx, h));

    requestAnimationFrame(drawLoop);
  };

  onMount(async () => {
    useEcosystemStore.subscribe(s => setCounts({ spirits: s.spirits.length, plants: s.plants.length }));
    try {
      const fileset = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm");
      handLandmarker = await HandLandmarker.createFromOptions(fileset, { baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task", delegate: "CPU" }, runningMode: "VIDEO", numHands: 2 });
      faceLandmarker = await FaceLandmarker.createFromOptions(fileset, { baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task", delegate: "CPU" }, runningMode: "VIDEO", outputFaceBlendshapes: true });
      setIsModelLoading(false);
      await cameraManager.initialize(videoRef);
      canvasRef.width = videoRef.videoWidth; canvasRef.height = videoRef.videoHeight;
      processLoop(); drawLoop();
    } catch (err) {}
  });

  onCleanup(() => {
    cameraManager.stop(); handLandmarker?.close(); faceLandmarker?.close();
  });

  return (
    <div class="relative w-full h-full bg-[#050505] overflow-hidden bio-texture">
      <video ref={videoRef} class="absolute inset-0 w-full h-full object-cover scale-x-[-1] opacity-25 grayscale brightness-125" autoplay playsinline muted />
      <canvas ref={canvasRef} class="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none" />
      
      {/* HUD OVERLAY - Top Z-index */}
      <div class="absolute inset-0 z-50 pointer-events-none p-12 flex flex-col justify-between">
        
        {/* Top Header */}
        <div class="flex justify-between items-start">
          <div class="flex flex-col">
            <h1 class="text-5xl font-extralight tracking-[0.6em] text-[#fef3c7] uppercase opacity-90 drop-shadow-[0_0_15px_rgba(254,243,199,0.5)]">Photosyn</h1>
            <div class="mt-1 h-[1px] w-full bg-gradient-to-r from-[#2ecc71] to-transparent" />
            <p class="mt-2 text-[10px] font-mono text-[#2ecc71] uppercase tracking-[0.5em] animate-pulse">
              {activePower() !== 'NONE' ? `System_Power: ${activePower()}` : 'Neural_Simbiosis_v9'}
            </p>
          </div>
          
          <div class="flex items-center gap-4 leaf-panel px-6 py-3">
             <div class={`w-2 h-2 rounded-full ${isModelLoading() ? 'bg-yellow-400 animate-ping' : 'bg-[#2ecc71] shadow-[0_0_10px_#2ecc71]'}`} />
             <span class="text-[9px] font-mono uppercase tracking-[0.2em] text-white">Neural_Link_Ok</span>
          </div>
        </div>

        {/* Side Monitor */}
        <div class="flex flex-col gap-6 w-48">
          <div class="leaf-panel p-6 space-y-4 border-l-4 border-l-[#2ecc71]">
             <div class="flex flex-col">
               <p class="text-[8px] uppercase opacity-40 text-white tracking-widest mb-1">Human Emotion</p>
               <span class="text-lg font-bold text-[#fef3c7] uppercase tracking-tighter">{currentEmo()}</span>
             </div>
             <div class="h-[1px] w-full bg-white/5" />
             <div class="space-y-4">
                <div class="flex justify-between items-end">
                   <p class="text-[8px] uppercase opacity-40 text-white tracking-widest">Ethereals</p>
                   <span class="text-xl font-mono text-white leading-none">{counts().spirits}</span>
                </div>
                <div class="flex justify-between items-end">
                   <p class="text-[8px] uppercase opacity-40 text-white tracking-widest">Botanical</p>
                   <span class="text-xl font-mono text-[#2ecc71] leading-none">{counts().plants}</span>
                </div>
             </div>
          </div>
          
          {/* EKG Graph Placeholder */}
          <div class="leaf-panel p-4 h-16 flex items-end justify-between gap-1 opacity-60">
             <div class="w-1 bg-[#2ecc71] h-1/2 animate-[bounce_1s_infinite]" />
             <div class="w-1 bg-[#2ecc71] h-full animate-[bounce_0.8s_infinite]" />
             <div class="w-1 bg-[#2ecc71] h-2/3 animate-[bounce_1.2s_infinite]" />
             <div class="w-1 bg-[#2ecc71] h-1/3 animate-[bounce_0.6s_infinite]" />
             <div class="w-1 bg-[#2ecc71] h-3/4 animate-[bounce_1.1s_infinite]" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default DigitalMirror;
