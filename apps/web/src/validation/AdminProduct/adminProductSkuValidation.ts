export function validateAdminProductSkuName(value: string) {
  return value.trim().length < 2 || value.trim().length > 120
    ? 'Use 2 to 120 characters.'
    : null;
}

export function validateAdminProductSkuPrice(value: number) {
  return value < 1 ? 'Price must be greater than 0.' : null;
}
