import { DarknetConstants } from "../DarkNet/Constants";
import { DarkWebItem } from "./DarkWebItem";
import { CompletedProgramName } from "@enums";

export const DarkWebItems = {
  BruteSSHProgram: new DarkWebItem(CompletedProgramName.bruteSsh, 500e3, "打开 SSH 端口。"),
  FTPCrackProgram: new DarkWebItem(CompletedProgramName.ftpCrack, 1500e3, "打开 FTP 端口。"),
  RelaySMTPProgram: new DarkWebItem(CompletedProgramName.relaySmtp, 5e6, "打开 SMTP 端口。"),
  HTTPWormProgram: new DarkWebItem(CompletedProgramName.httpWorm, 30e6, "打开 HTTP 端口。"),
  SQLInjectProgram: new DarkWebItem(CompletedProgramName.sqlInject, 250e6, "打开 SQL 端口。"),
  ServerProfiler: new DarkWebItem(CompletedProgramName.serverProfiler, 500e3, "显示详细的服务器信息。"),
  DeepscanV1: new DarkWebItem(CompletedProgramName.deepScan1, 500000, "启用深度最高为 5 的 'scan-analyze'。"),
  DeepscanV2: new DarkWebItem(CompletedProgramName.deepScan2, 25e6, "启用深度最高为 10 的 'scan-analyze'。"),
  AutolinkProgram: new DarkWebItem(CompletedProgramName.autoLink, 1e6, "允许通过 'scan-analyze' 直接连接。"),
  DarkScapeProgram: new DarkWebItem(
    CompletedProgramName.darkscape,
    DarknetConstants.DarkscapeNavigatorPrice,
    "解锁暗网（Dark Net）的访问权限。",
  ),
  FormulasProgram: new DarkWebItem(CompletedProgramName.formulas, 5e9, "解锁 formulas API 的访问权限。"),
};
