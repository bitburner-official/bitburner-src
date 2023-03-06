// The object properties on these numeric types are for typechecking only and do not exist at runtime. They're just a way to require a typechecking function.
export type Integer = number & { __Integer: true };
export type PositiveNumber = number & { __Positive: true };
export type PositiveInteger = Integer & PositiveNumber;

// Numeric typechecking functions
export const isInteger = (n: unknown): n is Integer => Number.isInteger(n);
export const isPositiveInteger = (n: unknown): n is PositiveInteger => isInteger(n) && n > 0;

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
