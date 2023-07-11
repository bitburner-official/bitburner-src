import React, { useContext, useState } from "react";

interface Navigator {
  navigate: (s: string, external: boolean) => void;
}

export const Navigator = React.createContext<Navigator>({ navigate: () => undefined });

export const useNavigator = (): Navigator => useContext(Navigator);

interface History {
  pages: string[];
  page: string;
  push(p: string): void;
  pop(): void;
  home(): void;
}

const defaultPage = "index.md";

const HistoryContext = React.createContext<History>({
  page: "",
  pages: [],
  push: () => undefined,
  pop: () => undefined,
  home: () => undefined,
});

export const Provider = HistoryContext.Provider;
export const useHistory = (): History => useContext(HistoryContext);

const onPush = (h: History, p: string): History => {
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
    push(p: string) {
      setHistory((h) => onPush(h, p));
    },
    pop() {
      setHistory((h) => onPop(h));
    },
    home() {
      setHistory((h) => onHome(h));
    },
  });
  return <Provider value={history}>{props.children}</Provider>;
};
