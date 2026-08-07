export function validateTenantName(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 'Tenant name is required.';
  if (trimmed.length < 2) return 'Use at least 2 characters.';
  if (trimmed.length > 120) return 'Use 120 characters or fewer.';
  return null;
}

export function validateTenantSlug(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 'Tenant slug is required.';
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed)) {
    return 'Use lowercase letters, numbers, and dashes.';
  }
  return null;
}

export function validateTenantEmail(value: string) {
  if (!value.trim()) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Enter a valid email.';
  return null;
}

export function validateTenantCurrency(value: string) {
  if (!/^[A-Z]{3}$/.test(value.trim())) return 'Use a 3-letter currency code.';
  return null;
}

export function validateDeactivateReason(value: string) {
  if (value.trim().length < 3) return 'Reason is required.';
  return null;
}
