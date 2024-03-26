import { Uri, editor } from "monaco-editor";

//This file is separate from the ui/utils because some imports in there broke testing

export function getModel(hostname: string, filename: string) {
  return editor?.getModel(
    Uri.from({
      scheme: "file",
      path: `${hostname}/${filename}`,
    }),
  );
}

export function makeModel(hostname: string, filename: string, code: string) {
  const uri = Uri.from({
    scheme: "file",
    path: `${hostname}/${filename}`,
  });
  const language = filename.endsWith(".txt") ? "plaintext" : "javascript";
  //if somehow a model already exist return it
  return editor.getModel(uri) ?? editor.createModel(code, language, uri);
}
