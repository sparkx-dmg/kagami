'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export function MangaCardSkeleton() {
  return (
    <Card className="p-0 overflow-hidden border border-border-divider h-full flex flex-col">
      {/* Cover Skeleton */}
      <div className="relative aspect-[3/4] w-full">
        <Skeleton className="w-full h-full" />
      </div>

      {/* Info Content Skeleton */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Title */}
          <Skeleton className="h-3.5 w-4/5" />
          {/* Alt Title */}
          <Skeleton className="h-2.5 w-1/2" />
          {/* Author */}
          <Skeleton className="h-3 w-2/3 mt-2" />
        </div>

        {/* Footer */}
        <div className="mt-4 pt-2 border-t border-border-divider/50 flex justify-between">
          <Skeleton className="h-2.5 w-1/4" />
          <Skeleton className="h-2.5 w-1/6" />
        </div>
      </div>
    </Card>
  );
}
