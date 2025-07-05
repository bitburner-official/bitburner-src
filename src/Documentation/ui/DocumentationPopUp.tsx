import React, { useEffect, useRef, useState } from "react";
import { Modal } from "../../ui/React/Modal";
import { defaultNsApiPage, Navigator, openDocExternally } from "../../ui/React/Documentation";
import { MD } from "../../ui/MD/MD";
import { asFilePath, type FilePath, isFilePath, resolveFilePath } from "../../Paths/FilePath";
import { DocumentationPopUpEvents } from "../root";

export function DocumentationPopUp({ hidden }: { hidden: boolean }) {
  const [path, setPath] = useState<FilePath | undefined>(undefined);
  const modalWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(
    () =>
      DocumentationPopUpEvents.subscribe((path?: string) => {
        setPath(path ? asFilePath(path) : undefined);
      }),
    [],
  );

  useEffect(() => {
    if (!modalWrapperRef || !modalWrapperRef.current) {
      return;
    }
    modalWrapperRef.current.scrollTo({ top: 0, behavior: "instant" });
  });

  const navigator = {
    navigate(href: string, openExternally: boolean) {
      /**
       * This function is used for navigating inside the documentation popup.
       *
       * Href can be:
       * - Internal NS docs. The "markdown" folder does not have any subfolders. All files are at the top-level. "Href"
       * is always "./<filename>". E.g., "./bitburner.ns.md".
       * - HTTP URL (e.g., ns.printf has a link to https://github.com/alexei/sprintf.js).
       */
      let path;
      if (href.startsWith("https://") || href.startsWith("http://")) {
        openExternally = true;
        path = href;
      } else {
        path = resolveFilePath(href, defaultNsApiPage);
      }
      if (!path) {
        console.error(`Bad path ${href} while navigating docs.`);
        return;
      }
      if (openExternally) {
        openDocExternally(path);
        return;
      }
      if (isFilePath(path)) {
        setPath(path);
      }
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
