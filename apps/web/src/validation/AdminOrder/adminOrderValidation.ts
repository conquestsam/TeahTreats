export function validateCancelReason(reason: string) {
  if (reason.trim().length < 3) {
    return 'Add a short reason.';
  }
  if (reason.trim().length > 500) {
    return 'Keep the reason under 500 characters.';
  }
  return null;
}
