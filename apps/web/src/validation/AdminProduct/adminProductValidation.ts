export function validateAdminProductName(value: string) {
  return value.trim().length < 2 || value.trim().length > 120
    ? 'Use 2 to 120 characters.'
    : null;
}

export function validateAdminProductSlug(value: string) {
  return value && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
    ? 'Use lowercase words separated by hyphens.'
    : null;
}
