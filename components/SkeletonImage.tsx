'use client';
import { useState } from 'react';
import Image from 'next/image';

// Fills its (relatively positioned) parent and shows the shimmer skeleton until the image has loaded.
export default function SkeletonImage({ src, alt, sizes, priority }: { src: string; alt: string; sizes?: string; priority?: boolean }) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const loaded = loadedSrc === src;
  return (
    <>
      {!loaded && <div className="hr-skeleton" style={{ position: 'absolute', inset: 0 }} />}
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} onLoad={() => setLoadedSrc(src)}
        style={{ objectFit: 'cover', opacity: loaded ? 1 : 0, transition: 'opacity 0.5s ease' }} />
    </>
  );
}
