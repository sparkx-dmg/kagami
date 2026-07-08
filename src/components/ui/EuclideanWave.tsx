'use client';

import React from 'react';

// No framer-motion on list items — CSS transitions are GPU-composited
// and don't block the main thread the way JS spring animations do.

export function EuclideanWaveContainer({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

interface EuclideanWaveItemProps {
  children: React.ReactNode;
  id: string;
  className?: string;
  style?: React.CSSProperties;
}

export function EuclideanWaveItem({ children, className, style, id }: EuclideanWaveItemProps) {
  return (
    <div
      className={className}
      style={style}
      // Simple CSS fade-in via Tailwind animate-fade-in (defined in globals.css)
      // No JS animation loop — zero main-thread cost
    >
      {children}
    </div>
  );
}
