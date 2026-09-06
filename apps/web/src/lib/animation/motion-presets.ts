export const motionDurations = {
  fast: 0.16,
  base: 0.24,
  page: 0.34,
  slow: 0.5
} as const;

export const motionEasings = {
  standard: [0.22, 1, 0.36, 1],
  emphasized: [0.16, 1, 0.3, 1]
} as const;

export const pageFadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: motionDurations.page, ease: motionEasings.standard }
};

export const stateCardReveal = {
  initial: { opacity: 0, y: 14, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: motionDurations.page, ease: motionEasings.emphasized }
};

export const softPulse = {
  animate: {
    scale: [1, 1.06, 1],
    opacity: [0.72, 1, 0.72]
  },
  transition: {
    duration: 1.8,
    repeat: Infinity,
    ease: 'easeInOut'
  }
};
