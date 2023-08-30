import React from "react";
import { GangStats } from "./GangStats";
import { GangMemberList } from "./GangMemberList";
import Typography from "@mui/material/Typography";

/** React Component for the subpage that manages gang members, the main page. */
export function ManagementSubpage(): React.ReactElement {
  return (
    <>
      <Typography>
        This page is used to get an overview of your gang's stats and manage gang members.
        <br />
        <br />
        If a gang member is not earning much money or respect, the task you assigned might be too difficult. Consider
        assigning an easier task, or training them. Tasks closer to the top of the dropdown list are generally easier.
        Alternatively, low production might be a sign that your wanted level is too high. Consider using the "Ethical
        Hacking" or "Vigilante Justice" task to lower your wanted level.
        <br />
        <br />
        Installing Augmentations does NOT reset progress with your Gang. Furthermore, after installing Augmentations,
        you will automatically join whatever Faction you created your gang with.
        <br />
        <br />
        You can also manage your gang programmatically through Netscript using the Gang API.
      </Typography>
      <br />
      <GangStats />
      <br />
      <GangMemberList />
    </>
  );
}
