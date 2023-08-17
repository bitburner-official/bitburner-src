import { Player } from "@player";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";
import { BonusType, bonuses } from "./BonusType";
import { difficulties, DifficultyType } from "./Difficulty";
import { WormEvents } from "./WormEvents";
import { checkValidGuess, formatWormNumber } from "./calculations";
import { FormulaData, FormulaDataFactory, updateFormulaData } from "./Formula";

export class Worm {
	length = 16;
	minValue = -1;
	maxValue = 1;
	
	baseTime = 20;
	difficulty: DifficultyType;
	bonus: BonusType;
	
	formulaData: FormulaData;

	guess: number[];

	processCount = 0;

	constructor() {
		this.guess = Array.from({ length: this.length }, () => 0);

		this.difficulty = difficulties[0];
		this.bonus = bonuses[0];
		
		this.formulaData = FormulaDataFactory(this.numFormulas);
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
			(1 + Math.log10(Player.sourceFileLvl(16)))
		);
	}

	get numFormulas() {
		return Math.pow(2, 4 + this.difficulty.complexity);
	}

	resetFormula() {
		this.formulaData = FormulaDataFactory(this.numFormulas);
	}

	updateFormula(numCycles = 1) {
		for (let i = 0; i < numCycles; i++) updateFormulaData(this.formulaData, this.difficulty.amountOfChange);

		console.log(this.formulaData);
	}

	updateMults() {
		Player.reapplyMultipliers();
	}

	setGuess(guess: number[]) {
		checkValidGuess(this, guess);
		this.guess = guess.map(formatWormNumber);
	}

	setDifficulty(difficulty: DifficultyType) {
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