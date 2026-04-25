export class CameraManager {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;

  async initialize(videoElement: HTMLVideoElement): Promise<MediaStream> {
    this.videoElement = videoElement;
    
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
          frameRate: { ideal: 60 }
        },
        audio: false
      });

      this.videoElement.srcObject = this.stream;
      
      return new Promise((resolve) => {
        if (!this.videoElement) return;
        this.videoElement.onloadedmetadata = () => {
          this.videoElement?.play();
          resolve(this.stream!);
        };
      });
    } catch (error) {
      console.error('Error initializing camera:', error);
      throw error;
    }
  }

  stop() {
    this.stream?.getTracks().forEach(track => track.stop());
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }
}
