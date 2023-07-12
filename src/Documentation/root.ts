import index from "!!raw-loader!./markdown/index.md";
import { AllPages } from "./pages";

export type Document = typeof index;

export const Root = {
  content: index,
};

export const getPage = (title: string): Document => AllPages[title] ?? Root;
