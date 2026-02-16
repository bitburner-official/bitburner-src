import { AllPages } from "./pages";
import { EventEmitter } from "../utils/EventEmitter";
import MathNotationOutput from "./data/MathNotationOutput.json";

export const resolvePage = (title: string): { pageName: string | null; pageContent: string } => {
  const lang = new Intl.Locale(navigator.language).language;
  const fallbackLang = "en"; // For untranslated languages
  let pageContent = null;
  let pageName = null;
  if (!title.startsWith("nsDoc")) {
    pageName = lang + "/" + title;
    pageContent = AllPages[pageName];
    if (pageContent == null) {
      pageName = fallbackLang + "/" + title;
      pageContent = AllPages[pageName];
    }
  }
  if (pageContent == null) {
    pageName = title;
    pageContent = AllPages[title];
  }
  if (pageContent == null) {
    const errorMessage = `Cannot find ${title} page.`;
    console.error(errorMessage);
    return { pageName: null, pageContent: errorMessage };
  }
  return { pageName, pageContent };
};

export const getPage = (title: string): string => {
  return resolvePage(title).pageContent;
};

export const DocumentationPopUpEvents = new EventEmitter<[string]>();

export function openDocumentationPopUp(path: string): void {
  DocumentationPopUpEvents.emit(path);
}

export function convertMathNotation(value: string): string {
  // MathNotationOutput is imported as json data, so we need to typecast here to access the value via string index
  // easier without fighting with the TS compiler.
  const output = (MathNotationOutput as Record<string, string>)[value];
  if (output == null) {
    throw new Error(`Unknown math notation: ${value}`);
  }
  return output;
}
