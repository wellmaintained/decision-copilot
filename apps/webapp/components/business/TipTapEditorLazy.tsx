'use client'

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface TipTapEditorProps {
  content: string
  onChange: (content: string) => void
  className?: string
  minimal?: boolean
}

// Lazy load the TipTap editor to reduce initial bundle size
const LazyTipTapEditor = React.lazy(() => 
  import('./tiptap-editor').then(module => ({ default: module.TipTapEditor }))
);

export function TipTapEditorLazy(props: TipTapEditorProps) {
  return (
    <React.Suspense 
      fallback={
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      }
    >
      <LazyTipTapEditor {...props} />
    </React.Suspense>
  );
}