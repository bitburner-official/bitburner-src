import { Literatures } from "./Literatures";
import { dialogBoxCreate } from "../ui/React/DialogBox";
import { LiteratureName } from "../data/HiddenEnums";

export function showLiterature(filename: LiteratureName): void {
  const litObj = Literatures[filename];
  if (litObj == null) {
    return;
  }
  const txt = `<i>${litObj.title}</i><br><br>${litObj.text}`;
  dialogBoxCreate(txt, true);
}
