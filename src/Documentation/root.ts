import { AllPages } from "./pages";
import { EventEmitter } from "../utils/EventEmitter";

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

export const DocumentationPopUpEvents = new EventEmitter<[string | undefined]>();

export function openDocumentationPopUp(path: string): void {
  DocumentationPopUpEvents.emit(path);
}
