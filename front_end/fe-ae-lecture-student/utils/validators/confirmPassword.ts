export function validateConfirmPassword(password: string, confirm: string): string | undefined {
  // Don't show an error if the user hasn't typed anything into confirm yet
  if (!confirm) return undefined;

  return password !== confirm ? "Passwords do not match" : undefined;
}

export function passwordsMatch(password: string, confirm: string): boolean {
  return password === confirm && confirm !== "";
}
