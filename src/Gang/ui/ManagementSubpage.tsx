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
        {gang.facName}（你的帮派）
      </Typography>
      <Typography>
        <br />
        如果某位帮派成员获得的资金或尊重不多，可能是你分配的任务太难了。可以考虑分配更简单的任务，或者对其进行训练。下拉列表中越靠前的任务通常越简单。
        另外，产出偏低也可能说明你的通缉等级过高。可以考虑让成员执行{" "}
        {gang.isHackingGang ? "Ethical Hacking or " : ""}
        Vigilante Justice 来降低通缉等级。
        <br />
        <br />
        安装强化不会重置你在帮派中的进度，但飞升倍率会略微下降。此外，安装强化后，你会自动加入创建帮派时所用的那个派系。
        <br />
        <br />
        你也可以在 Netscript 中通过 Gang API 以编程方式管理你的帮派。
      </Typography>
      <br />
      <GangStats />
      <br />

      <GangMemberList />
    </>
  );
}
