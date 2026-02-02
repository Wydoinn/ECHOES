import React, { useEffect, useRef } from 'react';

const ParticleVortex: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: {
      angle: number;
      radius: number;
      speed: number;
      size: number;
      color: string;
    }[] = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      const particleCount = 400;
      const maxRadius = Math.max(canvas.width, canvas.height) * 0.8;

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          angle: Math.random() * Math.PI * 2,
          radius: Math.random() * maxRadius,
          speed: 0.002 + Math.random() * 0.005,
          size: Math.random() * 2.5,
          color: Math.random() > 0.5 ? 'rgba(139, 92, 246,' : 'rgba(255, 107, 157,', // Purple or Pink base
        });
      }
    };

    const drawParticles = () => {
      // Create a trailing effect
      ctx.fillStyle = 'rgba(13, 6, 23, 0.2)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      particles.forEach((p) => {
        // Update position
        p.angle += p.speed;
        p.radius -= 0.5; // Move inwards

        // Reset if reached center
        if (p.radius <= 0) {
           p.radius = Math.max(canvas.width, canvas.height) * 0.8;
           p.angle = Math.random() * Math.PI * 2;
        }

        const x = centerX + Math.cos(p.angle) * p.radius;
        const y = centerY + Math.sin(p.angle) * p.radius;
        
        // Calculate dynamic opacity based on radius (fade out at center)
        const opacity = Math.min(1, p.radius / 200);

        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${opacity})`;
        ctx.fill();

        // Optional: Draw subtle connections between close particles could go here, 
        // but might be expensive for 400 particles. Keeping it clean for performance.
      });
    };

    const animate = () => {
      drawParticles();
      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    createParticles();
    animate();

    window.addEventListener('resize', () => {
      resizeCanvas();
      particles = [];
      createParticles();
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
    />
  );
};

export default ParticleVortex;