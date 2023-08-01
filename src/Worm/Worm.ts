import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";
import { BonusType } from "./BonusType";
import { Difficulty } from "./Difficulty";
import { difficulties } from "./data/difficulties";
import { calculateFitness } from "./helpers/calculations";

export class Worm {
	wormLength = 1024;

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

		this.applyBonus();
	}

	setGuess(guess: number[]) {
		this.guess = [
			...Array.from({ length: Math.max(0, this.wormLength - guess.length) }, () => 0),
			...guess.slice(0, this.wormLength)
		];
	}

	calculateBonus() {
		const fitness = calculateFitness(this);
		const bonus = fitness; // * 15 * this.difficulty.bonusMultiplier;
		return bonus;
	}

	applyBonus() {
		const bonus = this.calculateBonus();

		console.log("APPLY BONUS", bonus);
	}

	setDifficulty(difficulty: Difficulty) {
		this.difficulty = difficulty;
	}

	toJSON(): IReviverValue {
		return Generic_toJSON("Worm", this);
	}

	static fromJSON(value: IReviverValue): Worm {
    return Generic_fromJSON(Worm, value.data);
  }
}

constructorsForReviver.Worm = Worm;