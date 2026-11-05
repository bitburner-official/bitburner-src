import React, { useContext, useEffect, useLayoutEffect, useState } from "react";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

import { MD } from "../../ui/MD/MD";
import {
  Navigator,
  windowTopPositionOfPages,
  useHistory,
  openDocExternally,
  convertNavigatorHref,
  ScrollContainerContext,
} from "../../ui/React/Documentation";
import { asFilePath } from "../../Paths/FilePath";
import { Settings } from "../../Settings/Settings";
import { Page, Router } from "../../ui/Router";
import { DocumentationAutocomplete } from "./DocumentationAutocomplete";

export function DocumentationRoot({ docPage }: { docPage?: string }): React.ReactElement {
  const history = useHistory();
  const [deepLink, setDeepLink] = useState(docPage);
  const scrollContainerRef = useContext(ScrollContainerContext);
  const navigator = {
    /**
     * This function is used for navigating inside the documentation tab.
     */
    navigate(href: string, openExternally: boolean) {
      const { path, forceOpenExternally } = convertNavigatorHref(href, history.page);
      if (!path) {
        console.error(`Bad path ${href} from ${history.page} while navigating docs.`);
        return;
      }
      if (openExternally || forceOpenExternally) {
        openDocExternally(path);
        return;
      }
      history.push(path);
    },
  };

  // We need to use "useLayoutEffect" instead of "useEffect". "useLayoutEffect" is fired before the browser repaints the
  // screen.
  useLayoutEffect(() => {
    const scrollContainer = scrollContainerRef?.current;
    return () => {
      if (Router.page() !== Page.Documentation) {
        windowTopPositionOfPages.set(history.page, scrollContainer?.scrollTop ?? 0);
      }
    };
  }, [history, scrollContainerRef]);

  useEffect(() => {
    if (!deepLink) {
      return;
    }
    history.push(asFilePath(deepLink));
    setDeepLink(undefined);
  }, [deepLink, history]);

  useEffect(() => {
    setDeepLink(docPage);
  }, [docPage]);

  useEffect(() => {
    /**
     * Using setTimeout is a workaround. window.scrollTo does not work when we switch from Documentation tab to another
     * tab, then switch back.
     */
    setTimeout(() => {
      scrollContainerRef?.current?.scrollTo({
        top: windowTopPositionOfPages.get(history.page) ?? 0,
        behavior: "instant",
      });
    }, 0);
  });

  return (
    <Box
      ref={scrollContainerRef}
      sx={
        Settings.ShowScrollbarInDocumentationPages
          ? {
              height: "100vh",
              overflowY: "auto",
              scrollbarWidth: "auto",
              scrollbarColor: `${Settings.theme.button} transparent`,
            }
          : {}
      }
    >
      <Box
        position="sticky"
        display="flex"
        top={0}
        zIndex={1}
        width="100%"
        bgcolor={Settings.theme.backgroundprimary}
        alignItems="center"
      >
        <Button onClick={() => history.pop()} disabled={history.pages.length === 0}>
          Back
        </Button>
        <Button onClick={() => history.home()} disabled={history.pages.length === 0}>
          Home
        </Button>
        <DocumentationAutocomplete
          sx={{ marginLeft: "10px" }}
          onChange={(path, external) => {
            navigator.navigate(path, external);
          }}
        />
      </Box>
      <Box sx={{ maxWidth: "lg" }}>
        <Navigator.Provider value={navigator}>
          <MD pageFilePath={deepLink ? asFilePath(deepLink) : history.page} />
        </Navigator.Provider>
      </Box>
    </Box>
  );
}
