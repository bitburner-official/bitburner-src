// The object properties on these numeric types are for typechecking only and do not exist at runtime. They're just a way to require a typechecking function.
export type Integer = number & { __Integer: true };
export type SafeInteger = Integer & { __isSafe: true };
export type PositiveNumber = number & { __Positive: true };
export type PositiveInteger = Integer & PositiveNumber;
export type PositiveSafeInteger = PositiveInteger & SafeInteger;

// Numeric typechecking functions - these should be moved somewhere else
export const isNumber = (n: unknown): n is number => !Number.isNaN(Number(n));
export const isInteger = (n: unknown): n is Integer => Number.isInteger(n);
export const isSafeInteger = (n: unknown): n is SafeInteger => Number.isSafeInteger(n);
export const isPositiveInteger = (n: unknown): n is PositiveInteger => isInteger(n) && n > 0;
export const isPositiveNumber = (n: unknown): n is PositiveNumber => isNumber(n) && n > 0;
export const isPositiveSafeInteger = (n: unknown): n is PositiveSafeInteger => isSafeInteger(n) && isPositiveInteger(n);
/** Utility type for typechecking objects. Makes all keys optional and sets values to unknown,
 * making it safe to assert a shape for the variable once it's known to be a non-null object */
export type Unknownify<T> = {
  [key in keyof T]?: unknown;
};

/** Get the member type of either an array or an object */
export type Member<T> = T extends (infer arrayMember)[] ? arrayMember : T[keyof T];

//** Get the keys of an object where the values match a given type */
export type TypedKeys<Obj, T> = { [K in keyof Obj]-?: Obj[K] extends T ? K : never }[keyof Obj];

/** Status object for functions that return a boolean indicating success/failure
 * and an optional message */
export interface IReturnStatus {
  res: boolean;
  msg?: string;
}

/** Defines the minimum and maximum values for a range.
 * It is up to the consumer if these values are inclusive or exclusive.
 * It is up to the implementor to ensure max > min. */
export interface IMinMaxRange {
  /** Value by which the bounds are to be divided for the final range */
  divisor?: number;

  /** The maximum bound of the range. */
  max: number;

  /** The minimum bound of the range. */
  min: number;
}

// Type of save data. The base64 format is string, the binary format is Uint8Array.
export type SaveData = string | Uint8Array;
