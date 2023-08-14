import { Player } from "@player";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";
import { BonusType } from "./BonusType";
import { Difficulty } from "./Difficulty";
import { difficulties } from "./data/difficulties";
import { WormEvents } from "./WormEvents";
import { checkValidGuess, formatWormNumber } from "./helpers/calculations";

export class Worm {
	length = 16;
	minValue = -1;
	maxValue = 1;
	
	baseTime = 20;
	difficulty: Difficulty = difficulties[0];
	bonus: BonusType = BonusType.None;
	
	frequency = 0.1;
	amplitude = 1;
	shift = 1;
	amplitudes: number[] = [];
	guess: number[];

	processCount = 0;

	constructor() {
		this.guess = Array.from({ length: this.length }, () => 0);

		this.setDifficulty(difficulties[0]);
	}

	process() {
		if (++this.processCount % this.processCountBetweenChanges === 0) this.updateFormula();
		this.updateMults();

		WormEvents.emit();
	}

	get processCountBetweenChanges() {
		return Math.ceil(
			this.baseTime *
			this.difficulty.windowBetweenChange *
			(1 + Math.log10(Player.sourceFileLvl(16))));
	}

	resetFormula() {
		this.amplitudes = Array.from({ length: Math.pow(2, 5 + this.difficulty.complexity) }, () => Math.random());
		this.shift = Math.random() * Math.PI * 2 / this.frequency;
	}

	updateFormula(numCycles = 1) {
		for (let i = 0; i < numCycles; i++) {
			const amount = this.difficulty.amountOfChange;
			const change = (prev: number) => Math.max(0, Math.min(1, prev + (amount * (Math.random() - 0.5) / 5)));
			this.amplitudes = this.amplitudes.map(change);
		}

		console.log(this.amplitudes);
	}

	updateMults() {
		Player.reapplyMultipliers();
	}

	setGuess(guess: number[]) {
		checkValidGuess(this, guess);
		this.guess = guess.map(formatWormNumber);
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