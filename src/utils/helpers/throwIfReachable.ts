export function throwIfReachable(missingCase: never) {
  throw new Error(`The case of ${missingCase} was not handled.`);
}
