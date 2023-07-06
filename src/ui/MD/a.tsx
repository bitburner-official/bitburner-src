import { Link } from "@mui/material";
import React from "react";
import { useNavigator } from "../../Tutorial/ui/TutorialRoot";

export const a = (props: React.PropsWithChildren<{ href?: string }>): React.ReactElement => {
  const navigator = useNavigator();
  if ((props.href ?? "").startsWith("http"))
    return (
      <Link rel="noopener noreferrer" href={props.href} target="_blank">
        {props.children}
      </Link>
    );

  return <Link onClick={() => navigator.navigate(props.href ?? "NOT FOUND")}>{props.children}</Link>;
};
