import React from "react";

import Button from "@mui/material/Button";
import { MD } from "../../ui/MD/MD";

import { getPage } from "./root";
import { Navigator, useHistory } from "../../ui/React/Documentation";
import { CONSTANTS } from "../../Constants";

const resolveRelativePath = (folder: string, relative: string): string => {
  const noLastSlash = folder.endsWith("/") ? folder.slice(0, folder.length - 1) : folder;
  const lastIndex = noLastSlash.lastIndexOf("/");
  const prefix = lastIndex === -1 ? "" : noLastSlash.slice(0, lastIndex + 1);
  const suffix = relative.slice("../".length);
  return prefix + suffix;
};

const resolvePath = (currentPath: string, newPath: string): string => {
  const lastIndex = currentPath.lastIndexOf("/");
  const folder = lastIndex === -1 ? "" : currentPath.slice(0, lastIndex + 1);
  if (!newPath.startsWith("../")) return folder + newPath;

  return resolveRelativePath(folder, newPath);
};

export function DocumentationRoot(): React.ReactElement {
  const history = useHistory();
  const page = getPage(history.page);
  const navigator = {
    navigate(relPath: string, external: boolean) {
      const newPath = resolvePath(history.page, relPath);
      if (external) {
        const ver = CONSTANTS.isDevBranch ? "dev" : "stable";
        const url = `https://github.com/bitburner-official/bitburner-src/blob/${ver}/src/Documentation/ui/doc/${newPath}`;
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
