import { Player } from "@player";
import { CompletedProgramName } from "@enums";
import { Terminal } from "../../Terminal";
import type { BaseServer } from "../../Server/BaseServer";
import { HacknetServer } from "../../Hacknet/HacknetServer";
import { Server } from "../../Server/Server";
import { DarknetServer } from "../../Server/DarknetServer";
import { GetServer } from "../../Server/AllServers";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { formatRam } from "../../ui/formatNumber";
import { Link } from "../OutputTypes";
import { StdIO } from "../StdIO/StdIO";

export function scananalyze(args: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): undefined {
  if (args.length === 0) {
    executeScanAnalyzeCommand(1, false, stdIO);
  } else {
    // # of args must be 2 or 3
    if (args.length > 2) {
      Terminal.fatal("Incorrect usage of scan-analyze command. usage: scan-analyze [depth]", stdIO);
      return;
    }
    let all = false;
    if (args.length === 2 && args[1] === "-a") {
      all = true;
    }

    const depth = parseInt(args[0] + "");

    if (isNaN(depth) || depth < 0) {
      return Terminal.fatal("Incorrect usage of scan-analyze command. depth argument must be positive numeric", stdIO);
    }
    if (
      depth > 3 &&
      !Player.hasProgram(CompletedProgramName.deepScan1) &&
      !Player.hasProgram(CompletedProgramName.deepScan2)
    ) {
      return Terminal.fatal("You cannot scan-analyze with that high of a depth. Maximum depth is 3", stdIO);
    } else if (depth > 5 && !Player.hasProgram(CompletedProgramName.deepScan2)) {
      return Terminal.fatal("You cannot scan-analyze with that high of a depth. Maximum depth is 5", stdIO);
    } else if (depth > 10) {
      return Terminal.fatal("You cannot scan-analyze with that high of a depth. Maximum depth is 10", stdIO);
    }
    executeScanAnalyzeCommand(depth, all, stdIO);
  }
}

function executeScanAnalyzeCommand(depth: number, all: boolean, stdIO: StdIO): void {
  interface Node {
    hostname: string;
    children: Node[];
  }

  const ignoreServer = (s: BaseServer, d: number): boolean =>
    (!all && s.purchasedByPlayer && s.hostname != "home") ||
    d > depth ||
    (!all && s instanceof HacknetServer) ||
    (!all && s instanceof DarknetServer && s.hostname !== SpecialServers.DarkWeb);

  const makeNode = (root: BaseServer = Player.getCurrentServer()) => {
    // Keep track of previously seen servers to prevent backtracking (since darknet can be cyclical)
    const seenServers = [root.hostname];
    const populateNode = (s: BaseServer, d = 1): Node => {
      seenServers.push(s.hostname);
      return {
        hostname: s.hostname,
        children: s.serversOnNetwork
          .filter((h) => !seenServers.includes(h))
          .map((s) => GetServer(s))
          .filter((v): v is BaseServer => !!v)
          .filter((v) => !ignoreServer(v, d))
          .map((h) => populateNode(h, d + 1)),
      };
    };
    return populateNode(root);
  };

  const root = makeNode();

  const printOutput = (node: Node, prefix = ["  "], last = true) => {
    const titlePrefix = prefix.slice(0, prefix.length - 1).join("") + (last ? "┗ " : "┣ ");
    const infoPrefix = prefix.join("") + (node.children.length > 0 ? "┃   " : "    ");
    if (Player.hasProgram(CompletedProgramName.autoLink)) {
      Terminal.printRaw(new Link(titlePrefix, node.hostname), stdIO);
    } else {
      Terminal.print(titlePrefix + node.hostname + "\n", stdIO);
    }

    const server = GetServer(node.hostname);
    if (!server) return;
    const hasRoot = server.hasAdminRights ? "YES" : "NO";
    if (server instanceof Server) {
      Terminal.print(
        `${infoPrefix}Root Access: ${hasRoot}, Required hacking skill: ${server.requiredHackingSkill}` + "\n",
        stdIO,
      );
      Terminal.print(
        `${infoPrefix}Number of open ports required to NUKE: ${server.numOpenPortsRequired}` + "\n",
        stdIO,
      );
    } else {
      Terminal.print(`${infoPrefix}Root Access: ${hasRoot}` + "\n", stdIO);
    }
    Terminal.print(`${infoPrefix}RAM: ${formatRam(server.maxRam)}` + "\n", stdIO);
    node.children.forEach((n, i) =>
      printOutput(n, [...prefix, i === node.children.length - 1 ? "  " : "┃ "], i === node.children.length - 1),
    );
  };

  printOutput(root);
}
