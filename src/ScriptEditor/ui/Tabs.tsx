import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { Box, Button, TextField, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import SyncIcon from "@mui/icons-material/Sync";

import { useRerender } from "../../ui/React/hooks";
import { Settings } from "../../Settings/Settings";

import { dirty, reorder } from "./utils";
import { OpenScript } from "./OpenScript";

const tabsMaxWidth = 1640;
const tabMargin = 5;
const tabIconWidth = 25;

interface IProps {
  scripts: OpenScript[];
  currentScript: OpenScript | null;

  onTabClick: (tabIndex: number) => void;
  onTabClose: (tabIndex: number) => void;
  onTabUpdate: (tabIndex: number) => void;
}

export function Tabs({ scripts, currentScript, onTabClick, onTabClose, onTabUpdate }: IProps) {
  const [filter, setFilter] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);
  const rerender = useRerender();

  function onDragEnd(result: any): void {
    // Dropped outside of the list
    if (!result.destination) return;
    reorder(scripts, result.source.index, result.destination.index);
    rerender();
  }

  const filteredOpenScripts = Object.values(scripts).filter(
    (script) => script.hostname.includes(filter) || script.path.includes(filter),
  );

  function handleFilterChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setFilter(event.target.value);
  }

  function handleExpandSearch(): void {
    setFilter("");
    setSearchExpanded(!searchExpanded);
  }

  const tabMaxWidth = filteredOpenScripts.length ? tabsMaxWidth / filteredOpenScripts.length - tabMargin : 0;
  const tabTextWidth = tabMaxWidth - tabIconWidth * 2;
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="tabs" direction="horizontal">
        {(provided, snapshot) => (
          <Box
            maxWidth={`${tabsMaxWidth}px`}
            display="flex"
            flexGrow="0"
            flexDirection="row"
            alignItems="center"
            whiteSpace="nowrap"
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              backgroundColor: snapshot.isDraggingOver
                ? Settings.theme.backgroundsecondary
                : Settings.theme.backgroundprimary,
              overflowX: "scroll",
            }}
          >
            <Tooltip title={"Search Open Scripts"}>
              {searchExpanded ? (
                <TextField
                  value={filter}
                  onChange={handleFilterChange}
                  autoFocus
                  InputProps={{
                    startAdornment: <SearchIcon />,
                    spellCheck: false,
                    endAdornment: <CloseIcon onClick={handleExpandSearch} />,
                    // TODO: reapply
                    // sx: { minWidth: 200 },
                  }}
                />
              ) : (
                <Button onClick={handleExpandSearch}>
                  <SearchIcon />
                </Button>
              )}
            </Tooltip>
            {filteredOpenScripts.map(({ path: fileName, hostname }, index) => {
              const editingCurrentScript =
                currentScript?.path === filteredOpenScripts[index].path &&
                currentScript.hostname === filteredOpenScripts[index].hostname;
              const externalScript = hostname !== "home";
              const colorProps = editingCurrentScript
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

              if (externalScript) {
                colorProps.color = Settings.theme.info;
              }
              const iconButtonStyle = {
                maxWidth: `${tabIconWidth}px`,
                minWidth: `${tabIconWidth}px`,
                minHeight: "38.5px",
                maxHeight: "38.5px",
                ...colorProps,
              };

              const scriptTabText = `${hostname}:~${fileName.startsWith("/") ? "" : "/"}${fileName} ${dirty(
                scripts,
                index,
              )}`;

              return (
                <Draggable
                  key={fileName + hostname}
                  draggableId={fileName + hostname}
                  index={index}
                  disableInteractiveElementBlocking={true}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        // maxWidth: `${tabMaxWidth}px`,
                        marginRight: `${tabMargin}px`,
                        flexShrink: 0,
                        border: "1px solid " + Settings.theme.well,
                      }}
                    >
                      <Tooltip title={scriptTabText}>
                        <Button
                          onClick={() => onTabClick(index)}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            if (e.button === 1) onTabClose(index);
                          }}
                          style={{
                            maxWidth: `${tabTextWidth}px`,
                            minHeight: "38.5px",
                            overflow: "hidden",
                            ...colorProps,
                          }}
                        >
                          <span style={{ overflow: "hidden", direction: "rtl", textOverflow: "ellipsis" }}>
                            {scriptTabText}
                          </span>
                        </Button>
                      </Tooltip>
                      <Tooltip title="Overwrite editor content with saved file content">
                        <Button onClick={() => onTabUpdate(index)} style={iconButtonStyle}>
                          <SyncIcon fontSize="small" />
                        </Button>
                      </Tooltip>
                      <Button onClick={() => onTabClose(index)} style={iconButtonStyle}>
                        <CloseIcon fontSize="small" />
                      </Button>
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </DragDropContext>
  );
}
