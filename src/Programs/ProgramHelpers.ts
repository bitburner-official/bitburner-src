import { CompletedProgramName, Programs } from "./Programs";
import { Program } from "./Program";

import { Player } from "@player";

//Returns the programs this player can create.
export function getAvailableCreatePrograms(): Program[] {
  const programs: Program[] = [];
  for (const program of Object.values(CompletedProgramName)) {
    const create = Programs[program].create;
    // Non-creatable program
    if (create == null) continue;

    // Already has program
    if (Player.hasProgram(program)) continue;

    // Does not meet requirements
    if (!create.req()) continue;

    programs.push(Programs[program]);
  }

  return programs;
}
