export enum AccessCodeType {
  Numeric = 1,        // 123456
  AlphaNumeric = 2,   // ABC123
  Words = 3,          // happy-cat-123
  Custom = 4,         // lecturer-defined
}

export const ACCESS_CODE_TYPE_MAP: Record<string, AccessCodeType> = {
  numeric: AccessCodeType.Numeric,
  alphanumeric: AccessCodeType.AlphaNumeric,
  words: AccessCodeType.Words,
  custom: AccessCodeType.Custom,
};

/** Chuẩn hoá string từ BE -> enum (dùng mọi nơi) */
export function mapAccessCodeType(type: string): AccessCodeType | null {
  if (!type) return null;
  const key = type.trim().toLowerCase();
  return ACCESS_CODE_TYPE_MAP[key] ?? null;
}

/** Convert enum -> key BE mong muốn khi cần gửi ngược */
export function accessCodeTypeToString(type: AccessCodeType): string {
  switch (type) {
    case AccessCodeType.Numeric:
      return "numeric";
    case AccessCodeType.AlphaNumeric:
      return "alphanumeric";
    case AccessCodeType.Words:
      return "words";
    case AccessCodeType.Custom:
      return "custom";
    default:
      return "";
  }
}
