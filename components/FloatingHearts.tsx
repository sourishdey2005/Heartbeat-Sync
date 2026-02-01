
import React, { useEffect, useRef } from 'react';
import { Particle } from '../types';

interface FloatingHeartsProps {
  intensity: number;
}

export const FloatingHearts: React.FC<FloatingHeartsProps> = ({ intensity }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  // Fix: Initial value provided for useRef to resolve TypeScript "Expected 1 arguments, but got 0" error
  const requestRef = useRef<number | undefined>(undefined);

  const createParticle = (width: number, height: number): Particle => ({
    id: Math.random(),
    x: Math.random() * width,
    y: height + 20,
    size: Math.random() * 15 + 5,
    speedX: (Math.random() - 0.5) * 1.5,
    speedY: - (Math.random() * 2 + 1) * (intensity / 60),
    opacity: Math.random() * 0.5 + 0.2,
    rotation: Math.random() * 360
  });

  const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    const d = size;
    ctx.moveTo(0, d / 4);
    ctx.quadraticCurveTo(0, 0, d / 4, 0);
    ctx.quadraticCurveTo(d / 2, 0, d / 2, d / 4);
    ctx.quadraticCurveTo(d / 2, 0, (3 * d) / 4, 0);
    ctx.quadraticCurveTo(d, 0, d, d / 4);
    ctx.quadraticCurveTo(d, d / 2, d / 2, (3 * d) / 4);
    ctx.quadraticCurveTo(0, d / 2, 0, d / 4);
    ctx.fillStyle = `rgba(255, 77, 109, ${opacity})`;
    ctx.fill();
    ctx.restore();
  };

  const animate = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Spawn more particles based on intensity
    if (particles.current.length < intensity && Math.random() < 0.1) {
      particles.current.push(createParticle(canvas.width, canvas.height));
    }

    particles.current.forEach((p, index) => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.opacity -= 0.001;

      drawHeart(ctx, p.x, p.y, p.size, p.opacity);

      if (p.y < -50 || p.opacity <= 0) {
        particles.current.splice(index, 1);
      }
    });

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [intensity]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-10"
    />
  );
};
