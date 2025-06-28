import React, { useEffect, useLayoutEffect, useState } from "react";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

import { MD } from "../../ui/MD/MD";
import {
  Navigator,
  windowTopPositionOfPages,
  useHistory,
  openDocExternally,
  prefixOfHttpUrlOfNsDocs,
} from "../../ui/React/Documentation";
import { asFilePath, isFilePath, resolveFilePath } from "../../Paths/FilePath";
import { Settings } from "../../Settings/Settings";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { DocumentationAutocomplete } from "./DocumentationAutocomplete";

export function DocumentationRoot({ docPage }: { docPage?: string }): React.ReactElement {
  const history = useHistory();
  const [deepLink, setDeepLink] = useState(docPage);
  const navigator = {
    navigate(href: string, openExternally: boolean) {
      let path;
      /**
       * Href can be:
       * - Internal NS docs: nsDoc/bitburner.ns.md
       * - Internal non-NS docs: help/getting_started.md
       * - HTTP URL:
       *   - Point to NS docs. Some non-NS docs pages include links to NS docs. For example: basic/scripts.md has a
       * link to https://github.com/bitburner-official/bitburner-src/blob/stable/markdown/bitburner.ns.flags.md. In
       * these cases, the link always points to a file at https://github.com/bitburner-official/bitburner-src/blob/stable/markdown/
       *   - Point to other places.
       */
      if (href.startsWith("nsDoc/")) {
        // Internal NS docs
        path = asFilePath(href);
      } else if (href.startsWith("https://") || href.startsWith("http://")) {
        /**
         * HTTP URL pointing to NS docs.
         * Convert https://github.com/bitburner-official/bitburner-src/blob/stable/markdown/page.md to nsDoc/page.md
         */
        if (href.startsWith(prefixOfHttpUrlOfNsDocs)) {
          path = asFilePath(`nsDoc/${href.replace(prefixOfHttpUrlOfNsDocs, "")}`);
        } else {
          // HTTP URL pointing to other places.
          openExternally = true;
          path = href;
        }
      } else {
        // Internal non-NS docs
        path = resolveFilePath("./" + href, history.page);
      }
      if (!path) {
        console.error(`Bad path ${href} from ${history.page} while navigating docs.`);
        return;
      }
      if (openExternally) {
        openDocExternally(path);
        return;
      }
      if (isFilePath(path)) {
        history.push(path);
      }
    },
  };

  // We need to use "useLayoutEffect" instead of "useEffect". "useLayoutEffect" is fired before the browser repaints the
  // screen.
  useLayoutEffect(() => {
    return () => {
      if (Router.page() !== Page.Documentation) {
        windowTopPositionOfPages.set(history.page, window.scrollY);
      }
    };
  }, [history]);

  useEffect(() => {
    if (!deepLink) {
      return;
    }
    history.push(asFilePath(deepLink));
    setDeepLink(undefined);
  }, [deepLink, history]);

  useEffect(() => {
    /**
     * Using setTimeout is a workaround. window.scrollTo does not work when we switch from Documentation tab to another
     * tab, then switch back.
     */
    setTimeout(() => {
      window.scrollTo({ top: windowTopPositionOfPages.get(history.page) ?? 0, behavior: "instant" });
    }, 0);
  });

  return (
    <>
      <Box
        position="fixed"
        display="flex"
        top={0}
        zIndex={1}
        width="100%"
        paddingTop="8px"
        bgcolor={Settings.theme.backgroundprimary}
        alignItems="center"
      >
        <Button onClick={() => history.pop()}>Back</Button>
        <Button onClick={() => history.home()}>Home</Button>
        <DocumentationAutocomplete
          sx={{ marginLeft: "10px" }}
          onChange={(path, external) => {
            navigator.navigate(path, external);
          }}
        />
      </Box>
      <Box paddingTop="50px">
        <Navigator.Provider value={navigator}>
          <MD pageFilePath={deepLink ? asFilePath(deepLink) : history.page} />
        </Navigator.Provider>
      </Box>
    </>
  );
}
