'use client';

import { motion, useMotionValue, useSpring } from 'motion/react';
import { useEffect, useState } from 'react';

export function TeahTreatsCursor() {
  const cursorX = useMotionValue(-200);
  const cursorY = useMotionValue(-200);
  const springX = useSpring(cursorX, { damping: 26, stiffness: 280, mass: 0.5 });
  const springY = useSpring(cursorY, { damping: 26, stiffness: 280, mass: 0.5 });
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState('');
  const [isPointer, setIsPointer] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [isDown, setIsDown] = useState(false);

  useEffect(() => {
    const canUseCursor =
      window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setEnabled(canUseCursor);
    if (!canUseCursor) {
      return;
    }

    const move = (event: MouseEvent) => {
      cursorX.set(event.clientX);
      cursorY.set(event.clientY);
      const element = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
      const clickable = element?.closest('button, a, [role="button"], input, select, textarea, [data-cursor]');
      setIsPointer(Boolean(clickable));
      setLabel(element?.closest('[data-cursor]')?.getAttribute('data-cursor') ?? '');
    };
    const down = () => setIsDown(true);
    const up = () => setIsDown(false);
    const leave = () => setHidden(true);
    const enter = () => setHidden(false);

    window.addEventListener('mousemove', move);
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);
    window.addEventListener('mouseleave', leave);
    window.addEventListener('mouseenter', enter);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('mouseleave', leave);
      window.removeEventListener('mouseenter', enter);
    };
  }, [cursorX, cursorY]);

  if (!enabled) {
    return null;
  }

  const ringSize = isDown ? 28 : label ? 88 : isPointer ? 48 : 36;
  const dotSize = isDown || label ? 4 : 8;

  return (
    <>
      <motion.div
        className="fixed left-0 top-0 z-[9998] hidden items-center justify-center lg:flex"
        style={{ pointerEvents: 'none', x: springX, y: springY, translateX: '-50%', translateY: '-50%' }}
        animate={{ opacity: hidden ? 0 : 1 }}
      >
        <motion.div
          className="flex items-center justify-center rounded-full"
          animate={{
            width: ringSize,
            height: ringSize,
            borderColor: label ? '#D4AF37' : isPointer ? '#9B1B30' : 'rgba(184,147,62,0.62)'
          }}
          transition={{ type: 'spring', damping: 20, stiffness: 250 }}
          style={{ pointerEvents: 'none', border: '1px solid rgba(184,147,62,0.62)' }}
        >
          {label ? <span className="tt-cursor-label">{label}</span> : null}
        </motion.div>
      </motion.div>
      <motion.div
        className="fixed left-0 top-0 z-[9999] hidden rounded-full bg-[#B8933E] lg:block"
        style={{ pointerEvents: 'none', x: cursorX, y: cursorY, translateX: '-50%', translateY: '-50%' }}
        animate={{ width: dotSize, height: dotSize, opacity: hidden ? 0 : 1 }}
      />
    </>
  );
}
