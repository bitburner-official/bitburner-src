import React, { useContext, useState } from "react";
import { FilePath, asFilePath } from "../../Paths/FilePath";

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

const defaultPage = asFilePath("index.md");

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
