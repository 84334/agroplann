import { useEffect, useRef } from "react";

const EMOJIS = ["🌿", "🍃", "🌱", "🌾", "🍂", "🌻", "🌽", "🍅", "🥬", "🥜"];

interface Particle {
  x: number;
  y: number;
  emoji: string;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

export default function FloatingParticles({ count = 18 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const w = () => canvas.offsetWidth;
    const h = () => canvas.offsetHeight;

    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * w(),
      y: Math.random() * h(),
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      size: 14 + Math.random() * 18,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: 0.2 + Math.random() * 0.6,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      opacity: 0.15 + Math.random() * 0.25,
    }));

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, w(), h());
      for (const p of particlesRef.current) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;
        if (p.y > h() + 30) { p.y = -30; p.x = Math.random() * w(); }
        if (p.x < -30) p.x = w() + 30;
        if (p.x > w() + 30) p.x = -30;

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.font = `${p.size}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
