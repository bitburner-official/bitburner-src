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
      throw helpers.makeRuntimeErrorMsg(ctx, "No access to worm api");
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
		getStates: (ctx) => () => {
			checkWormAPIAccess(ctx);
			return [...getWorm().data.states];
		},
		getSymbols: (ctx) => () => {
			checkWormAPIAccess(ctx);
			return [...getWorm().data.symbols];
		},
		getGuessTime: (ctx) => (_threads) => {
			checkWormAPIAccess(ctx);
			const threads = helpers.number(ctx, "threads", _threads);
			return getGuessTime(threads);
		},
		guessInput: (ctx) => (_input) => {
			checkWormAPIAccess(ctx);
			const input = helpers.string(ctx, "input", _input);
			if (!isValidInput(getWorm().data, input)) throw new Error(`input "${input} uses invalid symbols."`);
			return helpers.netscriptDelay(ctx, getGuessTime(ctx.workerScript.scriptRef.threads)).then(() => {
				const finalState = getWorm().guessInput(input);
				if (finalState === null) throw new Error(`Error while computing input "${input}", got null.`);
				helpers.log(ctx, () => `Given input is ${getWorm().data.targetStates.includes(finalState) ? "correct" : "wrong"}.`);
				return Promise.resolve(finalState);
			});
		}
  }
}
