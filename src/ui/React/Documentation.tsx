import React, { useContext, useState } from "react";
import { type FilePath, asFilePath, resolveFilePath } from "../../Paths/FilePath";
import { CONSTANTS } from "../../Constants";
import { resolvePage } from "../../Documentation/root";

interface Navigator {
  navigate: (s: string, external: boolean) => void;
}

export const Navigator = React.createContext<Navigator>({ navigate: () => undefined });

export const useNavigator = (): Navigator => useContext(Navigator);

export const windowTopPositionOfPages = new Map<FilePath, number>();

interface History {
  pages: FilePath[];
  page: FilePath;
  push(p: FilePath): void;
  pop(): void;
  home(): void;
}

export const defaultPage = asFilePath("index.md");
export const defaultNsApiPage = asFilePath("nsDoc/bitburner.ns.md");
/**
 * If we move or rename "bitburner.ns.md", we must update this constant, "defaultNsApiPage", "openDocExternally", and
 * the URL in src/Documentation/doc/en/index.md.
 */
export const relativeUrlOfNsApiPage = "../../../../markdown/bitburner.ns.md";

const prefixOfRelativeUrlOfNSDoc = "../../../../markdown/bitburner.";

const HistoryContext = React.createContext<History>({
  page: defaultPage,
  pages: [],
  push: () => undefined,
  pop: () => undefined,
  home: () => undefined,
});

export const Provider = HistoryContext.Provider;
export const useHistory = (): History => useContext(HistoryContext);

const onPush = (h: History, p: FilePath): History => {
  return {
    ...h,
    page: p,
    pages: [...h.pages, h.page],
  };
};

const onPop = (h: History): History => {
  const page = h.pages.pop() ?? defaultPage;
  return {
    ...h,
    page: page,
  };
};

const onHome = (h: History): History => {
  return {
    ...h,
    page: defaultPage,
    pages: [],
  };
};

export const HistoryProvider = (props: React.PropsWithChildren<object>): React.ReactElement => {
  const [history, setHistory] = useState<History>({
    page: defaultPage,
    pages: [],
    push(p: FilePath) {
      setHistory((h) => {
        windowTopPositionOfPages.set(h.page, window.scrollY);
        return onPush(h, p);
      });
    },
    pop() {
      setHistory((h) => {
        windowTopPositionOfPages.set(h.page, window.scrollY);
        return onPop(h);
      });
    },
    home() {
      setHistory((h) => {
        windowTopPositionOfPages.set(h.page, window.scrollY);
        return onHome(h);
      });
    },
  });
  return <Provider value={history}>{props.children}</Provider>;
};

export function openDocExternally(path: string): void {
  const ver = CONSTANTS.isDevBranch ? "dev" : "stable";
  let url;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    url = path;
  } else {
    const title = resolvePage(path).pageName;
    if (title == null) {
      return; // An error was already printed to console
    }
    url = `https://github.com/bitburner-official/bitburner-src/blob/${ver}/`;
    if (title.startsWith("nsDoc/")) {
      url += `markdown/${title.replace("nsDoc/", "")}`;
    } else {
      url += `src/Documentation/doc/${title}`;
    }
  }
  window.open(url, "_newtab");
}

/**
 * Href can be:
 * - Relative URL from non-NS docs pointing to markdown folder: Open "../../../../markdown/bitburner.ns.md" from "index.md"
 * - Relative URL from NS docs to other NS docs (e.g., click the links in NS docs viewer): Open "./bitburner.ns.cloud.md" from "nsDoc/bitburner.ns.md"
 * - Internal NS docs (e.g., choose a dropdown option in DocumentationAutocomplete): nsDoc/bitburner.ns.md
 * - Internal non-NS docs: help/getting_started.md
 * - HTTP URL
 */
export function convertNavigatorHref(
  href: string,
  currentPage: FilePath,
): { path: FilePath | null; forceOpenExternally: false } | { path: string; forceOpenExternally: true } {
  let path;
  if (href.includes(prefixOfRelativeUrlOfNSDoc)) {
    // Relative URL from non-NS docs pointing to markdown folder
    path = asFilePath(
      // Convert "../../../../markdown/bitburner.foo.md" and "deeper" URLs (i.e., having more "../") to "nsDoc/bitburner.foo.md"
      href.replace(
        href.substring(0, href.indexOf(prefixOfRelativeUrlOfNSDoc) + prefixOfRelativeUrlOfNSDoc.length),
        "nsDoc/bitburner.",
      ),
    );
  } else if (/^\.\/bitburner\.[^/]*\.md$/.test(href)) {
    // Relative URL from NS docs to other NS docs. The URL is always ./bitburner.foo.md
    // - Start with "./bitburner."
    // - End with ".md"
    // - Never have "/" between "./bitburner." and ".md"
    path = resolveFilePath(href, defaultNsApiPage);
  } else if (href.startsWith("nsDoc/")) {
    // Internal NS docs
    path = asFilePath(href);
  } else if (href.startsWith("https://") || href.startsWith("http://")) {
    // There are 2 types of HTTP URLs:
    // - URL pointing to NS docs (e.g., https://github.com/bitburner-official/bitburner-src/blob/stable/markdown/bitburner.foo.md)
    // - URL pointing to other places (e.g., https://github.com/bitburner-official/bitburner-src, MDN, other websites)
    // Most URLs pointing to NS docs were converted to relative links. There are rare/historical usages of links
    // pointing to our own docs that still use this format, and we're OK with them being external links.
    return { path: href, forceOpenExternally: true };
  } else {
    // Internal non-NS docs
    path = resolveFilePath("./" + href, currentPage);
  }
  return { path, forceOpenExternally: false };
}
