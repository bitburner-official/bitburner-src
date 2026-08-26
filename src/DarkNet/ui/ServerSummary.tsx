import React from "react";
import { SvgIcon, Tooltip, Typography } from "@mui/material";
import {
  AcUnit,
  Add,
  Bolt,
  Code,
  Description,
  DoorBackSharp,
  Inventory2,
  LockPerson,
  Terminal,
} from "@mui/icons-material";
import { formatNumber } from "../../ui/formatNumber";
import { CompletedProgramName, ComplexPage } from "@enums";
import { formatToMaxDigits } from "./uiUtilities";

import type { DarknetServer } from "../../Server/DarknetServer";
import { DarknetConstants } from "../Constants";
import { Router } from "../../ui/GameRoot";
import { Settings } from "../../Settings/Settings";

export type ServerSummaryProps = {
  server: DarknetServer;
  enableAuth: boolean;
  showDetails?: boolean;
  classes: {
    [key: string]: string;
  };
};

export function ServerSummary({
  server,
  enableAuth,
  classes,
  showDetails = false,
}: ServerSummaryProps): React.ReactElement {
  if (!server.hasAdminRights && enableAuth) {
    return <Typography color={Settings.theme.int}>[ 需要认证 ]</Typography>;
  }
  if (!server.hasAdminRights && !enableAuth) {
    return <Typography color="secondary">（无连接）</Typography>;
  }

  const cacheCount = server.caches.length;
  const dataFiles = Array.from(server.textFiles.keys()).filter((f) => f.endsWith(DarknetConstants.DataFileSuffix));
  const textFiles = [...dataFiles, ...server.messages];
  const fileCount = textFiles.length;
  const textFilesTooltip =
    textFiles.length > 0
      ? `服务器上的数据文件：${textFiles.slice(0, 3).join("、")}${
          textFiles.length > 3 ? ` 等 ${textFiles.length} 个` : ""
        }`
      : "服务器上没有数据文件";
  const contractCount = server.contracts.length;
  let runningScriptCount = 0;
  const scripts = new Map<string, number>();
  for (const map of server.runningScriptMap.values()) {
    const rs = map.values().next().value;
    if (!rs) continue;
    runningScriptCount += map.size;
    const count = (scripts.get(rs.filename) ?? 0) + map.size;
    scripts.set(rs.filename, count);
  }
  const runningScriptNames = scripts
    .entries()
    .map(([name, count]) => name + (count === 1 ? "" : "x" + count))
    .toArray();
  const runningScriptsTooltip =
    runningScriptNames.length > 0
      ? `服务器上运行中的脚本：${runningScriptNames.slice(0, 3).join("、")}${
          runningScriptNames.length > 3 ? ` 等 ${runningScriptNames.length} 个` : ""
        }`
      : "服务器上没有运行中的脚本";
  const dataCacheTooltip = `服务器上的奖励缓存：${server.caches.slice(0, 3).join("、")}${
    server.caches.length > 3 ? ` 等 ${server.caches.length} 个` : ""
  }`;
  const hasStormSeed = server.programs.includes(CompletedProgramName.stormSeed);
  const ramBlockedDetails = formatToMaxDigits(server.blockedRam, 2) + "GB";
  const ramBlocked = showDetails ? ramBlockedDetails : formatNumber(server.blockedRam, 0);

  const components = [
    <Tooltip key="runningScript" title={<>{runningScriptsTooltip}</>} style={{ cursor: "pointer" }}>
      <Typography
        color={runningScriptCount > 0 ? "primary" : "secondary"}
        onClick={() => Router.toPage(ComplexPage.ActiveScripts, { serverName: server.hostname })}
      >
        <SvgIcon component={Terminal} className={classes.serverStatusIcon} />
        {runningScriptCount}
      </Typography>
    </Tooltip>,
  ];

  if (cacheCount) {
    components.push(
      <Tooltip key="cache" title={<>{dataCacheTooltip}</>}>
        <Typography>
          <SvgIcon component={Inventory2} className={`${classes.gold} ${classes.serverStatusIcon}`} />
          {cacheCount}
        </Typography>
      </Tooltip>,
    );
  }
  if (hasStormSeed) {
    components.push(
      <Tooltip key="stormSeed" title={<>这里发现了一个神秘的可执行文件……</>}>
        <Typography>
          <SvgIcon component={Bolt} className={`${classes.gold} ${classes.serverStatusIcon}`} />?
        </Typography>
      </Tooltip>,
    );
  }
  if (server.hasStasisLink) {
    components.push(
      <Tooltip
        key="stasisLinked"
        title={
          <>
            已安装滞留链路。这允许远程连接到该服务器，并可以从任意距离执行 ns.exec。
          </>
        }
      >
        <Typography>
          <SvgIcon component={DoorBackSharp} className={`${classes.gold} ${classes.serverStatusIcon}`} />
        </Typography>
      </Tooltip>,
    );
  } else if (server.backdoorInstalled) {
    components.push(
      <Tooltip key="backdoor" title={<>已安装后门。警告：这会增加暗网的不稳定性。</>}>
        <Typography>
          <SvgIcon component={DoorBackSharp} className={`${classes.red} ${classes.serverStatusIcon}`} />
        </Typography>
      </Tooltip>,
    );
  }
  if (!server.maxRam) {
    components.push(
      <Tooltip
        key="frozen"
        title={<>服务器已被冻结。它不会移动，但没有最大 RAM，也不会提供魅力经验。</>}
      >
        <Typography>
          <SvgIcon component={AcUnit} className={`${classes.blue} ${classes.serverStatusIcon}`} />
        </Typography>
      </Tooltip>,
    );
  }
  if (contractCount) {
    components.push(
      <Tooltip key="contract" title={<>编程合约数量：{contractCount}</>}>
        <Typography>
          <SvgIcon component={Code} className={classes.serverStatusIcon} />
          {contractCount}
        </Typography>
      </Tooltip>,
    );
  }
  if (fileCount) {
    components.push(
      <Tooltip key="file" title={<>{textFilesTooltip}</>}>
        <Typography color={fileCount ? "primary" : "secondary"}>
          <SvgIcon component={Description} className={classes.serverStatusIcon} />
          {fileCount}
        </Typography>
      </Tooltip>,
    );
  }
  if (server.blockedRam) {
    components.push(
      <Tooltip
        key="ramBlocked"
        title={<>所有者封锁的 RAM：{ramBlockedDetails}。可以使用 ns.dnet.memoryReallocation() 释放这些内存</>}
      >
        <Typography color={"secondary"}>
          <SvgIcon component={LockPerson} className={classes.serverStatusIcon} />
          {ramBlocked}
        </Typography>
      </Tooltip>,
    );
  }
  const componentsToShow =
    showDetails || components.length <= 4
      ? components
      : [
          ...components.slice(0, 3),
          <Tooltip key="others" placement="right" title={<div style={{ display: "flex" }}>{components.slice(3)}</div>}>
            <Typography>
              <SvgIcon component={Add} className={classes.serverStatusIcon} />
            </Typography>
          </Tooltip>,
        ];

  return (
    <div style={{ display: "inline-flex", flexDirection: "row", width: "100%", justifyContent: "space-between" }}>
      {componentsToShow}
    </div>
  );
}
