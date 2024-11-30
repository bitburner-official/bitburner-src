import type { Bladeburner } from "../../../src/Bladeburner/Bladeburner";
import { Player, setPlayer } from "@player";
import { PlayerObject } from "../../../src/PersonObjects/Player/PlayerObject";
import { BladeburnerContractName } from "@enums";
import { Contract } from "../../../src/Bladeburner/Actions";

describe("Bladeburner Console", () => {
  let inst: Bladeburner;

  function initBladeburner(player: PlayerObject): player is PlayerObject & { bladeburner: Bladeburner } {
    player.init();
    player.startBladeburner();
    return true;
  }

  beforeEach(() => {
    setPlayer(new PlayerObject());
    if (initBladeburner(Player)) {
      inst = Player.bladeburner;
      inst.clearConsole();
    }
  });

  it("May concatenate multiple commands with ';'", () => {
    inst.startAction(Contract.createId(BladeburnerContractName.Tracking));
    execute("stop;start contract Retirement;help cls;");
    expect(inst.consoleLogs).not.toContainEqual("Invalid console command");
  });

  describe.each(["skill", "start", "help", "log", "automate"])("%s", (cmd: string) => {
    it("provides valid console feedback", () => {
      execute(cmd);
      expect(inst.consoleLogs.length).toBeGreaterThan(0);
      expect(inst.consoleLogs).not.toContainEqual("Invalid console command");
    });
  });

  describe.each(["skill", "start", "help", "log", "automate", "clear", "stop"])("%s", (cmd: string) => {
    it("provides help", () => {
      execute(`help ${cmd}`);
      expect(inst.consoleLogs.length).toBeGreaterThan(0);
    });
  });

  describe.each(["cls", "clear"])("%s", (cmd: string) => {
    it("wipes logs clean", () => {
      execute("help");
      execute(cmd);
      expect(inst.consoleLogs).toHaveLength(0);
    });
  });

  describe("start", () => {
    it("starts bladeburner action", () => {
      execute("start contract Tracking");
      expect(inst.action).toMatchObject(Contract.createId(BladeburnerContractName.Tracking));
    });
  });

  describe("stop", () => {
    it("clears current action", () => {
      inst.startAction(Contract.createId(BladeburnerContractName.Tracking));
      execute("stop");
      expect(inst.action).toBeNull();
    });
  });

  describe("automate", () => {
    it("sets high threshold", () => {
      execute("automate stamina 100 high");
      expect(inst.automateThreshHigh).toBe(100);
    });

    it("sets low threshold", () => {
      execute("automate stamina 50 low");
      expect(inst.automateThreshLow).toBe(50);
    });

    it("queues action at high threshold", () => {
      execute("automate contract Tracking high");
      expect(inst.automateActionHigh).toMatchObject(Contract.createId(BladeburnerContractName.Tracking));
    });

    it("queues action at low threshold", () => {
      execute("automate contract Tracking low");
      expect(inst.automateActionLow).toMatchObject(Contract.createId(BladeburnerContractName.Tracking));
    });
  });

  function execute(cmd: string) {
    inst.executeConsoleCommands(cmd);
  }
});
