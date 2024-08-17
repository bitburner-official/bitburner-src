import React, { useLayoutEffect, useState } from "react";

import Button from "@mui/material/Button";
import { MD } from "../../ui/MD/MD";

import { Navigator, windowTopPositionOfPages, useHistory } from "../../ui/React/Documentation";
import { CONSTANTS } from "../../Constants";
import { asFilePath, resolveFilePath } from "../../Paths/FilePath";
import Box from "@mui/material/Box";
import { Settings } from "../../Settings/Settings";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";

export function DocumentationRoot({ docPage }: { docPage?: string }): React.ReactElement {
  const history = useHistory();
  const [deepLink, setDeepLink] = useState(docPage);
  if (deepLink !== undefined) {
    history.push(asFilePath(deepLink));
    setDeepLink(undefined);
  }
  const navigator = {
    navigate(relPath: string, external: boolean) {
      const newPath = resolveFilePath("./" + relPath, history.page);
      if (!newPath) {
        console.error(`Bad path ${relPath} from ${history.page} while navigating docs.`);
        return;
      }
      if (external) {
        const ver = CONSTANTS.isDevBranch ? "dev" : "stable";
        const url = `https://github.com/bitburner-official/bitburner-src/blob/${ver}/src/Documentation/doc/${newPath}`;
        window.open(url, "_newtab");
        return;
      }
      history.push(newPath);
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

  return (
    <>
      <Box position="fixed" top={0} zIndex={1} width="100%" paddingTop="8px" bgcolor={Settings.theme.backgroundprimary}>
        <Button onClick={() => history.pop()}>Back</Button>
        <Button onClick={() => history.home()}>Home</Button>
      </Box>
      <Box paddingTop="50px">
        <Navigator.Provider value={navigator}>
          <MD pageFilePath={history.page} top={windowTopPositionOfPages.get(history.page) ?? 0} />
        </Navigator.Provider>
      </Box>
    </>
  );
}
