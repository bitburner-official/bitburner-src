import { Player } from "@nsdefs";
import md from "!!raw-loader!./root.md";
import notfound from "!!raw-loader!./notfound.md";
import { registerPages } from "../pages/pages";

export interface DocumentationPage {
  condition?: (p: Player) => boolean;
  content: typeof md;
}

export const Root = {
  content: md,
};

const notFound = {
  content: notfound,
};

const pages: Map<string, DocumentationPage> = new Map();

export const registerPage = (title: string, page: typeof md, condition?: (p: Player) => boolean) => {
  pages.set(title, { content: page, condition: condition });
  console.log(pages);
};

export const getPage = (title: string): DocumentationPage => pages.get(title) ?? notFound;

registerPages();
