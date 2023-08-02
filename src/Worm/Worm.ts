import { Player } from "@player";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";
import { BonusType } from "./BonusType";
import { Difficulty } from "./Difficulty";
import { difficulties } from "./data/difficulties";

export class Worm {
	wormLength = 16;
	minValue = 0;
	maxValue = 1;

	guess: number[];
	difficulty: Difficulty;
	bonus: BonusType;

	storedCycles = 0;
	processCount = 0;

	constructor() {
		this.guess = Array.from({ length: this.wormLength }, () => 0);
		this.bonus = BonusType.None;

		// needed because ts complains
		this.difficulty = difficulties[0];

		this.setDifficulty(difficulties[0]);
	}

	process(numCycles = 1) {
		this.storedCycles += numCycles;

		const cyclesNeeded = 50;
		if (this.storedCycles < cyclesNeeded) return;
		this.storedCycles -= cyclesNeeded;
		this.processCount++;

		this.updateMults();
	}

	updateMults() {
		Player.reapplyMultipliers();
	}

	setGuess(guess: number[]) {
		// if new guess is too short, pad 0s at the start. If new guess is too long, remvoe the end
		this.guess = [
			...Array.from({ length: Math.max(0, this.wormLength - guess.length) }, () => 0),
			...guess.slice(0, this.wormLength)
		];
	}

	setDifficulty(difficulty: Difficulty) {
		this.difficulty = difficulty;
		// in future, might include setting formulas
	}

	toJSON(): IReviverValue {
		return Generic_toJSON("Worm", this);
	}

	static fromJSON(value: IReviverValue): Worm {
    return Generic_fromJSON(Worm, value.data);
  }
}

constructorsForReviver.Worm = Worm;