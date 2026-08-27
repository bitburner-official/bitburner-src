import React, { memo } from "react";
import Badge from "@mui/material/Badge";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import type { Page } from "../../ui/Router";

export interface ICreateProps {
  key_: Page;
  icon: React.ReactElement["type"];
  count?: number;
  active?: boolean;
  alternateKeys?: Page[];
}

export interface SidebarItemProps extends ICreateProps {
  clickFn: () => void;
  flash: boolean;
  sidebarOpen: boolean;
}

export const SidebarItem = memo(function SidebarItem(props: SidebarItemProps): React.ReactElement {
  const colorToken = props.flash ? "info.main" : props.active ? "primary.main" : "secondary.main";

  return (
    <ListItemButton
      key={props.key_}
      onClick={props.clickFn}
      sx={{
        ...(props.active && {
          borderLeftWidth: 3,
          borderLeftStyle: "solid",
          borderLeftColor: "primary.main",
        }),
      }}
    >
      <ListItemIcon>
        <Badge badgeContent={(props.count ?? 0) > 0 ? props.count : undefined} color="error">
          <Tooltip title={!props.sidebarOpen ? props.key_ : ""}>
            <props.icon sx={{ color: colorToken }} />
          </Tooltip>
        </Badge>
      </ListItemIcon>
      <ListItemText>
        <Typography sx={{ color: colorToken }}>{props.key_}</Typography>
      </ListItemText>
    </ListItemButton>
  );
});
