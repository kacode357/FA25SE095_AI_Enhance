// utils/user/display-name.ts

export function getUserShortName(fullName?: string | null): string {
  if (!fullName) return "UK";

  const parts = fullName
    .split(" ")
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length === 0) return "UK";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "UK";

  const first = parts[0][0] ?? "";
  const last = parts[parts.length - 1][0] ?? "";

  const result = `${first}${last}`.toUpperCase();
  return result || "UK";
}
