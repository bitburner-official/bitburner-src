import React, { useEffect, useState } from "react";
import { Modal } from "../../ui/React/Modal";
import { defaultNsApiPage, Navigator, openDocExternally } from "../../ui/React/Documentation";
import { MD } from "../../ui/MD/MD";
import { asFilePath, type FilePath, resolveFilePath } from "../../Paths/FilePath";
import { DocumentationPopUpEvents } from "../root";

export function DocumentationPopUp({ hidden }: { hidden: boolean }) {
  const [path, setPath] = useState<FilePath | undefined>(undefined);
  useEffect(
    () =>
      DocumentationPopUpEvents.subscribe((path?: string) => {
        setPath(path ? asFilePath(path) : undefined);
      }),
    [],
  );
  const navigator = {
    navigate(relativePath: string, external: boolean) {
      /**
       * This function is used for navigating inside the documentation popup.
       *
       * The "markdown" folder does not have any subfolders. All files are at the top-level. "relativePath" is always
       * "./<filename>". E.g., "./bitburner.ns.md".
       */
      const nsApiDocPath = resolveFilePath(relativePath, defaultNsApiPage);
      if (!nsApiDocPath) {
        return;
      }
      if (external) {
        openDocExternally(nsApiDocPath);
        return;
      }
      setPath(nsApiDocPath);
    },
  };
  if (!path) {
    return <></>;
  }
  return (
    <Modal
      open={!hidden}
      onClose={() => {
        setPath(undefined);
      }}
      wrapperStyles={{ minWidth: "90%", minHeight: "90%", scrollbarWidth: "thin" }}
      removeFocus={false}
    >
      <Navigator.Provider value={navigator}>
        <MD pageFilePath={path} top={0} />
      </Navigator.Provider>
    </Modal>
  );
}
