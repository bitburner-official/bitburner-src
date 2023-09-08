import { Player } from "@player";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";
import { BonusType, applySpecialBonus, bonuses } from "./BonusType";
import { WormEvents } from "./WormEvents";
import { AutomataData, AutomataFactory, evaluateInput, isCorrectInput, isValidInput } from "./Automata";

export class Worm {
	bonus: BonusType;
	data: AutomataData;

	completions = 0;

	processCount = 0;

	constructor() {
		this.bonus = bonuses[0];

		this.data = AutomataFactory(this.completions);
	}

	process(numCycles = 1) {
		this.updateMults();
		applySpecialBonus(this, numCycles);

		WormEvents.emit();
	}

	guessInput(input: string): string | null {
		console.log(input, this.data, evaluateInput(this.data, input));

		if (!isValidInput(this.data, input)) return null;
		if (!isCorrectInput(this.data, input)) return evaluateInput(this.data, input);

		this.data = AutomataFactory(++this.completions);

		return evaluateInput(this.data, input);
	}

	updateMults() {
		Player.reapplyMultipliers();
	}

	setBonus(bonus: BonusType) {
		this.bonus = bonus;
	}

	toJSON(): IReviverValue {
		return Generic_toJSON("Worm", this);
	}

	static fromJSON(value: IReviverValue): Worm {
    return Generic_fromJSON(Worm, value.data);
  }
}

constructorsForReviver.Worm = Worm;