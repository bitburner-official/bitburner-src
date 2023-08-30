export function findEnumMember<T extends Record<string, string>>(obj: T, value: string): T[keyof T] | undefined {
  const lowerValue = value.toLowerCase().replace(/ /g, "");
  for (const member of Object.values(obj) as T[keyof T][]) {
    if (lowerValue.includes(member.toLowerCase().replace(/ /g, ""))) return member;
  }
}
