'use client';

import React, { useRef } from 'react';

interface ViewportContainProps {
  children: React.ReactNode;
  className?: string;
  placeholderHeight?: string; // e.g. "400px"
}

export function ViewportContain({ children, className, placeholderHeight = "360px" }: ViewportContainProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      ref={containerRef} 
      className={className} 
      style={{ 
        contentVisibility: 'auto',
        containIntrinsicSize: `auto ${placeholderHeight}`,
      }}
    >
      {children}
    </div>
  );
}
