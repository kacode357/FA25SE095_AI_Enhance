export function validateEmail(email: string): string | undefined {
  const v = (email ?? "").trim();
  if (!v) return undefined; // don't show error on empty input (use required attribute for emptiness)

  // Basic email regex — suitable for most use cases (not full RFC)
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(v) ? undefined : "Please enter a valid email address";
}

export function isValidEmail(email: string): boolean {
  const v = (email ?? "").trim();
  if (!v) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(v);
}
