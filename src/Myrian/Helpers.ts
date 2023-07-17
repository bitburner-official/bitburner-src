import { Reviver } from "../utils/JSONReviver";
import { Myrian } from "./Myrian";

export let myrian = new Myrian();

export function loadMyrian(saveString: string): void {
  if (saveString) {
    myrian = JSON.parse(saveString, Reviver);
  } else {
    myrian = new Myrian();
  }
}
