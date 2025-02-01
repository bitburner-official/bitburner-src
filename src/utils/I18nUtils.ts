const pluralRules = new Intl.PluralRules("en-US");

export function pluralize(count: number, singular: string, plural?: string, skipCountInReturnedValue = false): string {
  const countText = !skipCountInReturnedValue ? `${count} ` : "";
  const pluralRule = pluralRules.select(count);
  if (pluralRule === "one") {
    return countText + singular;
  }
  return countText + (plural !== undefined ? plural : `${singular}s`);
}
