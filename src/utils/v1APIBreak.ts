import { AugmentationNames } from "../Augmentation/data/AugmentationNames";
import { PlayerOwnedAugmentation } from "../Augmentation/PlayerOwnedAugmentation";
import { Player } from "@player";
import { FormattedCode, Script } from "../Script/Script";
import { GetAllServers } from "../Server/AllServers";
import { resolveTextFilePath } from "../Paths/TextFilePath";
import { resolveScriptFilePath } from "../Paths/ScriptFilePath";

const detect: [string, string][] = [
  ["getHackTime", "returns milliseconds"],
  ["getGrowTime", "returns milliseconds"],
  ["getWeakenTime", "returns milliseconds"],
  ["getActionTime", "returns milliseconds"],
  ["hackAnalyzePercent", "renamed 'hackAnalyze' and returns decimal"],
  ["hackChance", "renamed 'hackAnalyzeChance'"],
  ["basic.calculateSkill", "renamed 'skills.calculateSkill'"],
  ["basic.calculateExp", "renamed 'skills.calculateExp'"],
  ["basic.hackChance", "renamed 'hacking.hackChance'"],
  ["basic.hackExp", "renamed 'hacking.hackExp'"],
  ["basic.hackPercent", "renamed 'hacking.hackPercent'"],
  ["basic.growPercent", "renamed 'hacking.growPercent'"],
  ["basic.hackTime", "renamed 'hacking.hackTime'"],
  ["basic.growTime", "renamed 'hacking.growTime'"],
  ["basic.weakenTime", "renamed 'hacking.weakenTime'"],
  ["write", "needs to be awaited"],
  ["scp", "needs to be awaited"],
  ["sleep", "Can no longer be called simultaneously."],
  ["hacking_skill", "renamed 'hacking'"],
  ["tryWrite", "renamed 'tryWritePort'"],
];

const changes: [RegExp, string][] = [
  [/ns.getHackTime/g, "((...a)=>ns.getHackTime(...a)/1000)"],
  [/ns.getGrowTime/g, "((...a)=>ns.getGrowTime(...a)/1000)"],
  [/ns.getWeakenTime/g, "((...a)=>ns.getWeakenTime(...a)/1000)"],
  [/ns.bladeburner.getActionTime/g, "((...a)=>ns.bladeburner.getActionTime(...a)/1000)"],
  [/ns.hackAnalyzePercent/g, "((...a)=>ns.hackAnalyze(...a)*100)"],
  [/ns.hackChance/g, "ns.hackAnalyzeChance"],
  [/ns.tryWrite/g, "ns.tryWritePort"],
  [/formulas.basic.calculateSkill/g, "formulas.skills.calculateSkill"],
  [/formulas.basic.calculateExp/g, "formulas.skills.calculateExp"],
  [/formulas.basic.hackChance/g, "formulas.hacking.hackChance"],
  [/formulas.basic.hackExp/g, "formulas.hacking.hackExp"],
  [/formulas.basic.hackPercent/g, "formulas.hacking.hackPercent"],
  [/formulas.basic.growPercent/g, "formulas.hacking.growPercent"],
  [/formulas.basic.hackTime/g, "formulas.hacking.hackTime"],
  [/formulas.basic.growTime/g, "formulas.hacking.growTime"],
  [/formulas.basic.weakenTime/g, "formulas.hacking.weakenTime"],
];
function hasChanges(code: string): boolean {
  for (const change of changes) {
    if (code.match(change[0])) return true;
  }
  return false;
}

function convert(code: string): FormattedCode {
  const lines = code.split("\n");
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const orig = lines[i];
    let line = lines[i];
    for (const change of changes) {
      line = line.replace(change[0], change[1]);
    }
    if (line != orig) {
      out.push(`// =============================== original line ===============================`);
      out.push(`/**`);
      out.push(` * ${orig}`);
      out.push(" */");
      out.push(`// =============================================================================`);
    }
    out.push(line);
  }
  code = out.join("\n");
  return Script.formatCode(code);
}

export function AwardNFG(n = 1): void {
  const nf = Player.augmentations.find((a) => a.name === AugmentationNames.NeuroFluxGovernor);
  if (nf) {
    nf.level += n;
  } else {
    const nf = new PlayerOwnedAugmentation(AugmentationNames.NeuroFluxGovernor);
    nf.level = n;
    Player.augmentations.push(nf);
  }
}

export interface IFileLine {
  file: string;
  line: number;
  content: string;
}

export function v1APIBreak(): void {
  let txt = "";
  for (const server of GetAllServers()) {
    for (const change of detect) {
      const s: IFileLine[] = [];
      const scriptsArray: Script[] = Array.isArray(server.scripts)
        ? (server.scripts as Script[])
        : [...server.scripts.values()];

      for (const script of scriptsArray) {
        const lines = script.code.split("\n");
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(change[0])) {
            s.push({
              file: script.filename,
              line: i + 1,
              content: "",
            });
          }
        }
      }

      if (s.length === 0) continue;

      txt += `// Detected change ${change[0]}, reason: ${change[1]}\n`;
      for (const fl of s) {
        txt += `${fl.file}:${fl.line}\n`;
      }
    }
  }
  if (txt !== "") {
    const home = Player.getHomeComputer();
    const textPath = resolveTextFilePath("v1_DETECTED_CHANGES.txt");
    if (!textPath) return console.error("Filepath unexpectedly failed to parse");
    home.writeToTextFile(textPath, txt);
  }

  // API break function is called before version31 / 2.3.0 changes - scripts is still an array
  for (const server of GetAllServers() as unknown as { scripts: Script[] }[]) {
    const backups: Script[] = [];
    for (const script of server.scripts) {
      if (!hasChanges(script.code)) continue;
      // Sanitize first before combining
      const oldFilename = resolveScriptFilePath(script.filename);
      const filename = resolveScriptFilePath("BACKUP_" + oldFilename);
      if (!filename) {
        console.error(`Unexpected error resolving backup path for ${script.filename}`);
        continue;
      }
      backups.push(new Script(filename, script.code, script.server));
      script.code = convert(script.code);
    }
    server.scripts = server.scripts.concat(backups);
  }
}
