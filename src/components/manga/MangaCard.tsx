'use client';

import React, { useRef, useState, ViewTransition } from 'react';
import { ZeroGFloating, BalloonClick } from '@/components/ui/KineticCore';
import Link from 'next/link';
import { KagamiManga } from '@/types/manga';
import { Badge } from '@/components/ui/Badge';
import { BookOpen, ExternalLink, Calendar } from 'lucide-react';

interface MangaCardProps {
  manga: KagamiManga;
  namespace?: string;
}

export function MangaCard({ manga, namespace }: MangaCardProps) {
  const isSupplemental = manga.source === 'supplemental';
  const coverRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

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
      href={`/manga/${manga.id}${namespace ? `?from=${namespace}` : ''}`} 
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group block focus:outline-none font-sans"
    >
      <ZeroGFloating className="h-full">
        <div className="flex flex-col h-full space-y-1.5">
        {/* Cover Image Container with Magnetism & 3D tilt */}
        <div 
          ref={coverRef}
          className="relative aspect-[3/4] w-full bg-surface overflow-hidden border border-border-divider rounded-xl transition-all duration-300 group-hover:border-accent"
          style={{ willChange: 'transform' }}
        >
          {manga.cover ? (
            <ViewTransition name={namespace ? `cover-${namespace}-${manga.id}` : `cover-${manga.id}`}>
              <div className="relative w-full h-full">
                {!imageLoaded && (
                  <div className="absolute inset-0 shimmer-bg" />
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={manga.cover}
                  alt={manga.title}
                  onLoad={() => setImageLoaded(true)}
                  className={`object-cover w-full h-full transition-all duration-300 group-hover:scale-103 group-focus-visible:scale-103 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  loading="lazy"
                />
              </div>
            </ViewTransition>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-text-muted bg-surface font-sans text-[10px] font-bold tracking-widest">
              NO COVER ART
            </div>
          )}

          {/* Demographic Tag overlay */}
          {manga.demographic !== 'none' && (
            <div className="absolute top-2.5 left-2.5 z-10 hidden sm:block">
              <BalloonClick>
                <Badge variant="accent" className="bg-surface/95 border border-border-divider text-[7px] sm:text-[8px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider text-text-primary">
                  {manga.demographic}
                </Badge>
              </BalloonClick>
            </div>
          )}

          {/* Status Tag Overlay (Top Right) */}
          <div className="absolute top-2.5 right-2.5 z-10 hidden sm:block">
            <BalloonClick>
              {manga.status === 'completed' ? (
                <Badge variant="accent" className="bg-emerald-500/90 text-white border-none text-[7px] sm:text-[8px] font-bold px-1.5 sm:px-2.5 py-0.5 rounded-full tracking-wider uppercase">
                  Finished
                </Badge>
              ) : (
                <Badge variant="source" className="bg-border-divider text-text-primary border-none text-[7px] sm:text-[8px] font-bold px-1.5 sm:px-2.5 py-0.5 rounded-full tracking-wider uppercase">
                  Unfinished
                </Badge>
              )}
            </BalloonClick>
          </div>

          {/* Source Indicator overlay */}
          <div className="absolute bottom-2.5 right-2.5 z-10 hidden sm:block">
            <BalloonClick>
              {isSupplemental ? (
                <Badge variant="destructive" className="bg-red-500 text-white border-none text-[7px] sm:text-[8px] font-bold px-1.5 sm:px-2.5 py-0.5 rounded-full flex items-center gap-0.5 uppercase tracking-wider">
                  <ExternalLink className="w-2.5 h-2.5" /> EXT
                </Badge>
              ) : (
                <Badge variant="source" className="bg-surface/95 border border-border-divider text-text-primary text-[7px] sm:text-[8px] font-bold px-1.5 sm:px-2.5 py-0.5 rounded-full flex items-center gap-0.5 uppercase tracking-wider">
                  <BookOpen className="w-2.5 h-2.5 text-accent" /> MD
                </Badge>
              )}
            </BalloonClick>
          </div>
        </div>

        {/* Info Content - stacked cleanly underneath cover */}
        <div className="px-1 flex flex-col justify-between flex-1">
          <div className="space-y-0.5">
            {/* Title */}
            <h3 className="font-serif font-extrabold text-[10px] sm:text-xs md:text-[13px] leading-tight line-clamp-2 break-words group-hover:text-accent transition-colors tracking-tight text-text-primary">
              {manga.title}
            </h3>

            {/* Authors */}
            <p className="text-[8px] sm:text-[10px] font-mono text-text-muted truncate break-words">
              {manga.authors.join(', ')}
            </p>
          </div>

          <div className="mt-1.5 pt-1.5 border-t border-border-divider/60 hidden sm:flex items-center justify-between text-[8px] sm:text-[9px] text-text-muted font-bold tracking-wider uppercase">
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
