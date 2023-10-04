import React from "react";
import { GangStats } from "./GangStats";
import { GangMemberList } from "./GangMemberList";
import { useGang } from "./Context";
import { Typography } from "@mui/material";

/** React Component for the subpage that manages gang members, the main page. */
export function ManagementSubpage(): React.ReactElement {
  const gang = useGang();
  return (
    <>
      <Typography variant="h4" color="primary">
        {gang.facName} (your Gang)
      </Typography>
      <Typography>
        <br />
        If a gang member is not earning much money or respect, the task you assigned might be too difficult. Consider
        assigning an easier task, or training them. Tasks closer to the top of the dropdown list are generally easier.
        Alternatively, low production might be a sign that your wanted level is too high. Consider doing{" "}
        {gang.isHackingGang ? "Ethical Hacking or " : ""}
        Vigilante Justice to lower your wanted level.
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
