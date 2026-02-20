import React, { useEffect, useRef, useState } from "react";
import { Modal } from "../../ui/React/Modal";
import { convertNavigatorHref, Navigator, openDocExternally } from "../../ui/React/Documentation";
import { MD } from "../../ui/MD/MD";
import { asFilePath, type FilePath } from "../../Paths/FilePath";
import { DocumentationPopUpEvents } from "../root";

export function DocumentationPopUp({ hidden }: { hidden: boolean }) {
  const [path, setPath] = useState<FilePath | undefined>(undefined);
  const modalWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(
    () =>
      DocumentationPopUpEvents.subscribe((path: string) => {
        setPath(asFilePath(path));
      }),
    [],
  );

  useEffect(() => {
    if (!modalWrapperRef || !modalWrapperRef.current) {
      return;
    }
    modalWrapperRef.current.scrollTo({ top: 0, behavior: "instant" });
  });

  if (!path) {
    return <></>;
  }

  const navigator = {
    /**
     * This function is used for navigating inside the documentation popup.
     */
    navigate(href: string, openExternally: boolean) {
      if (!path) {
        return;
      }
      const { path: newPath, forceOpenExternally } = convertNavigatorHref(href, path);
      if (!newPath) {
        console.error(`Bad path ${href} while navigating docs.`);
        return;
      }
      if (openExternally || forceOpenExternally) {
        openDocExternally(newPath);
        return;
      }
      setPath(newPath);
    },
  };
  return (
    <Modal
      open={!hidden}
      onClose={() => {
        setPath(undefined);
      }}
      wrapperRef={modalWrapperRef}
      wrapperStyles={{ minWidth: "90%", minHeight: "90%", scrollbarWidth: "thin" }}
      removeFocus={false}
    >
      <Navigator.Provider value={navigator}>
        <MD pageFilePath={path} />
      </Navigator.Provider>
    </Modal>
  );
}
