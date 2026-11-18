// The object properties on these numeric types are for typechecking only and do not exist at runtime. They're just a way to require a typechecking function.
export type Integer = number & { __Integer: true };
export type SafeInteger = Integer & { __isSafe: true };
export type PositiveNumber = number & { __Positive: true };
export type NonNegativeNumber = number & { __NonNegative: true };
export type PositiveInteger = Integer & PositiveNumber;
export type NonNegativeInteger = Integer & NonNegativeNumber;
export type PositiveSafeInteger = PositiveInteger & SafeInteger;

// Numeric typechecking functions - these should be moved somewhere else
export const isNumber = (n: unknown): n is number => !Number.isNaN(Number(n));
export const isInteger = (n: unknown): n is Integer => Number.isInteger(n);
export const isSafeInteger = (n: unknown): n is SafeInteger => Number.isSafeInteger(n);
export const isPositiveInteger = (n: unknown): n is PositiveInteger => isInteger(n) && n > 0;
export const isNonNegativeInteger = (n: unknown): n is NonNegativeInteger => isInteger(n) && n >= 0;
export const isPositiveNumber = (n: unknown): n is PositiveNumber => isNumber(n) && n > 0;
export const isPositiveSafeInteger = (n: unknown): n is PositiveSafeInteger => isSafeInteger(n) && isPositiveInteger(n);
/** Utility type for typechecking objects. Makes all keys optional and sets values to unknown,
 * making it safe to assert a shape for the variable once it's known to be a non-null object */
export type Unknownify<T> = {
  [key in keyof T]: unknown;
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
 * It is up to the implementer to ensure max > min. */
export interface IMinMaxRange {
  /** Value by which the bounds are to be divided for the final range */
  divisor?: number;

  /** The maximum bound of the range. */
  max: number;

  /** The minimum bound of the range. */
  min: number;
}

// Type of save data. The base64 format is string, the binary format is Uint8Array.
export type SaveData = string | Uint8Array<ArrayBuffer>;

/**
 * Extracts the properties whose types are not functions.
 *
 * ```ts
 * class InternalFoo {
 *   id = 0;
 *   name = "name";
 *   count = 0;
 *   increase() { ++this.count; }
 * }
 * type InternalFooDataShape = DataShape<InternalFoo>;
 * ```
 * `InternalFooDataShape` is `{ id: number; name: string; count: number; }`.
 */
type DataShape<T> = {
  [K in keyof T as T[K] extends (...args: any[]) => any ? never : K]: T[K];
};

/**
 * Checks whether two types are equal.
 *
 * Suppose we have an internal class `InternalFoo` and want to ensure its data shape matches a public interface
 * `PublicFoo`. We can use {@link DataShape} to extract the properties whose types are not functions of `InternalFoo`:
 *
 * ```ts
 * type InternalFooDataShape = DataShape<InternalFoo>;
 *
 * interface PublicFoo {
 *   id: number;
 *   name: string;
 *   count: number;
 * }
 * ```
 *
 * If we add another property to `InternalFoo`, such as `description = ""`, but forget to add `description: string` to
 * `PublicFoo`, the following `IsFooConsistent` type evaluates to `false`:
 *
 * ```ts
 * type AssertTrue<T extends true> = T;
 * type IsFooConsistent = Equal<InternalFooDataShape, PublicFoo>;
 * type CheckFoo = AssertTrue<IsFooConsistent>;
 * ```
 *
 * `CheckFoo` produces a typecheck error because `IsFooConsistent` evaluates to `false`.
 */
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

/**
 * Normalizes a type by resolving intersections into a mapped object type.
 *
 * When comparing the data shape of an internal type with a public type using {@link Equal}, this is necessary if the
 * public type is an intersection.
 *
 * ```ts
 * interface PublicEntity {
 *   id: number;
 * }
 * type PublicFoo = PublicEntity & {
 *   name: string;
 *   count: number;
 * };
 * type WithoutPrettify = Equal<InternalFooDataShape, PublicFoo>;
 * type WithPrettify = Equal<InternalFooDataShape, Prettify<PublicFoo>>;
 * ```
 * `WithoutPrettify` evaluates to `false`, and `WithPrettify` evaluates to `true`.
 */
type Prettify<T> = {
  [K in keyof T]: T[K];
  // eslint-disable-next-line @typescript-eslint/ban-types
} & {};

/**
 * Ensures there are no type mismatches between internal types and public NS types.
 *
 * Instead of writing this typecheck code:
 * ```ts
 * type AssertTrue<T extends true> = T;
 * type CheckFoo = AssertTrue<Equal<DataShape<InternalFoo>, Prettify<PublicFoo>>>;
 * ```
 * We can write:
 * ```ts
 * type CheckFoo = AssertDataShape<InternalFoo, PublicFoo>;
 * ```
 */
export type AssertDataShape<
  Internal,
  Public extends Equal<DataShape<Internal>, Prettify<Public>> extends true ? unknown : never,
> = true;
