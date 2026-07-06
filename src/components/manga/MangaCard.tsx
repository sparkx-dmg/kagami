'use client';

import React, { useRef, ViewTransition } from 'react';
import { ZeroGFloating, BalloonClick } from '@/components/ui/KineticCore';
import Link from 'next/link';
import { KagamiManga } from '@/types/manga';
import { Badge } from '@/components/ui/Badge';
import { BookOpen, ExternalLink, Calendar } from 'lucide-react';

interface MangaCardProps {
  manga: KagamiManga;
}

export function MangaCard({ manga }: MangaCardProps) {
  const isSupplemental = manga.source === 'supplemental';
  const coverRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    rectRef.current = e.currentTarget.getBoundingClientRect();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!coverRef.current) return;
    if (!rectRef.current) {
      rectRef.current = e.currentTarget.getBoundingClientRect();
    }
    const rect = rectRef.current;
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    const rotateX = -(y / rect.height) * 8;
    const rotateY = (x / rect.width) * 8;
    const translateX = (x / rect.width) * 10;
    const translateY = (y / rect.height) * 10;
    
    coverRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateX(${translateX}px) translateY(${translateY}px) scale(1.03)`;
    coverRef.current.style.transition = 'transform 0.05s ease-out, border-color 0.3s ease-out';
  };

  const handleMouseLeave = () => {
    rectRef.current = null;
    if (!coverRef.current) return;
    coverRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale(1)';
    coverRef.current.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.3s ease-out';
  };

  return (
    <Link 
      href={`/manga/${manga.id}`} 
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group block focus:outline-none font-sans"
    >
      <ZeroGFloating className="h-full">
        <div className="flex flex-col h-full space-y-3">
        {/* Cover Image Container with Magnetism & 3D tilt */}
        <div 
          ref={coverRef}
          className="relative aspect-[3/4] w-full bg-surface overflow-hidden border border-border-divider rounded-xl transition-all duration-300 group-hover:border-accent"
          style={{ willChange: 'transform' }}
        >
          {manga.cover ? (
            <ViewTransition name={`cover-${manga.id}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={manga.cover}
                alt={manga.title}
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-103 group-focus-visible:scale-103"
                loading="lazy"
              />
            </ViewTransition>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-text-muted bg-surface font-sans text-[10px] font-bold tracking-widest">
              NO COVER ART
            </div>
          )}

          {/* Demographic Tag overlay */}
          {manga.demographic !== 'none' && (
            <div className="absolute top-2.5 left-2.5 z-10">
              <BalloonClick>
                <Badge variant="accent" className="bg-surface/95 border border-border-divider text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider text-text-primary">
                  {manga.demographic}
                </Badge>
              </BalloonClick>
            </div>
          )}

          {/* Status Tag Overlay (Top Right) */}
          <div className="absolute top-2.5 right-2.5 z-10">
            <BalloonClick>
              {manga.status === 'completed' ? (
                <Badge variant="accent" className="bg-emerald-500/90 text-white border-none text-[8px] font-bold px-2.5 py-0.5 rounded-full tracking-wider uppercase">
                  Finished
                </Badge>
              ) : (
                <Badge variant="source" className="bg-border-divider text-text-primary border-none text-[8px] font-bold px-2.5 py-0.5 rounded-full tracking-wider uppercase">
                  Unfinished
                </Badge>
              )}
            </BalloonClick>
          </div>

          {/* Source Indicator overlay */}
          <div className="absolute bottom-2.5 right-2.5 z-10">
            <BalloonClick>
              {isSupplemental ? (
                <Badge variant="destructive" className="bg-red-500 text-white border-none text-[8px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-0.5 uppercase tracking-wider">
                  <ExternalLink className="w-2.5 h-2.5" /> EXT
                </Badge>
              ) : (
                <Badge variant="source" className="bg-surface/95 border border-border-divider text-text-primary text-[8px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-0.5 uppercase tracking-wider">
                  <BookOpen className="w-2.5 h-2.5 text-accent" /> MD
                </Badge>
              )}
            </BalloonClick>
          </div>
        </div>

        {/* Info Content - stacked cleanly underneath cover */}
        <div className="px-1 flex flex-col justify-between flex-1">
          <div className="space-y-1">
            {/* Title */}
            <h3 className="font-serif font-extrabold text-[13px] leading-snug line-clamp-2 group-hover:text-accent transition-colors tracking-tight text-text-primary">
              {manga.title}
            </h3>

            {/* Authors */}
            <p className="text-[10px] font-mono text-text-muted truncate">
              {manga.authors.join(', ')}
            </p>
          </div>

          <div className="mt-2 pt-2 border-t border-border-divider/60 flex items-center justify-between text-[9px] text-text-muted font-bold tracking-wider uppercase">
            <span>{manga.status}</span>
            {manga.year && (
              <span className="flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5" />
                {manga.year}
              </span>
            )}
          </div>
        </div>
      </div>
      </ZeroGFloating>
    </Link>
  );
}
