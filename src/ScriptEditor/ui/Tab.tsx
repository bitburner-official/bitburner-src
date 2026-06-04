import React, { useEffect, useRef } from "react";
import { DraggableProvided } from "react-beautiful-dnd";

import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import SyncIcon from "@mui/icons-material/Sync";
import CloseIcon from "@mui/icons-material/Close";

import { Settings } from "../../Settings/Settings";
import { EditorEvents } from "../EditorData";
import { useRerender } from "../../ui/React/hooks";
import { getTabId } from "./utils";
import type { ContentFilePath } from "../../Paths/ContentFile";

interface IProps {
  provided: DraggableProvided;
  tabId: string;
  isActive: boolean;
  isExternal: boolean;

  isUnsaved: () => boolean;
  onClick: () => void;
  onClose: () => void;
  onUpdate: () => void;
}

const tabMargin = 5;
const tabIconWidth = 25;
const tabIconHeight = 38.5;

export function Tab({ provided, tabId, isActive, isExternal, isUnsaved, onClick, onClose, onUpdate }: IProps) {
  const rerender = useRerender();
  const colorProps = isActive
    ? {
        background: Settings.theme.button,
        borderColor: Settings.theme.button,
        color: Settings.theme.primary,
      }
    : {
        background: Settings.theme.backgroundsecondary,
        borderColor: Settings.theme.backgroundsecondary,
        color: Settings.theme.secondary,
      };

  let tabTitle;
  let tooltipTitle;
  if (isUnsaved()) {
    // Show a "*" character to notify the player that this file is dirtied.
    tabTitle = (
      <>
        <Typography component="span" color={Settings.theme.warning}>
          *{" "}
        </Typography>
        {tabId}
      </>
    );
  } else {
    tabTitle = tabId;
  }

  if (isExternal) {
    colorProps.color = Settings.theme.warning;
    // Show a warning message if this file is on a non-home server.
    tooltipTitle = (
      <Typography component="span" color={Settings.theme.warning}>
        {tabTitle}
        <br />
        This file is on a non-home server. You will lose all files on non-home servers when they are deleted or
        recreated (install augmentations, soft reset, deleted by NS APIs, etc.).
      </Typography>
    );
  } else {
    tooltipTitle = tabTitle;
  }
  const iconButtonStyle = {
    maxWidth: tabIconWidth,
    minWidth: tabIconWidth,
    minHeight: tabIconHeight,
    maxHeight: tabIconHeight,
    ...colorProps,
  };

  const tabRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (tabRef.current && isActive) {
      tabRef.current?.scrollIntoView();
    }
  }, [isActive]);

  useEffect(
    () =>
      EditorEvents.subscribe((hostname: string, filePath: ContentFilePath) => {
        if (tabId !== getTabId(hostname, filePath)) {
          return;
        }
        rerender();
      }),
    [rerender, tabId],
  );

  return (
    <div
      ref={(element) => {
        tabRef.current = element;
        provided.innerRef(element);
      }}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={{
        ...provided.draggableProps.style,
        marginRight: tabMargin,
        flexShrink: 0,
        border: "1px solid " + Settings.theme.well,
      }}
    >
      <Tooltip title={tooltipTitle}>
        <Button
          onClick={onClick}
          onMouseDown={(e) => {
            e.preventDefault();
            if (e.button === 1) {
              onClose();
            }
          }}
          style={{
            minHeight: tabIconHeight,
            overflow: "hidden",
            ...colorProps,
          }}
        >
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{tabTitle}</span>
        </Button>
      </Tooltip>
      <Tooltip title="Overwrite editor content with saved file content">
        <Button onClick={onUpdate} style={iconButtonStyle}>
          <SyncIcon fontSize="small" />
        </Button>
      </Tooltip>
      <Button onClick={onClose} style={iconButtonStyle}>
        <CloseIcon fontSize="small" />
      </Button>
    </div>
  );
}
