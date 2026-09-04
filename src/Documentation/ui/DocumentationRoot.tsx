import React, { useEffect, useLayoutEffect, useState } from "react";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

import { MD } from "../../ui/MD/MD";
import {
  Navigator,
  windowTopPositionOfPages,
  useHistory,
  openDocExternally,
  convertNavigatorHref,
} from "../../ui/React/Documentation";
import { asFilePath } from "../../Paths/FilePath";
import { Settings } from "../../Settings/Settings";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { DocumentationAutocomplete } from "./DocumentationAutocomplete";
import { iTutorialSteps, ITutorial } from "../../InteractiveTutorial";

export function DocumentationRoot({ docPage }: { docPage?: string }): React.ReactElement {
  const history = useHistory();
  const [deepLink, setDeepLink] = useState(docPage);
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
    setDeepLink(docPage);
  }, [docPage]);

  useEffect(() => {
    /**
     * Using setTimeout is a workaround. window.scrollTo does not work when we switch from Documentation tab to another
     * tab, then switch back.
     */
    setTimeout(() => {
      window.scrollTo({ top: windowTopPositionOfPages.get(history.page) ?? 0, behavior: "instant" });
    }, 0);
  });

  /**
   * During the tutorial, the player is given the link to the NS API page a few times. If they click one of the links, 
   * then when they come to the documentation step they'll still see the NS API docs. This ensures that when the player 
   * visits the documentation page for the Docs step, they see index.md / home.
   */ 
  useEffect(() => {
    if (ITutorial.currStep === iTutorialSteps.DocumentationPageInfo) {
      history.home();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Lint doesn't like empty dependencies. But this really should only run on the first render.

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
      <Box paddingTop="50px">
        <Navigator.Provider value={navigator}>
          <MD pageFilePath={deepLink ? asFilePath(deepLink) : history.page} />
        </Navigator.Provider>
      </Box>
    </>
  );
}
