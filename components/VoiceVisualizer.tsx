
import React, { useEffect, useRef } from 'react';

interface VoiceVisualizerProps {
  stream: MediaStream;
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ stream }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    if (!stream || !canvasRef.current) return;

    // Setup Audio Context
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- webkit prefix for Safari compatibility
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = audioCtx;

    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
    sourceRef.current = source;

    // Canvas Setup
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId: number;

    // Set canvas size once and on resize, not every frame
    const setCanvasSize = () => {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    const render = () => {
      if (!ctx || !analyser || !canvas) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Organic Blob / Waveform
      ctx.beginPath();
      const radius = Math.min(width, height) / 4;

      // Draw circular waveform
      for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i] ?? 0;
        const percent = value / 255;
        const angle = (i / bufferLength) * Math.PI * 2;

        // Mirror the circle for smoothness
        const r = radius + (percent * radius * 0.8);
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            // Smooth curves
            // Simple lineTo for now, could be quadraticCurveTo for smoother
            ctx.lineTo(x, y);
        }
      }

      // Close path to create shape
      ctx.closePath();

      // Style
      const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.5, centerX, centerY, radius * 1.5);
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.8)'); // Purple
      gradient.addColorStop(0.5, 'rgba(236, 72, 153, 0.6)'); // Pink
      gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

      ctx.fillStyle = gradient;
      ctx.fill();

      // Glow
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#d946ef';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', setCanvasSize);
      if (sourceRef.current) sourceRef.current.disconnect();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [stream]);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
      <canvas ref={canvasRef} aria-hidden="true" className="w-full h-full max-w-[600px] max-h-[600px]" />
    </div>
  );
};

export default VoiceVisualizer;
