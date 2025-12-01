// utils/validators/phone.ts
/**
 * Phone validator helper for 10-digit numbers.
 * - `validatePhone` returns an error message when a non-empty value isn't a valid 10-digit phone number.
 * - `isValidPhone` returns boolean validity.
 */
export function validatePhone(phone: string): string | undefined {
  const v = (phone ?? "").trim();
  if (!v) return undefined; // don't force presence here; use required attribute if needed

  // Normalize by removing spaces, dashes and parentheses
  const digits = v.replace(/[^0-9]/g, "");
  const re = /^\d{10}$/;
  return re.test(digits) ? undefined : "Phone number must be 10 digits";
}

export function isValidPhone(phone: string): boolean {
  const v = (phone ?? "").trim();
  if (!v) return false;
  const digits = v.replace(/[^0-9]/g, "");
  return /^\d{10}$/.test(digits);
}
