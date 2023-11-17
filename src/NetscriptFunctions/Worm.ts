import { Player } from "@player";

import { Worm as IWorm } from "@nsdefs";
import { NetscriptContext, InternalAPI } from "../Netscript/APIWrapper";
import { helpers } from "../Netscript/NetscriptHelpers";
import { Worm } from "../Worm/Worm";
import { bonuses } from "../Worm/BonusType";
import { getGuessTime } from "../Worm/calculations";
import { isValidInput } from "../Worm/Automata";

export function NetscriptWorm(): InternalAPI<IWorm> {
  function checkWormAPIAccess(ctx: NetscriptContext): void {
    if (Player.worm === null) {
      throw helpers.makeRuntimeErrorMsg(ctx, "You have no access to the Worm API", "API ACCESS");
    }
  }

	function getWorm(): Worm {
		if (Player.worm === null) throw new Error("Cannot get worm. Player.worm is null");
		return Player.worm;
	}

  return {
		setBonus: (ctx) => (_bonus) => {
			checkWormAPIAccess(ctx);
			const bonus = helpers.number(ctx, "bonus", _bonus);
			const value = bonuses.find(b => b.id === bonus);
			if (value === undefined) throw new Error(`Value "${bonus}" is not a valid bonus. Valid: ${bonuses.map(d => d.id.toString()).join(", ")}`);
			getWorm().setBonus(value);
		},
		getCompletions: (ctx) => () => {
			checkWormAPIAccess(ctx);
			return getWorm().completions;
		},
		getWormStates: (ctx) => () => {
			checkWormAPIAccess(ctx);
			return [...getWorm().data.states];
		},
		getWormSymbols: (ctx) => () => {
			checkWormAPIAccess(ctx);
			return [...getWorm().data.symbols];
		},
		getChosenNodes: (ctx) => () => {
			checkWormAPIAccess(ctx);
			return [...getWorm().chosenNodes];
		},
		getGuessTime: (ctx) => (_threads) => {
			checkWormAPIAccess(ctx);
			const threads = helpers.number(ctx, "threads", _threads);
			return getGuessTime(threads);
		},
		testInput: (ctx) => (_input) => {
			checkWormAPIAccess(ctx);
			const input = helpers.string(ctx, "input", _input);
			if (!isValidInput(getWorm().data, input)) throw new Error(`input "${input} uses invalid symbols."`);
			return helpers.netscriptDelay(ctx, getGuessTime(ctx.workerScript.scriptRef.threads)).then(() => {
				const finalState = getWorm().evaluate(input);
				if (finalState === null) throw new Error(`Error while computing input "${input}", got null.`);
				return Promise.resolve(finalState);
			});
		},
		attemptSolve: (ctx) => (_properties) => {
			checkWormAPIAccess(ctx);
			const properties = helpers.wormInputArray(ctx, "properties", _properties);
			const result = getWorm().solve(properties);
			return result;
		}
  }
}
