// Some extra utility to make Records with strongly typed keys (e.g enum member keys) simpler to work with in TS.
// Using maps instead of plain objects is another option, but maps require an extra step to convert to/from JSON
// So they should not be overused.

/** Easier semantic name for a partial record */
export type PartialRecord<K extends string, V> = Partial<Record<K, V>>;

/** Get values from a partial record with proper type */
export const getRecordValues = Object.values as <V>(record: PartialRecord<any, V>) => V[];

/** Get a keys array with proper type. Object.keys by default returns string[] */
export const getRecordKeys = Object.keys as <K extends string>(record: PartialRecord<K, any>) => K[];

/** Get an entries array with properly typed keys. Object.entries by default represents keys as string */
export const getRecordEntries = Object.entries as <K extends string, V>(record: PartialRecord<K, V>) => [K, V][];

/** Use this function only when entries is guaranteed to contain all members of K,
 * e.g. when it's an array from mapping the enum values, or the keys from a different full record.
 * If not all members of type K are used, use createPartialRecordFromEntries instead. */
export const createFullRecordFromEntries = Object.fromEntries as <K extends string, V>(
  entries: [K, V][],
) => Record<K, V>;

/** Create a correctly typed object from entries with strongly typed keys.
 * This is safe to use even if not all members of type K are present in the entries.
 * If all members of K are guaranteed to be present, see createFullRecordFromEntries. */
export const createPartialRecordFromEntries = Object.fromEntries as <K extends string, V>(
  entries: [K, V][],
) => PartialRecord<K, V>;

/** Create a correctly-typed full record keyed by an enum with values based on a value function
 * @param enumObj The enum object
 * @param valueFunction The function which will produce the value, taking in the key as a parameter */
export function createEnumKeyedRecord<K extends string, V>(
  enumObj: Record<string, K>,
  valueFunction: (key: K) => V,
): Record<K, V> {
  return createFullRecordFromEntries(Object.values(enumObj).map((member) => [member, valueFunction(member)]));
}
