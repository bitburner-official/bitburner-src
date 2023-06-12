import { Literatures } from "./Literatures";
import { dialogBoxCreate } from "../ui/React/DialogBox";
import { LiteratureName } from "@enums";

export function showLiterature(fn: LiteratureName): void {
  const litObj = Literatures[fn];
  if (litObj == null) {
    return;
  }
  const txt = `<i>${litObj.title}</i><br><br>${litObj.text}`;
  dialogBoxCreate(txt, true);
}
