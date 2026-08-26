import React, { memo } from "react";
import Badge from "@mui/material/Badge";
import ListItem from "@mui/material/ListItem";
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
  classes: Record<"listitem" | "active" | "themeColorPrimary" | "themeColorSecondary" | "themeColorInfo", string>;
  sidebarOpen: boolean;
}

export const SidebarItem = memo(function SidebarItem(props: SidebarItemProps): React.ReactElement {
  const colorClass = props.flash
    ? props.classes.themeColorInfo
    : props.active
    ? props.classes.themeColorPrimary
    : props.classes.themeColorSecondary;
  return (
    <ListItem
      classes={{ root: props.classes.listitem }}
      button
      key={props.key_}
      className={props.active ? props.classes.active : ""}
      onClick={props.clickFn}
    >
      <ListItemIcon>
        <Badge badgeContent={(props.count ?? 0) > 0 ? props.count : undefined} color="error">
          <Tooltip title={!props.sidebarOpen ? props.key_ : ""}>
            <props.icon className={colorClass} />
          </Tooltip>
        </Badge>
      </ListItemIcon>
      <ListItemText>
        <Typography className={colorClass}>{props.key_}</Typography>
      </ListItemText>
    </ListItem>
  );
});
