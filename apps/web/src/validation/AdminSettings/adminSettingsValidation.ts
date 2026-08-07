export function validateSettingsName(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 'Name is required.';
  if (trimmed.length < 2) return 'Name must be at least 2 characters.';
  if (trimmed.length > 120) return 'Name must be 120 characters or less.';
  return null;
}

export function validateSettingsEmail(value: string) {
  if (!value.trim()) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? null : 'Enter a valid email.';
}

export function validateSettingsCurrency(value: string) {
  return /^[A-Z]{3}$/.test(value.trim()) ? null : 'Use a 3-letter code like USD.';
}

export function validateSettingsTimezone(value: string) {
  return value.trim().length >= 2 ? null : 'Timezone is required.';
}

export function validateManualPaymentKey(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 'Key is required.';
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed)) return 'Use lowercase words separated by dashes.';
  return null;
}

export function validateManualPaymentLabel(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 'Name is required.';
  if (trimmed.length < 2) return 'Name must be at least 2 characters.';
  if (trimmed.length > 80) return 'Name must be 80 characters or less.';
  return null;
}

export function validateManualPaymentInstructions(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 'Instructions are required.';
  if (trimmed.length < 5) return 'Instructions must be clearer.';
  if (trimmed.length > 1000) return 'Instructions must be shorter.';
  return null;
}
