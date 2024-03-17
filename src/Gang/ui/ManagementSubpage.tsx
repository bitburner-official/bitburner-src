import React from "react";
import { GangStats } from "./GangStats";
import { GangMemberList } from "./GangMemberList";
import { useGang } from "./Context";
import { Typography } from "@mui/material";
import { AllGangFactionInfo } from "../data/FactionInfo";
import { GangConstants } from "../data/Constants";
import { GangMemberType } from "@enums";

/** React Component for the subpage that manages gang members, the main page. */
export function ManagementSubpage(): React.ReactElement {
  const gang = useGang();
  return (
    <>
      <Typography variant="h4" color="primary">
        {gang.facName} (your Gang)
      </Typography>
      <Typography>
        {Object.values(GangMemberType).map((memberType) => (
          `Max ${memberType.toLowerCase()}s: ${AllGangFactionInfo[gang.facName].maxMembers[memberType]}. `
        ))}
        Max gang members: {GangConstants.MaximumGangMembers}.
        <br />
        <br />
        If a gang member is not earning much money or respect, the task you assigned might be too difficult. Consider
        assigning an easier task, or training them. Tasks closer to the top of the dropdown list are generally easier.
        Alternatively, low production might be a sign that your wanted level is too high. Consider doing
        Ethical Hacking or Vigilante Justice to lower your wanted level.
        <br />
        <br />
        Installing Augmentations does NOT reset progress with your Gang, however ascension multipliers will decrease
        slightly. Furthermore, after installing Augmentations, you will automatically join whatever Faction you created
        your gang with.
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
