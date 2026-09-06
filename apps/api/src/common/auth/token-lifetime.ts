const durationPattern = /^(\d+)(ms|s|m|h|d)$/;

export const defaultAccessTokenTtl = '15m';
export const defaultRefreshTokenTtl = '30d';

export function durationToMs(value: string) {
  const match = durationPattern.exec(value.trim());
  if (!match) {
    throw new Error(`Unsupported duration "${value}". Use ms, s, m, h, or d, for example 15m or 30d.`);
  }

  const amount = Number(match[1]);
  const unit = match[2];
  const multipliers = {
    ms: 1,
    s: 1_000,
    m: 60_000,
    h: 60 * 60_000,
    d: 24 * 60 * 60_000
  } as const;

  return amount * multipliers[unit as keyof typeof multipliers];
}

export function durationToSeconds(value: string) {
  return Math.floor(durationToMs(value) / 1_000);
}
