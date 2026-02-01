import React, { useEffect, useRef } from 'react';
import { Particle } from '../types';

interface FloatingHeartsProps {
  intensity: number;
}

export const FloatingHearts: React.FC<FloatingHeartsProps> = ({ intensity }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<(Particle & { type: 'heart' | 'sparkle' | 'bokeh' })[]>([]);
  const requestRef = useRef<number | undefined>(undefined);

  const createParticle = (width: number, height: number): (Particle & { type: 'heart' | 'sparkle' | 'bokeh' }) => {
    const typeRoll = Math.random();
    let type: 'heart' | 'sparkle' | 'bokeh' = 'heart';
    if (typeRoll > 0.8) type = 'bokeh';
    else if (typeRoll > 0.6) type = 'sparkle';

    return {
      id: Math.random(),
      x: Math.random() * width,
      y: height + 50,
      size: type === 'bokeh' ? Math.random() * 40 + 20 : (type === 'heart' ? Math.random() * 15 + 5 : Math.random() * 3 + 1),
      speedX: (Math.random() - 0.5) * (type === 'bokeh' ? 0.5 : 2),
      speedY: - (Math.random() * 2 + 0.5) * (intensity / 70),
      opacity: type === 'bokeh' ? Math.random() * 0.1 + 0.05 : Math.random() * 0.6 + 0.2,
      rotation: Math.random() * 360,
      type
    };
  };

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

  const drawSparkle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'white';
    ctx.fill();
    ctx.restore();
  };

  const drawBokeh = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
    grad.addColorStop(0, `rgba(255, 77, 109, ${opacity})`);
    grad.addColorStop(1, 'rgba(255, 77, 109, 0)');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  };

  const animate = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const spawnRate = 0.05 + (intensity / 400);
    if (particles.current.length < 150 && Math.random() < spawnRate) {
      particles.current.push(createParticle(canvas.width, canvas.height));
    }

    particles.current.forEach((p, index) => {
      p.x += p.speedX;
      p.y += p.speedY;
      
      // Horizontal drift
      p.x += Math.sin(time / 1000 + p.id) * 0.5;

      if (p.type === 'heart') drawHeart(ctx, p.x, p.y, p.size, p.opacity);
      else if (p.type === 'bokeh') drawBokeh(ctx, p.x, p.y, p.size, p.opacity);
      else drawSparkle(ctx, p.x, p.y, p.size, p.opacity);

      p.opacity -= 0.0005;

      if (p.y < -100 || p.opacity <= 0) {
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