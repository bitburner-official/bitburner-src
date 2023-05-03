/** A wrapper for Object.prototype.hasOwnProperty to avoid calling it from objects directly (lint rule). */
export function hasOwnProp<T extends object>(obj: T, prop: string): prop is keyof T & string {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
