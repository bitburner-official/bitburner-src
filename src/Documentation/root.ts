import Root from "./doc/index.md?raw";
import { AllPages } from "./pages";

export type Document = typeof Root;

export const getPage = (title: string): Document => AllPages[title] ?? Root;
