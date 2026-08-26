import { Terminal } from "../../Terminal";
import type { TerminalAction } from "../TerminalAction";
import { Player } from "@player";
import { HacknetServer } from "../../Hacknet/HacknetServer";
import { Server } from "../../Server/Server";
import { DarknetServer } from "../../Server/DarknetServer";
import { formatMoney, formatPercent, formatRam, formatSecurity } from "../../ui/formatNumber";
import { calculateHackingChance, calculateHackingTime } from "../../Hacking";
import { convertTimeMsToTimeElapsedString } from "../../utils/StringHelperFunctions";

export function analyze(args: (string | number | boolean)[]): undefined | TerminalAction {
  if (args.length !== 0) {
    Terminal.error("analyze 命令用法不正确。用法：analyze");
    return;
  }

  Terminal.print("正在分析系统...");
  const server = Player.getCurrentServer();
  return Terminal.timedAction(1, "analyze", () => {
    const isHacknet = server instanceof HacknetServer;
    Terminal.print(server.hostname + "：");
    const org = server.organizationName;
    Terminal.print("组织名称：" + (!isHacknet ? org : "玩家"));
    const hasAdminRights = (!isHacknet && server.hasAdminRights) || isHacknet;
    Terminal.print("Root 权限：" + (hasAdminRights ? "是" : "否"));
    const canRunScripts = hasAdminRights && server.maxRam > 0;
    Terminal.print("可在此主机上运行脚本：" + (canRunScripts ? "是" : "否"));
    Terminal.print("RAM：" + formatRam(server.maxRam));
    if (server instanceof DarknetServer && server.blockedRam) {
      Terminal.print("拥有者锁定的 RAM：" + formatRam(server.blockedRam));
      Terminal.print("停滞链接：" + (server.hasStasisLink ? "是" : "否"));
      Terminal.print("后门：" + (server.backdoorInstalled ? "是" : "否"));
    }
    if (server instanceof Server) {
      Terminal.print("后门：" + (server.backdoorInstalled ? "是" : "否"));
      const hackingSkill = server.requiredHackingSkill;
      Terminal.print("hack() 和 backdoor 所需的黑客等级：" + (!isHacknet ? hackingSkill : "N/A"));
      const security = server.hackDifficulty;
      Terminal.print("服务器安全等级：" + (!isHacknet ? formatSecurity(security) : "N/A"));
      const hackingChance = calculateHackingChance(server, Player);
      Terminal.print("入侵成功率：" + (!isHacknet ? formatPercent(hackingChance) : "N/A"));
      const hackingTime = calculateHackingTime(server, Player) * 1000;
      Terminal.print("入侵所需时间：" + (!isHacknet ? convertTimeMsToTimeElapsedString(hackingTime, true) : "N/A"));
    }
    Terminal.print(
      `服务器上可用资金总额：${server instanceof Server ? formatMoney(server.moneyAvailable, true) : "N/A"}`,
    );
    if (server instanceof Server) {
      const numPort = server.numOpenPortsRequired;
      Terminal.print("NUKE 所需的开放端口数：" + (!isHacknet ? numPort : "N/A"));
      Terminal.print("SSH 端口：" + (server.sshPortOpen ? "开放" : "关闭"));
      Terminal.print("FTP 端口：" + (server.ftpPortOpen ? "开放" : "关闭"));
      Terminal.print("SMTP 端口：" + (server.smtpPortOpen ? "开放" : "关闭"));
      Terminal.print("HTTP 端口：" + (server.httpPortOpen ? "开放" : "关闭"));
      Terminal.print("SQL 端口：" + (server.sqlPortOpen ? "开放" : "关闭"));
    }
  });
}
