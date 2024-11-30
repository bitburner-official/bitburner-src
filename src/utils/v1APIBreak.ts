import { AugmentationName } from "@enums";
import { PlayerOwnedAugmentation } from "../Augmentation/PlayerOwnedAugmentation";
import { Player } from "@player";
import { GetAllServers } from "../Server/AllServers";
import { resolveTextFilePath } from "../Paths/TextFilePath";
import { resolveScriptFilePath, type ScriptFilePath } from "../Paths/ScriptFilePath";

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

function convert(code: string): string {
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
  return code;
}

export function AwardNFG(n = 1): void {
  const nf = Player.augmentations.find((a) => a.name === AugmentationName.NeuroFluxGovernor);
  if (nf) {
    nf.level += n;
  } else {
    const nf = new PlayerOwnedAugmentation(AugmentationName.NeuroFluxGovernor);
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

      for (const script of server.scripts.values()) {
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

  const backupFiles = new Map<ScriptFilePath, string>();
  for (const server of GetAllServers()) {
    backupFiles.clear();
    for (const script of server.scripts.values()) {
      if (!hasChanges(script.code)) {
        continue;
      }
      // Sanitize first before combining
      const oldFilename = resolveScriptFilePath(script.filename);
      if (!oldFilename) {
        console.error(`Cannot resolve path for ${script.filename}`);
        continue;
      }
      const filename = resolveScriptFilePath("BACKUP_" + oldFilename);
      if (!filename) {
        console.error(`Cannot resolve backup path for ${script.filename}`);
        continue;
      }
      backupFiles.set(filename, script.code);
      script.code = convert(script.code);
    }
    for (const [filename, code] of backupFiles.entries()) {
      server.writeToScriptFile(filename, code);
    }
  }
}
