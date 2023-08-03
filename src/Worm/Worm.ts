import { Player } from "@player";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";
import { BonusType } from "./BonusType";
import { Difficulty } from "./Difficulty";
import { difficulties } from "./data/difficulties";
import { WormEvents } from "./WormEvents";
import { isValidGuess } from "./helpers/calculations";

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
		if (this.storedCycles >= cyclesNeeded) {
			this.storedCycles -= cyclesNeeded;

			if (this.processCount++ % this.difficulty.windowBetweenChange === 0) this.updateFormula();

			this.updateMults();
		}

		WormEvents.emit();
	}

	resetFormula() {
		this.amplitudes = Array.from({ length: this.difficulty.formulasUsed }, () => Math.random());
	}

	updateFormula(numCycles = 1) {
		for (let i = 0; i < numCycles; i++) {
			const amount = this.difficulty.amountOfChange;
			const change = (prev: number) => Math.max(0, Math.min(1, prev + (amount * (Math.random() - 0.5) / 5)));
			this.amplitudes = this.amplitudes.map(change);
		}
	}

	updateMults() {
		Player.reapplyMultipliers();
	}

	setGuess(guess: number[]) {
		if (!isValidGuess(this, guess)) throw new Error("Not a valid guess.");
		this.guess = guess;
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