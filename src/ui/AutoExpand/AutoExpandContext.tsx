import { createContext } from "react";
import { assertObject } from "../../utils/TypeAssertion";

export type AutoExpandDataType = Record<string, boolean | undefined>;

export type AutoExpandContextValueType = {
  data: AutoExpandDataType;
  set: (key: string, expanded: boolean) => void;
};

export const AutoExpandContext = createContext<AutoExpandContextValueType>({
  data: {},
  set: () => {
    throw new Error("Unimplemented function");
  },
});

const localStorageKey = "AutoExpandData";

export function getAutoExpandData(): AutoExpandDataType {
  const storedDataString = localStorage.getItem(localStorageKey);
  if (storedDataString == null) {
    return {};
  }
  let storedAutoExpandData: unknown;
  try {
    storedAutoExpandData = JSON.parse(storedDataString);
    assertObject(storedAutoExpandData);
    for (const [key, value] of Object.entries(storedAutoExpandData)) {
      if (typeof key !== "string" || typeof value !== "boolean") {
        throw new Error(`Invalid autoExpandData. Stored data string: ${storedDataString}`);
      }
    }
  } catch (error) {
    console.error(error);
    localStorage.removeItem(localStorageKey);
    return {};
  }
  return storedAutoExpandData as AutoExpandDataType;
}

export function setAutoExpandData(data: AutoExpandDataType): void {
  localStorage.setItem(localStorageKey, JSON.stringify(data));
}
