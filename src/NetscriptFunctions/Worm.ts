import { Player } from "@player";

import { Worm as IWorm } from "@nsdefs";
import { NetscriptContext, InternalAPI } from "../Netscript/APIWrapper";
import { helpers } from "../Netscript/NetscriptHelpers";
import { Worm } from "../Worm/Worm";
import { calculateFitness, getGuessTime } from "../Worm/calculations";
import { arrayToString } from "../utils/helpers/ArrayHelpers";
import { difficulties } from "../Worm/Difficulty";
import { bonuses } from "../Worm/BonusType";

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
		getLength: (ctx) => () => {
			checkWormAPIAccess(ctx);
			return getWorm().length;
		},
		getCurrentFitness: (ctx) => () => {
			checkWormAPIAccess(ctx);
			return calculateFitness(getWorm());
		},
		setGuess: (ctx) => (_guess) => {
			checkWormAPIAccess(ctx);
			const guess = helpers.array(ctx, "guess", _guess, helpers.number);
			const time = getGuessTime(ctx.workerScript.scriptRef.threads);
			return helpers.netscriptDelay(ctx, time).then(() => {
				getWorm().setGuess(guess);
				helpers.log(ctx, () => `Set guess to ${arrayToString(guess)}`);
				return Promise.resolve(calculateFitness(getWorm()));
			});
		},
		getCurrentGuess: (ctx) => () => {
			checkWormAPIAccess(ctx);
			const guess = getWorm().guess;
			return guess;
		},
		setDifficulty: (ctx) => (_difficulty) => {
			checkWormAPIAccess(ctx);
			const difficulty = helpers.number(ctx, "difficulty", _difficulty);
			const value = difficulties.find(d => d.id === difficulty);
			if (value === undefined) throw new Error(`Value "${difficulty}" is not a valid difficulty. Valid: ${difficulties.map(d => d.id.toString()).join(", ")}`);
			getWorm().setDifficulty(value);
		},
		setBonus: (ctx) => (_bonus) => {
			checkWormAPIAccess(ctx);
			const bonus = helpers.number(ctx, "bonus", _bonus);
			const value = bonuses.find(b => b.id === bonus);
			if (value === undefined) throw new Error(`Value "${bonus}" is not a valid bonus. Valid: ${bonuses.map(d => d.id.toString()).join(", ")}`);
			getWorm().setBonus(value);
		}
  }
}
