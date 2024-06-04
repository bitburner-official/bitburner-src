import { dialogBoxCreate } from "../ui/React/DialogBox";
import { constructorsForReviver, Generic_toJSON, Generic_fromJSON, IReviverValue } from "../utils/JSONReviver";
import { CompletedProgramName } from "@enums";
import { CONSTANTS } from "../Constants";
import { Player } from "@player";
import { Programs } from "../Programs/Programs";
import { Work, WorkType } from "./Work";
import { Program } from "../Programs/Program";
import { calculateIntelligenceBonus } from "../PersonObjects/formulas/intelligence";
import { asProgramFilePath } from "../Paths/ProgramFilePath";

export const isCreateProgramWork = (w: Work | null): w is CreateProgramWork =>
  w !== null && w.type === WorkType.CREATE_PROGRAM;

interface CreateProgramWorkParams {
  programName: CompletedProgramName;
  singularity: boolean;
}

export class CreateProgramWork extends Work {
  programName: CompletedProgramName;
  // amount of effective work completed on the program (time boosted by skills).
  unitCompleted: number;
  unitRate: number;
  constructor(params?: CreateProgramWorkParams) {
    super(WorkType.CREATE_PROGRAM, params?.singularity ?? true);
    this.unitCompleted = 0;
    this.unitRate = 0;
    this.programName = params?.programName ?? CompletedProgramName.bruteSsh;

    if (params) {
      for (let i = 0; i < Player.getHomeComputer().programs.length; ++i) {
        const programFile = Player.getHomeComputer().programs[i];
        if (programFile.startsWith(this.programName) && programFile.endsWith("%-INC")) {
          const res = programFile.split("-");
          if (res.length != 3) {
            break;
          }
          const percComplete = Number(res[1].slice(0, -1));
          if (isNaN(percComplete) || percComplete < 0 || percComplete >= 100) {
            break;
          }
          this.unitCompleted = (percComplete / 100) * this.unitNeeded();
          Player.getHomeComputer().programs.splice(i, 1);
        }
      }
    }
  }

  unitNeeded(): number {
    return this.getProgram().create?.time ?? 0;
  }

  getProgram(): Program {
    return Programs[this.programName];
  }

  process(cycles: number): boolean {
    const focusBonus = Player.focusPenalty();
    //Higher hacking skill will allow you to create programs faster
    const reqLvl = this.getProgram().create?.level ?? 0;
    let skillMult = (Player.skills.hacking / reqLvl) * calculateIntelligenceBonus(Player.skills.intelligence, 3); //This should always be greater than 1;
    skillMult = 1 + (skillMult - 1) / 5; //The divider constant can be adjusted as necessary
    skillMult *= focusBonus;
    //Skill multiplier directly applied to "time worked"
    this.cyclesWorked += cycles;
    this.unitRate = CONSTANTS.MilliPerCycle * cycles * skillMult;
    this.unitCompleted += this.unitRate;

    if (this.unitCompleted >= this.unitNeeded()) {
      return true;
    }
    return false;
  }
  finish(cancelled: boolean, suppressDialog?: boolean): void {
    const programName = asProgramFilePath(this.programName);
    if (!cancelled) {
      //Complete case
      Player.gainIntelligenceExp(
        (CONSTANTS.IntelligenceProgramBaseExpGain * this.cyclesWorked * CONSTANTS.MilliPerCycle) / 1000,
      );
      if (!this.singularity && !suppressDialog) {
        const lines = [
          `You've finished creating ${programName}!`,
          "The new program can be found on your home computer.",
        ];
        dialogBoxCreate(lines.join("\n"));
      }

      if (!Player.getHomeComputer().programs.includes(programName)) {
        Player.getHomeComputer().programs.push(programName);
      }
    } else if (!Player.getHomeComputer().programs.includes(programName)) {
      //Incomplete case
      const perc = ((100 * this.unitCompleted) / this.unitNeeded()).toFixed(2);
      const incompleteName = asProgramFilePath(programName + "-" + perc + "%-INC");
      Player.getHomeComputer().programs.push(incompleteName);
    }
  }

  APICopy() {
    return {
      type: WorkType.CREATE_PROGRAM as const,
      cyclesWorked: this.cyclesWorked,
      programName: this.programName,
    };
  }

  /** Serialize the current object to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("CreateProgramWork", this);
  }

  /** Initializes a CreateProgramWork object from a JSON save state. */
  static fromJSON(value: IReviverValue): CreateProgramWork {
    return Generic_fromJSON(CreateProgramWork, value.data);
  }
}

constructorsForReviver.CreateProgramWork = CreateProgramWork;
