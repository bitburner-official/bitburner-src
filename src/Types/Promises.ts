// An object that contains a promise and its resolver (or possibly null)
export type PromisePair<ReturnType> = {
  promise: Promise<ReturnType> | null;
  resolve: ((value: ReturnType) => void) | null;
};
