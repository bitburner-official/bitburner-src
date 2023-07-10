import React, { useContext, useState } from "react";

import Button from "@mui/material/Button";
import { ConfirmationModal } from "../../ui/React/ConfirmationModal";
import { MD } from "../../ui/MD/MD";

import { Root, getPage } from "./root";
import { Navigator, useHistory } from "../../ui/React/Documentation";

interface IProps {
  reactivateTutorial: () => void;
}

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

export function DocumentationRoot(props: IProps): React.ReactElement {
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const history = useHistory();
  const page = getPage(history.page);
  const navigator = {
    navigate(relPath: string) {
      const newPath = resolvePath(history.page, relPath);
      history.push(newPath);
    },
  };
  return (
    <>
      <Button onClick={() => setConfirmResetOpen(true)}>Soft reset and Restart tutorial</Button>
      <Button onClick={() => history.pop()}>Back</Button>
      <ConfirmationModal
        open={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        onConfirm={props.reactivateTutorial}
        confirmationText={"This will reset all your stats to 1 and money to 1k. Are you sure?"}
      />
      <Navigator.Provider value={navigator}>
        <MD md={page.content + ""} />
      </Navigator.Provider>
    </>
  );
}
