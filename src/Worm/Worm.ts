import { Player } from "@player";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";
import { BonusType, applySpecialBonus, bonuses } from "./BonusType";
import { WormEvents } from "./WormEvents";
import { AutomataData, AutomataFactory, evaluateInput, isValidInput } from "./Automata";
import { WormInputArray } from "@nsdefs";

export class Worm {
	bonus: BonusType;
	data: AutomataData;
	/**[0] = values, [1] = indegrees */
	chosenNodes: [string, string];

	completions = 0;

	processCount = 0;

	constructor() {
		this.bonus = bonuses[0];

		[this.data, this.chosenNodes] = AutomataFactory(this.completions);
	}

	process(numCycles = 1) {
		this.updateMults();
		applySpecialBonus(this, numCycles);

		console.log(this);

		WormEvents.emit();
	}

	evaluate(input: string): string | null {
		if (!isValidInput(this.data, input)) return null;

		return evaluateInput(this.data, input);
	}

	solve(providedProperties: WormInputArray)  {
		const comparisons = [
			providedProperties[0] === this.data.properties.isBipartite,
			providedProperties[1] === this.data.properties.shortestInput,
			providedProperties[2] === this.data.properties.nodeValues[this.chosenNodes[0]],
			providedProperties[3] === this.data.properties.nodeIndegrees[this.chosenNodes[1]]
		];

		const amountCorrect = comparisons.filter(b => b).length;

		if (amountCorrect < comparisons.length * 0.7) return false;

		this.completions += amountCorrect / comparisons.length;
		[this.data, this.chosenNodes] = AutomataFactory(this.completions);

		return true;
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