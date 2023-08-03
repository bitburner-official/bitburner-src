import { Player } from "@player";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";
import { BonusType } from "./BonusType";
import { Difficulty } from "./Difficulty";
import { difficulties } from "./data/difficulties";
import { WormEvents } from "./WormEvents";

export class Worm {
	length = 16;
	minValue = -1;
	maxValue = 1;
	
	difficulty: Difficulty = difficulties[0];
	bonus: BonusType = BonusType.None;
	
	frequency = 0.1;
	amplitude = 1;
	amplitudes: number[] = [];
	guess: number[];

	storedCycles = 0;
	processCount = 0;

	constructor() {
		this.guess = Array.from({ length: this.length }, () => 0);

		this.setDifficulty(difficulties[0]);
	}

	process(numCycles = 1) {
		this.storedCycles += numCycles;

		const cyclesNeeded = 50;
		if (this.storedCycles < cyclesNeeded) return;
		this.storedCycles -= cyclesNeeded;
		this.processCount++;

		this.updateMults();

		WormEvents.emit();
	}

	resetFormula() {
		this.amplitudes = Array.from({ length: this.difficulty.formulasUsed }, () => Math.random());
	}

	updateMults() {
		Player.reapplyMultipliers();
	}

	setGuess(guess: number[]) {
		// if new guess is too short, pad 0s at the start. If new guess is too long, remvoe the end
		this.guess = [
			...Array.from({ length: Math.max(0, this.length - guess.length) }, () => 0),
			...guess.slice(0, this.length)
		];
	}

	setDifficulty(difficulty: Difficulty) {
		this.difficulty = difficulty;
		this.resetFormula();
	}

	toJSON(): IReviverValue {
		return Generic_toJSON("Worm", this);
	}

	static fromJSON(value: IReviverValue): Worm {
    return Generic_fromJSON(Worm, value.data);
  }
}

constructorsForReviver.Worm = Worm;