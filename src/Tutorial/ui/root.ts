import { Player } from "@nsdefs";
import index from "!!raw-loader!./doc/index.md";
import notfound from "!!raw-loader!./doc/mechanics/servers.md";
import { registerPages } from "./pages";

export interface DocumentationPage {
  condition?: (p: Player) => boolean;
  content: typeof index;
}

export const Root = {
  content: index,
};

const notFound = {
  content: notfound,
};

const pages: Map<string, DocumentationPage> = new Map();

export const registerPage = (title: string, page: typeof index, condition?: (p: Player) => boolean) => {
  pages.set(title, { content: page, condition: condition });
  console.log(pages);
};

export const getPage = (title: string): DocumentationPage => pages.get(title) ?? notFound;

registerPages();
