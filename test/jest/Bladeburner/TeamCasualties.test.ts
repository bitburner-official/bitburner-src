import { Player, setPlayer } from "@player";
import { FormatsNeedToChange } from "../../../src/ui/formatNumber";
import type { ActionIdFor } from "../../../src/Bladeburner/Types";
import type { Bladeburner } from "../../../src/Bladeburner/Bladeburner";
import { BlackOperation, Contract, Operation } from "../../../src/Bladeburner/Actions";
import { Sleeve } from "../../../src/PersonObjects/Sleeve/Sleeve";
import { SleeveSupportWork } from "../../../src/PersonObjects/Sleeve/Work/SleeveSupportWork";
import { BladeburnerBlackOpName, BladeburnerContractName, BladeburnerOperationName } from "@enums";
import { PlayerObject } from "../../../src/PersonObjects/Player/PlayerObject";

/**
 * You may want to use hook to help with debugging
 * <code>
 *   afterEach(() => {
 *     console.error(inst.consoleLogs);
 *   });
 * </code>
 */
describe("Bladeburner Team", () => {
  const MAX_ROLL = (_: number, high: number) => high;
  const MIN_ROLL = (low: number, __: number) => low;
  const BLACK_OP = BlackOperation.createId(BladeburnerBlackOpName.OperationAnnihilus);
  const OP = Operation.createId(BladeburnerOperationName.Assassination);

  let inst: Bladeburner;
  let action: BlackOperation | Operation;

  beforeAll(() => {
    /* Initialise Formatters. Dependency of Bladeburner */
    FormatsNeedToChange.emit();
  });

  beforeEach(() => {
    setPlayer(new PlayerObject());
    Player.init();
    Player.startBladeburner();

    if (!Player.bladeburner) throw new Error();
    inst = Player.bladeburner;

    Player.sourceFiles.set(10, 3);
    Player.sleevesFromCovenant = 5;
    Sleeve.recalculateNumOwned();
    Player.sleeves.forEach((s) => (s.shock = 0));
  });

  describe("Operations", () => {
    it("hav a chance of zero deaths for Operations", () => {
      teamSize(10), startAction(OP), teamUsed(10), forceMinCasualties();
      actionFails();
      expect(inst.teamSize).toBe(10);
    });
  });

  describe("Black Operations", () => {
    it("always have at least 1 death", () => {
      teamSize(10), startAction(BLACK_OP), teamUsed(10), forceMinCasualties();
      actionFails();
      expect(inst.teamSize).toBe(9);
    });
  });

  describe("Solo: with no members or sleeves", () => {
    it.each([
      ["success", actionSucceeds],
      ["fail", actionFails],
    ])("remains unchanged at all rates: %s", (_: string, attempt: CallableFunction) => {
      teamSize(1000), startAction(OP), teamUsed(0);
      attempt();
      expect(inst.teamSize).toBe(1000);
    });
  });

  describe("Human members", () => {
    it("get killed according to roll", () => {
      teamSize(15), startAction(OP), teamUsed(15), forceMaxCasualties(), actionSucceeds();
      expect(inst).toMatchObject({ teamSize: 7, teamLost: 8 });
    });
  });

  describe("Assigned team members", () => {
    it("get killed with human casualties before sleeves", () => {
      /** At most 10 + 8 -> 9 casualties occur at worst,
       * killing human team members before sleeves */
      teamSize(10), startAction(BLACK_OP), supportingSleeves(8), teamUsed(18);
      actionSucceeds();
      expect(inst.teamSize).toBeLessThanOrEqual(18);
      assertNoShockIncrease();
    });

    it("shocks sleeves when deaths exceed humans", () => {
      teamSize(0), startAction(OP), supportingSleeves(8), forceMaxCasualties(), teamUsed(8);
      actionFails();
      assertSleevesHaveBeenShocked();
    });
  });

  describe("Casualties", () => {
    it.each([[OP], [BLACK_OP]])(
      "no change in team size when not using team. Action: %s",
      (op: ActionIdFor<BlackOperation> | ActionIdFor<Operation>) => {
        teamSize(0), supportingSleeves(3), startAction(op), teamUsed(0), actionFails();
        expect(inst.teamSize).toBe(3);
        expect(inst.teamLost).toBe(0);
      },
    );

    it("do not affect contracts", () => {
      teamSize(3);
      inst.action = Contract.createId(BladeburnerContractName.Tracking);
      actionFails();
      expect(inst.teamSize).toBe(3);
    });

    it.each([[OP], [BLACK_OP]])(
      "will occur on actions that support teams: %s",
      (op: ActionIdFor<BlackOperation> | ActionIdFor<Operation>) => {
        teamSize(5), startAction(op), forceMaxCasualties(), teamUsed(5), actionFails();
        expect(inst.teamSize).toBe(0);
      },
    );

    it("are potentially entire team when failing", () => {
      teamSize(5), startAction(OP), forceMaxCasualties(), teamUsed(5), actionFails();
      expect(inst).toMatchObject({ teamSize: 0, teamLost: 5 });
    });

    it("at worst half the team when succeeding (rounding up)", () => {
      teamSize(5), startAction(OP), forceMaxCasualties(), teamUsed(5), actionSucceeds();
      expect(inst).toMatchObject({ teamSize: 2, teamLost: 3 });
    });
  });

  function teamSize(n: number) {
    inst.teamSize = n;
  }

  function teamUsed(n: number) {
    action.teamCount = n;
  }

  function startAction(type: ActionIdFor<BlackOperation> | ActionIdFor<Operation>) {
    inst.action = type;
    action = inst.getActionObject(type) as BlackOperation | Operation;
  }

  function forceMaxCasualties() {
    inst.getTeamCasualtiesRoll = MAX_ROLL;
  }

  function forceMinCasualties() {
    inst.getTeamCasualtiesRoll = MIN_ROLL;
  }

  function actionSucceeds() {
    action.baseDifficulty = 0;
    Player.skills.strength = 1e12;
    Player.skills.agility = 1e12;
    inst.action && inst.completeAction(Player, inst.action);
  }

  function actionFails() {
    action.baseDifficulty = 1e15;
    inst.action && inst.completeAction(Player, inst.action);
  }

  function supportingSleeves(n: number) {
    for (let i = 0; i < n; i++) Player.sleeves[i].startWork(new SleeveSupportWork());
  }

  function assertNoShockIncrease() {
    const shockIncrease = Player.sleeves.reduce((sum, s) => sum + s.shock, 0);
    expect(shockIncrease).toBe(0);
  }

  function assertSleevesHaveBeenShocked() {
    const shockIncrease = Player.sleeves.reduce((sum, s) => sum + s.shock, 0);
    expect(shockIncrease).toBeGreaterThan(0);
  }
});
