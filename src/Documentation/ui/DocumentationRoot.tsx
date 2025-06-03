import React, { useEffect, useLayoutEffect, useState } from "react";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

import { MD } from "../../ui/MD/MD";
import { Navigator, windowTopPositionOfPages, useHistory, openDocExternally } from "../../ui/React/Documentation";
import { asFilePath, resolveFilePath } from "../../Paths/FilePath";
import { Settings } from "../../Settings/Settings";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { DocumentationAutocomplete } from "./DocumentationAutocomplete";

export function DocumentationRoot({ docPage }: { docPage?: string }): React.ReactElement {
  const history = useHistory();
  const [deepLink, setDeepLink] = useState(docPage);
  const navigator = {
    navigate(relativePath: string, external: boolean) {
      const path = relativePath.startsWith("nsDoc/")
        ? asFilePath(relativePath)
        : resolveFilePath("./" + relativePath, history.page);
      if (!path) {
        console.error(`Bad path ${relativePath} from ${history.page} while navigating docs.`);
        return;
      }
      if (external) {
        openDocExternally(path);
        return;
      }
      history.push(path);
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
          <MD
            pageFilePath={deepLink ? asFilePath(deepLink) : history.page}
            top={windowTopPositionOfPages.get(history.page) ?? 0}
          />
        </Navigator.Provider>
      </Box>
    </>
  );
}
