const pluralRules = new Intl.PluralRules("en-US");

export function pluralize(count: number, singular: string, plural?: string, skipCountInReturnedValue = false): string {
  const pluralRule = pluralRules.select(count);
  if (pluralRule === "one") {
    return `${!skipCountInReturnedValue ? `${count} ` : ""}${singular}`;
  }
  return `${!skipCountInReturnedValue ? `${count} ` : ""}${plural !== undefined ? plural : `${singular}s`}`;
}
