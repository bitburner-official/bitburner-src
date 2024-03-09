import React, { useState } from "react";

import Button from "@mui/material/Button";
import { MD } from "../../ui/MD/MD";

import { getPage } from "../root";
import { Navigator, useHistory } from "../../ui/React/Documentation";
import { CONSTANTS } from "../../Constants";
import { asFilePath, resolveFilePath } from "../../Paths/FilePath";

export function DocumentationRoot({ docPage }: { docPage?: string }): React.ReactElement {
  const history = useHistory();
  const [deepLink, setDeepLink] = useState(docPage);
  if (deepLink !== undefined) {
    history.push(asFilePath(deepLink));
    setDeepLink(undefined);
  }
  const page = getPage(history.page);
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

      // Reset scroll to the top of the page.
      window.scrollTo(0, 0);
    },
  };

  return (
    <>
      <Button onClick={() => history.pop()}>Back</Button>
      <Button onClick={() => history.home()}>Home</Button>
      <Navigator.Provider value={navigator}>
        <MD md={page + ""} />
      </Navigator.Provider>
    </>
  );
}
