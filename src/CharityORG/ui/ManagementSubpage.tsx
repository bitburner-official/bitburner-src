import React from "react";
import { CharityORGStats } from "./CharityORGStats";
import { CharityORGMemberList } from "./CharityORGMemberList";
import { useCharityORG } from "./Context";
import { Typography } from "@mui/material";

/** React Component for the subpage that manages gang members, the main page. */
export function ManagementSubpage(): React.ReactElement {
  const charityORG = useCharityORG();

  return (
    <>
      <Typography variant="h4" color="primary">
        {charityORG.name} (your Charity)
      </Typography>
      <Typography>
        <br />
        If a volunteer is not earning/spending effectively, it may be that the task is too difficult for them. Consider
        setting them to a different task or possibly training them. Tasks have a difficulty and stat weight. In order
        for a volunteer to get the benefit of working a task, their stats must meet the events requirements.
        <br />
        <br />
        Installing Augmentations does NOT reset progress with your CharityORG. Furthermore, after installing
        Augmentations, you will automatically join the charity faction again.
        <br />
        <br />
        Bring your visibility up to 100 while simultaneously bringing terror down to 0. This is your ultimate goal! You
        can also manage your charityORG programmatically through Netscript using the CharityORG API. Highly recommended.
      </Typography>
      <br />
      <CharityORGStats />
      <br />
      <CharityORGMemberList />
    </>
  );
}
