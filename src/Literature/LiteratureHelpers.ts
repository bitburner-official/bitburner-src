import { dialogBoxCreate } from "../ui/React/DialogBox";
import { Literatures } from "./Literatures";
import { LiteratureName } from "./data/LiteratureNames";

export function showLiterature(fn: LiteratureName): void {
  const litObj = Literatures[fn];
  if (litObj == null) {
    return;
  }
  const txt = `<i>${litObj.title}</i><br><br>${litObj.text}`;
  dialogBoxCreate(txt, true);
}
