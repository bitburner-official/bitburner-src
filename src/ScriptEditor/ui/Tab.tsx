import React, { useEffect, useRef } from "react";
import { DraggableProvided } from "react-beautiful-dnd";

import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";

import SyncIcon from "@mui/icons-material/Sync";
import CloseIcon from "@mui/icons-material/Close";

import { Settings } from "../../Settings/Settings";

interface IProps {
  provided: DraggableProvided;
  title: string;
  isActive: boolean;
  isExternal: boolean;

  onClick: () => void;
  onClose: () => void;
  onUpdate: () => void;
}

const tabMargin = 5;
const tabIconWidth = 25;
const tabIconHeight = 38.5;

export function Tab({ provided, title, isActive, isExternal, onClick, onClose, onUpdate }: IProps) {
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

  if (isExternal) {
    colorProps.color = Settings.theme.info;
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
      <Tooltip title={title}>
        <Button
          onClick={onClick}
          onMouseDown={(e) => {
            e.preventDefault();
            if (e.button === 1) onClose();
          }}
          style={{
            minHeight: tabIconHeight,
            overflow: "hidden",
            ...colorProps,
          }}
        >
          <span style={{ overflow: "hidden", direction: "rtl", textOverflow: "ellipsis" }}>{title}</span>
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
