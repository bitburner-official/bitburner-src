import { DarkWebItem } from "./DarkWebItem";
import { CompletedProgramName } from "@enums";

export const DarkWebItems = {
  BruteSSHProgram: new DarkWebItem(CompletedProgramName.bruteSsh, 500e3, "Opens up SSH Ports."),
  FTPCrackProgram: new DarkWebItem(CompletedProgramName.ftpCrack, 1500e3, "Opens up FTP Ports."),
  RelaySMTPProgram: new DarkWebItem(CompletedProgramName.relaySmtp, 5e6, "Opens up SMTP Ports."),
  HTTPWormProgram: new DarkWebItem(CompletedProgramName.httpWorm, 30e6, "Opens up HTTP Ports."),
  SQLInjectProgram: new DarkWebItem(CompletedProgramName.sqlInject, 250e6, "Opens up SQL Ports."),
  ServerProfiler: new DarkWebItem(CompletedProgramName.serverProfiler, 500e3, "Displays detailed server information."),
  DeepscanV1: new DarkWebItem(CompletedProgramName.deepScan1, 500000, "Enables 'scan-analyze' with a depth up to 5."),
  DeepscanV2: new DarkWebItem(CompletedProgramName.deepScan2, 25e6, "Enables 'scan-analyze' with a depth up to 10."),
  AutolinkProgram: new DarkWebItem(CompletedProgramName.autoLink, 1e6, "Enables direct connect via 'scan-analyze'."),
  FormulasProgram: new DarkWebItem(CompletedProgramName.formulas, 5e9, "Unlock access to the formulas API."),
};
