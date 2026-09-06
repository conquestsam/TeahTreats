export const teahTreatsTokens = {
  color: {
    obsidian: '#080808',
    black: '#111111',
    charcoal: '#171717',
    surface: '#1D1D1D',
    surfaceRaised: '#252525',
    crimson: '#9B1B30',
    crimsonBright: '#C81E3A',
    crimsonDeep: '#6B0F1F',
    gold: '#B8933E',
    goldLight: '#D4AF37',
    cream: '#FAF7F2',
    creamMuted: 'rgba(250, 247, 242, 0.64)',
    creamDim: 'rgba(250, 247, 242, 0.42)',
    border: 'rgba(184, 147, 62, 0.16)'
  },
  font: {
    display: 'DM Serif Display, Georgia, serif',
    editorial: 'Playfair Display, Georgia, serif',
    sans: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 22
  },
  shadow: {
    card: '0 18px 56px rgba(0, 0, 0, 0.34)',
    glowGold: '0 0 42px rgba(184, 147, 62, 0.16)',
    glowCrimson: '0 0 38px rgba(155, 27, 48, 0.2)'
  },
  shell: {
    footerHeight: 56,
    headerHeight: 72,
    sidebarWidth: 280
  }
} as const;

export type TeahTreatsTokens = typeof teahTreatsTokens;
