'use client';

import Lenis from 'lenis';
import { useEffect } from 'react';

export function LenisProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      anchors: true
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  return children;
}
