import { Bladeburner } from "../../../src/Bladeburner/Bladeburner";
import { PlayerObject } from "../../../src/PersonObjects/Player/PlayerObject";
import { Player, setPlayer } from "@player";
import { BlackOperation, Contract, GeneralAction, Operation } from "../../../src/Bladeburner/Actions";
import {
  BladeburnerActionType,
  BladeburnerContractName,
  BladeburnerGeneralActionName,
  BladeburnerOperationName,
  CityName,
  CrimeType,
} from "@enums";
import { FormatsNeedToChange } from "../../../src/ui/formatNumber";
import { CrimeWork } from "../../../src/Work/CrimeWork";
import type { Action, ActionIdentifier } from "../../../src/Bladeburner/Types";
import type { Skills } from "@nsdefs";
import { BlackOperations } from "../../../src/Bladeburner/data/BlackOperations";

describe("Bladeburner Actions", () => {
  const SampleContract = Contract.createId(BladeburnerContractName.Tracking);
  const SampleGeneralAction = GeneralAction.createId(BladeburnerGeneralActionName.Diplomacy);
  const SampleOperation = Operation.createId(BladeburnerOperationName.Assassination);
  const SampleBlackOp = BlackOperations["Operation Centurion"].id;

  const ENOUGH_TIME_TO_FINISH_ACTION = 1e5;
  const BASE_STAT_EXP = 1e6;

  let bb: Bladeburner;

  const cities = <CityName[]>Object.keys(new Bladeburner().cities);

  const contracts = Object.values(new Bladeburner().contracts);
  const operations = Object.values(new Bladeburner().operations);
  const nonGeneralActions = [contracts, operations, Object.values(BlackOperations)].flat();

  describe("Without Simulacrum", () => {
    it("Starting an action cancels player's work immediately", () => {
      Player.startWork(new CrimeWork({ crimeType: CrimeType.assassination, singularity: false }));
      start(SampleGeneralAction);
      expect(Player.currentWork).toBeNull();
    });
  });

  describe("Upon successful completion", () => {
    /** Repetitive snapshot declarations in most tests below */
    let pop, before, after;

    describe(BladeburnerGeneralActionName.Training, () => {
      const train = GeneralAction.createId(BladeburnerGeneralActionName.Training);

      it("increases max stamina", () => {
        before = bb.maxStamina;
        complete(train);
        expect(bb.maxStamina).toBeGreaterThan(before);
      });

      it.each(<(keyof Skills)[]>["strength", "dexterity", "agility"])("awards %s exp", (stat: keyof Skills) => {
        before = Player.exp[stat];
        complete(train);
        expect(Player.exp[stat]).toBeGreaterThan(before);
      });
    });

    describe(BladeburnerGeneralActionName.HyperbolicRegen, () => {
      const regen = GeneralAction.createId(BladeburnerGeneralActionName.HyperbolicRegen);

      it("heals the player", () => {
        Player.takeDamage(Player.hp.max / 2);
        before = Player.hp.current;
        complete(regen);
        expect(Player.hp.current).toBeGreaterThan(before);
      });

      it("regains stamina", () => {
        bb.stamina = 0;
        complete(regen);
        expect(bb.stamina).toBeGreaterThan(0);
      });
    });

    describe(BladeburnerGeneralActionName.Diplomacy, () => {
      const diplomacy = GeneralAction.createId(BladeburnerGeneralActionName.Diplomacy);

      it("mildly reduces chaos in the current city", () => {
        allCitiesHighChaos();
        let { chaos } = bb.getCurrentCity();
        complete(diplomacy);
        expect(bb.getCurrentCity().chaos).toBeGreaterThan(chaos * 0.9);
        expect(bb.getCurrentCity().chaos).toBeLessThan(chaos);
      });

      it("effect scales significantly with player charisma", () => {
        Player.gainCharismaExp(1e500);
        allCitiesHighChaos();
        complete(diplomacy);
        expect(bb.getCurrentCity().chaos).toBe(0);
      });

      it("does NOT affect chaos in other cities", () => {
        const otherCity = <CityName>cities.find((c) => c !== bb.getCurrentCity().name);
        /** Testing against a guaranteed 0-chaos level of charisma */
        Player.gainCharismaExp(1e500);
        allCitiesHighChaos();
        complete(diplomacy);
        expect(bb.cities[otherCity].chaos).toBeGreaterThan(0);
      });
    });

    describe(BladeburnerGeneralActionName.FieldAnalysis, () => {
      const fa = GeneralAction.createId(BladeburnerGeneralActionName.FieldAnalysis);

      it("improves population estimate", () => {
        ({ pop, popEst: before } = bb.getCurrentCity());
        complete(fa);
        ({ popEst: after } = bb.getCurrentCity());
        expect(Math.abs(after - pop)).toBeLessThan(Math.abs(before - pop));
      });

      it.each(<(keyof Skills)[]>["hacking", "charisma"])("awards %s exp", (stat: keyof Skills) => {
        before = Player.exp[stat];
        complete(fa, forceSuccess);
        expect(Player.exp[stat]).toBeGreaterThan(before);
      });

      it("provides a minor increase in rank", () => {
        before = bb.rank;
        complete(fa, forceSuccess);
        expect(bb.rank).toBeGreaterThan(before);
      });
    });

    describe.each([SampleContract, SampleOperation, BlackOperations["Operation Archangel"].id])(
      "non-general actions increase rank",
      (id) => {
        it(`${id.type}`, () => {
          before = bb.rank;
          complete(id, forceSuccess);
          expect(bb.rank).toBeGreaterThan(before);
        });
      },
    );

    describe("non-general actions increase rank", () => {
      let beforeMinor, minorGain, beforeMajor, majorGain;

      it.each([
        { major: SampleBlackOp, minor: SampleOperation },
        { major: SampleOperation, minor: SampleContract },
      ])("$major.type reward significantly more rank than $minor.type", ({ major, minor }) => {
        beforeMinor = bb.rank;
        complete(minor, forceSuccess);
        minorGain = bb.rank - beforeMinor;
        beforeMajor = bb.rank;
        complete(major, forceSuccess);
        majorGain = bb.rank - beforeMajor;
        expect(majorGain).toBeGreaterThan(minorGain);
      });
    });

    describe(BladeburnerGeneralActionName.InciteViolence, () => {
      const iv = GeneralAction.createId(BladeburnerGeneralActionName.InciteViolence);
      let chaos;

      it("generates available contracts", () => {
        const { count } = bb.getActionObject(SampleContract);
        complete(iv, forceSuccess);
        expect(bb.getActionObject(SampleContract).count).toBeGreaterThan(count);
      });

      it("generates available operations", () => {
        const { count } = bb.getActionObject(SampleOperation);
        complete(iv, forceSuccess);
        expect(bb.getActionObject(SampleOperation).count).toBeGreaterThan(count);
      });

      /** Relates to all issues mentioned in PR-1586:
       * - changing chaos rate of incite violence
       * - having chaos rate affect only one city
       */
      it.each(cities)("SIGNIFICANTLY increases chaos in all cities when chaos is LOW: %s", (city: CityName) => {
        ({ chaos } = bb.cities[city]);
        complete(iv, forceSuccess);
        expect(bb.cities[city].chaos).toBeGreaterThan(chaos * 2);
      });

      /** Relates to all issues mentioned in PR-1586:
       * - changing chaos rate of incite violence
       * - having chaos rate affect only one city
       */
      it.each(cities)("MILDLY increases chaos in all cities when chaos is HIGH: %s", (city: CityName) => {
        allCitiesHighChaos();
        ({ chaos } = bb.cities[city]);
        complete(iv, forceSuccess);
        expect(bb.cities[city].chaos).toBeGreaterThan(chaos * 1.05);
      });
    });

    describe(BladeburnerGeneralActionName.Recruitment, () => {
      const recruit = GeneralAction.createId(BladeburnerGeneralActionName.Recruitment);

      it("awards charisma exp", () => {
        before = Player.exp.charisma;
        complete(recruit, forceSuccess);
        expect(Player.exp.charisma).toBeGreaterThan(before);
      });

      it("hires team member", () => {
        complete(recruit, forceSuccess);
        expect(bb.teamSize).toBeGreaterThan(0);
      });
    });

    describe.each(contracts.map(({ id }) => ({ id })))("$id.name", ({ id }) => {
      it("all contracts award money", () => {
        before = Player.money;
        complete(id, forceSuccess);
        expect(Player.money).toBeGreaterThan(before);
      });
    });

    /** Stat EXP check for all actions */
    /** Checking all of them to avoid regressions */
    describe.each(nonGeneralActions.flatMap(actionIdWithIndividualStat))("$id.name", ({ id, stat }) => {
      it(`awards ${stat} exp`, () => {
        before = Player.exp[stat];
        complete(id, forceSuccess);
        expect(Player.exp[stat]).toBeGreaterThan(before);
      });
    });
  });

  describe("Upon failed completion", () => {
    let before;

    describe.each([SampleOperation, SampleBlackOp])("operations and black operations decrease rank", (id) => {
      it(`${id.type}`, () => {
        before = bb.rank;
        complete(id, forceFailure);
        expect(bb.rank).toBeLessThan(before);
      });
    });
  });

  it("have a minimum duration of 1 second", () => {
    complete(SampleContract);
    expect(bb.actionTimeToComplete).toBeGreaterThanOrEqual(1);
  });

  beforeAll(() => {
    /* Initialise Formatters. Dependency of Bladeburner Logs/Console */
    FormatsNeedToChange.emit();
  });

  beforeEach(() => {
    setPlayer(new PlayerObject());

    /** Need BN5 to receive Int EXP */
    Player.sourceFiles.set(5, 3);

    if (initBladeburner(Player)) {
      bb = Player.bladeburner;
      bb.clearConsole();
    }

    basicStats();
  });

  function initBladeburner(player: PlayerObject): player is PlayerObject & { bladeburner: Bladeburner } {
    player.startBladeburner();
    return true;
  }

  function basicStats() {
    bb.rank = 1;
    bb.changeRank(Player, 400e3);
    Player.gainStrengthExp(BASE_STAT_EXP);
    Player.gainDefenseExp(BASE_STAT_EXP);
    Player.gainAgilityExp(BASE_STAT_EXP);
    Player.gainDexterityExp(BASE_STAT_EXP);
    bb.calculateMaxStamina();

    bb.stamina = bb.maxStamina;

    resetCity();
  }

  function resetCity() {
    bb.cities[bb.city].chaos = 0;
    bb.cities[bb.city].comms = 100;
    bb.cities[bb.city].pop = 1e9;

    /** Disable random event */
    bb.randomEventCounter = Infinity;
  }

  function allCitiesHighChaos() {
    for (const city of Object.values(bb.cities)) {
      city.chaos = 1e12;
    }
  }

  function complete(id: ActionIdentifier, modifySuccessRate?: typeof forceSuccess | typeof forceFailure) {
    start(id);
    if (modifySuccessRate) modifySuccessRate(id);
    finish();
  }

  function forceSuccess(id: ActionIdentifier) {
    const action = bb.getActionObject(id);
    const success = jest.spyOn(action, "getSuccessChance");
    success.mockReturnValueOnce(1);
  }

  function forceFailure() {
    bb.stamina = 0;
  }

  function start(id: ActionIdentifier) {
    const action = bb.getActionObject(id);
    if ("count" in action) action.count = 1;
    if (action.type === BladeburnerActionType.Operation) action.autoLevel = true;
    if (id.type === "Black Operations") bb.numBlackOpsComplete = (<BlackOperation>action).n;
    bb.startAction(id);
  }

  function finish() {
    bb.processAction(ENOUGH_TIME_TO_FINISH_ACTION);
    bb.calculateMaxStamina();
  }

  function actionIdWithIndividualStat(action: Action) {
    return Object.entries(action.weights)
      .filter(([__, value]) => value > 0)
      .map(([stat]) => ({ id: action.id, stat } as { id: ActionIdentifier; stat: keyof Skills }));
  }
});
