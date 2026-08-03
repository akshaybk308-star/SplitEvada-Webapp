"use client";

import React, { useEffect, useRef } from "react";

interface AsciiRainProps {
  fontSize?: number;
  color?: string;
  speed?: number;
  density?: number;
  opacity?: number;
  characters?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function AsciiRain({
  fontSize = 14,
  color = "#a855f7",
  speed = 1,
  density = 1,
  opacity = 0.25,
  characters = "0123456789ABCDEF$%#@!*&SULTISPLITEVADA",
  className = "",
  style,
}: AsciiRainProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const cols = Math.floor((canvas.width / fontSize) * density);
    const drops: number[] = Array.from({ length: cols }, () => Math.random() * -100);

    const charArray = characters.split("");

    const render = () => {
      ctx.fillStyle = "rgba(7, 7, 26, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = color;
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = charArray[Math.floor(Math.random() * charArray.length)];
        const x = i * (fontSize / density);
        const y = drops[i] * fontSize;

        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i] += speed * 0.5;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [fontSize, color, speed, density, characters]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ opacity, ...style }}
    />
  );
}
