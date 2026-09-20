import { Player } from "@player";
import { CompletedProgramName } from "@enums";
import { Terminal } from "../../Terminal";
import type { BaseServer } from "../../Server/BaseServer";
import { Server } from "../../Server/Server";
import { DarknetServer } from "../../Server/DarknetServer";
import { GetServer } from "../../Server/AllServers";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { formatRam } from "../../ui/formatNumber";
import { Link } from "../OutputTypes";

export function scananalyze(args: (string | number | boolean)[]): undefined {
  if (args.length === 0) {
    executeScanAnalyzeCommand(1, false);
  } else {
    // # of args must be 2 or 3
    if (args.length > 2) {
      Terminal.error("Incorrect usage of scan-analyze command. usage: scan-analyze [depth]");
      return;
    }
    let all = false;
    if (args.length === 2 && args[1] === "-a") {
      all = true;
    }

    const depth = parseInt(args[0] + "");

    if (isNaN(depth) || depth < 0) {
      return Terminal.error("Incorrect usage of scan-analyze command. depth argument must be positive numeric");
    }
    if (
      depth > 3 &&
      !Player.hasProgram(CompletedProgramName.deepScan1) &&
      !Player.hasProgram(CompletedProgramName.deepScan2)
    ) {
      return Terminal.error("You cannot scan-analyze with that high of a depth. Maximum depth is 3");
    } else if (depth > 5 && !Player.hasProgram(CompletedProgramName.deepScan2)) {
      return Terminal.error("You cannot scan-analyze with that high of a depth. Maximum depth is 5");
    } else if (depth > 10) {
      return Terminal.error("You cannot scan-analyze with that high of a depth. Maximum depth is 10");
    }
    executeScanAnalyzeCommand(depth, all);
  }
}

function executeScanAnalyzeCommand(depth: number, all: boolean): void {
  interface Node {
    hostname: string;
    path: string[];
    children: Node[];
  }

  const showServer = (s: BaseServer, d: number): boolean => {
    if (d > depth) {
      return false;
    }
    if (s.purchasedByPlayer && s.hostname !== SpecialServers.Home) {
      // cloud servers, hacknet servers
      return all;
    }
    if (s instanceof DarknetServer && s.hostname !== SpecialServers.DarkWeb) {
      return all && s.hasAdminRights;
    }
    return true;
  };

  const makeNode = (root: BaseServer = Player.getCurrentServer()) => {
    // Keep track of previously seen servers to prevent backtracking (since darknet can be cyclical)
    const seenServers = [root.hostname];
    const populateNode = (s: BaseServer = root, path: string[] = [root.hostname], d = 1): Node => {
      seenServers.push(s.hostname);
      return {
        hostname: s.hostname,
        path,
        children: s.serversOnNetwork
          .filter((h) => !seenServers.includes(h))
          .map((s) => GetServer(s))
          .filter((v) => v != null)
          .filter((v) => showServer(v, d))
          .map((h) => populateNode(h, [...path, h.hostname], d + 1)),
      };
    };
    return populateNode();
  };

  const root = makeNode();

  const printOutput = (node: Node, prefix = ["  "], last = true) => {
    const titlePrefix = prefix.slice(0, prefix.length - 1).join("") + (last ? "┗ " : "┣ ");
    const infoPrefix = prefix.join("") + (node.children.length > 0 ? "┃   " : "    ");
    if (Player.hasProgram(CompletedProgramName.autoLink)) {
      Terminal.append(new Link(titlePrefix, node.path, node.hostname));
    } else {
      Terminal.print(titlePrefix + node.hostname + "\n");
    }

    const server = GetServer(node.hostname);
    if (!server) return;
    const hasRoot = server.hasAdminRights ? "YES" : "NO";
    if (server instanceof Server) {
      Terminal.print(
        `${infoPrefix}Root Access: ${hasRoot}, Required hacking skill: ${server.requiredHackingSkill}` + "\n",
      );
      Terminal.print(`${infoPrefix}Number of open ports required to NUKE: ${server.numOpenPortsRequired}` + "\n");
    } else {
      Terminal.print(`${infoPrefix}Root Access: ${hasRoot}` + "\n");
    }
    Terminal.print(`${infoPrefix}RAM: ${formatRam(server.maxRam)}` + "\n");
    node.children.forEach((n, i) =>
      printOutput(n, [...prefix, i === node.children.length - 1 ? "  " : "┃ "], i === node.children.length - 1),
    );
  };

  printOutput(root);
}
