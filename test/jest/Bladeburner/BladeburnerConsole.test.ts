import type { Bladeburner } from "../../../src/Bladeburner/Bladeburner";
import { FormatsNeedToChange } from "../../../src/ui/formatNumber";
import { Player, setPlayer } from "@player";
import { PlayerObject } from "../../../src/PersonObjects/Player/PlayerObject";
import { BladeburnerContractName } from "@enums";
import { Contract } from "../../../src/Bladeburner/Actions";

describe("Bladeburner Console", () => {
  let inst: Bladeburner;
  const FEEDBACK_CMDS = [["skill"], ["start"], ["help"], ["log"], ["automate"]];
  const SILENT_CMDS = [["cls"], ["clear"], ["stop"]];
  const CLEAR_CMDS = [["cls"], ["clear"]];

  beforeEach(() => {
    setPlayer(new PlayerObject());
    Player.init();
    Player.startBladeburner();

    if (!Player.bladeburner) throw new Error();
    inst = Player.bladeburner;
    inst.clearConsole();
  });

  describe.each(FEEDBACK_CMDS)("%s", (cmd: string) => {
    it("provides valid console feedback", () => {
      bb(cmd);
      expect(inst.consoleLogs.length).toBeGreaterThan(0);
      expect(inst.consoleLogs).not.toContainEqual("Invalid console command");
    });
  });

  describe.each([...FEEDBACK_CMDS, ...SILENT_CMDS])("%s", (cmd: string) => {
    it("provides help", () => {
      bb(`help ${cmd}`);
      expect(inst.consoleLogs.length).toBeGreaterThan(0);
    });
  });

  describe.each(CLEAR_CMDS)("%s", (cmd: string) => {
    it("wipes logs clean", () => {
      bb("help");
      bb(cmd);
      expect(inst.consoleLogs).toHaveLength(0);
    });
  });

  describe("start", () => {
    it("starts bladeburner action", () => {
      bb("start contract Tracking");
      expect(inst.action).toMatchObject(Contract.createId(BladeburnerContractName.Tracking));
    });
  });

  describe("stop", () => {
    it("clears current action", () => {
      inst.startAction(Contract.createId(BladeburnerContractName.Tracking));
      bb("stop");
      expect(inst.action).toBeNull();
    });
  });

  describe("automate", () => {
    it("sets high threshold", () => {
      bb("automate stamina 100 high");
      expect(inst.automateThreshHigh).toBe(100);
    });

    it("sets low threshold", () => {
      bb("automate stamina 50 low");
      expect(inst.automateThreshLow).toBe(50);
    });

    it("queues action at high threshold", () => {
      bb("automate contract Tracking high");
      expect(inst.automateActionHigh).toMatchObject(Contract.createId(BladeburnerContractName.Tracking));
    });

    it("queues action at low threshold", () => {
      bb("automate contract Tracking low");
      expect(inst.automateActionLow).toMatchObject(Contract.createId(BladeburnerContractName.Tracking));
    });
  });

  function bb(cmd: string) {
    inst.executeConsoleCommand(cmd);
  }
});
