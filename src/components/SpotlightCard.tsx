"use client";

import { useState, useRef, ReactNode } from "react";

export default function SpotlightCard({ 
  children, 
  className = "" 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden rounded-[24px] ${className}`}
    >
      {/* The Spotlight Glow */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-0"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.15), transparent 40%)`,
        }}
      />
      {/* Content Wrapper */}
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
}