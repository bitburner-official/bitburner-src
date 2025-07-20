import { AllPages } from "./pages";
import { EventEmitter } from "../utils/EventEmitter";

export const getPage = (title: string): string => {
  const lang = new Intl.Locale(navigator.language).language;
  const fallbackLang = "en"; // For untranslated languages
  let pageContent = null;
  if (!title.startsWith("nsDoc")) {
    pageContent = AllPages[lang + "/" + title];
    if (pageContent == null) {
      pageContent = AllPages[fallbackLang + "/" + title];
    }
  }
  if (pageContent == null) {
    pageContent = AllPages[title];
  }
  if (pageContent == null) {
    const errorMessage = `Cannot find ${title} page.`;
    console.error(errorMessage);
    return errorMessage;
  }
  return pageContent;
};

export const DocumentationPopUpEvents = new EventEmitter<[string | undefined]>();

export function openDocumentationPopUp(path: string): void {
  DocumentationPopUpEvents.emit(path);
}
