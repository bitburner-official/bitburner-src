import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";

import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";

import { useBoolean, useRerender } from "../../ui/React/hooks";
import { Settings } from "../../Settings/Settings";

import { dirty, reorder } from "./utils";
import { OpenScript } from "./OpenScript";
import { Tab } from "./Tab";

const tabsMaxWidth = 1640;
const searchWidth = 180;

interface IProps {
  scripts: OpenScript[];
  currentScript: OpenScript | null;

  onTabClick: (tabIndex: number) => void;
  onTabClose: (tabIndex: number) => void;
  onTabUpdate: (tabIndex: number) => void;
}

export function Tabs({ scripts, currentScript, onTabClick, onTabClose, onTabUpdate }: IProps) {
  const [filter, setFilter] = useState("");
  const [isSearchTooltipOpen, { on: openSearchTooltip, off: closeSearchTooltip }] = useBoolean(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const rerender = useRerender();

  const filteredScripts = Object.values(scripts)
    .map((script, originalIndex) => ({ script, originalIndex }))
    .filter(({ script }) => script.hostname.includes(filter) || script.path.includes(filter));

  console.log({
    scripts, filteredScripts
  });
  

  function onDragEnd(result: DropResult): void {
    // Dropped outside of the list
    if (!result.destination) return;
    reorder(
      scripts,
      filteredScripts[result.source.index].originalIndex,
      filteredScripts[result.destination.index].originalIndex,
    );
    rerender();
  }

  function handleFilterChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setFilter(event.target.value);
  }

  function toggleSearch(): void {
    setFilter("");
    setSearchExpanded(!searchExpanded);
    closeSearchTooltip();
  }

  function handleScroll(e: React.WheelEvent<HTMLDivElement>): void {
    e.currentTarget.scrollLeft += e.deltaY;
  }

  return (
    <Box display="flex" flexGrow="0" flexDirection="row" alignItems="center">
      <Tooltip
        title={"Search Open Scripts"}
        open={isSearchTooltipOpen}
        onOpen={openSearchTooltip}
        onClose={closeSearchTooltip}
      >
        <span style={{ marginRight: 5 }}>
          {searchExpanded ? (
            <TextField
              value={filter}
              onChange={handleFilterChange}
              autoFocus
              sx={{ minWidth: searchWidth, maxWidth: searchWidth }}
              InputProps={{
                startAdornment: <SearchIcon />,
                spellCheck: false,
                endAdornment: (
                  <IconButton onClick={toggleSearch}>
                    <CloseIcon />
                  </IconButton>
                ),
              }}
            />
          ) : (
            <Button onClick={toggleSearch}>
              <SearchIcon />
            </Button>
          )}
        </span>
      </Tooltip>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="tabs" direction="horizontal">
          {(provided, snapshot) => (
            <Box
              maxWidth={`${tabsMaxWidth}px`}
              display="flex"
              flexGrow="1"
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
              onWheel={handleScroll}
            >
              {filteredScripts.map(({ script, originalIndex }, index) => {
                const { path: fileName, hostname } = script;
                const isActive = currentScript?.path === script.path && currentScript.hostname === script.hostname;
                console.log(scripts, index, filteredScripts);
                
                const title = `${hostname}:~${fileName.startsWith("/") ? "" : "/"}${fileName} ${dirty(scripts, index)}`;

                return (
                  <Draggable
                    key={fileName + hostname}
                    draggableId={fileName + hostname}
                    index={index}
                    disableInteractiveElementBlocking
                  >
                    {(provided) => (
                      <Tab
                        provided={provided}
                        title={title}
                        isActive={isActive}
                        isExternal={hostname !== "home"}
                        onClick={() => onTabClick(originalIndex)}
                        onClose={() => onTabClose(originalIndex)}
                        onUpdate={() => onTabUpdate(originalIndex)}
                      />
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
}
