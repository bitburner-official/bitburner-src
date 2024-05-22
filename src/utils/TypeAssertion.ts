import type { Unknownify } from "../types";
// This function is empty because Unknownify<T> is a typesafe assertion on any object with no runtime checks needed.
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function assertLoadingType<T extends object>(val: object): asserts val is Unknownify<T> {}
