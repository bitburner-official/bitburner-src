import { Player } from "@player";
import { getNS, initGameEnvironment, setupBasicTestingEnvironment } from "./Utilities";
import { joinFaction } from "../../src/Faction/FactionHelpers";
import { Factions } from "../../src/Faction/Factions";
import { AugmentationName, GoColor } from "../../src/Enums";
import { staneksGift } from "../../src/CotMG/Helper";
import { Go } from "../../src/Go/Go";

beforeAll(() => {
  initGameEnvironment();
});

beforeEach(() => {
  setupBasicTestingEnvironment();
  Player.sourceFiles.set(10, 3);
  Player.sourceFiles.set(13, 3);
  getNS().singularity.b1tflum3(1);
  prestigeAndSetup();
});

function prestigeAndSetup() {
  getNS().singularity.softReset();
  Player.money = 1e100;
  joinFaction(Factions.Netburners);
  Factions.Netburners.playerReputation = 1e100;
}

test("Multiplier", async () => {
  const ns = getNS();
  expect(Player.mults.hacknet_node_money).toBe(1);

  // Stanek's Gift 1
  ns.stanek.acceptGift();
  expect(Player.mults.hacknet_node_money).toBe(0.9);
  expect(Player.mults.hacknet_node_purchase_cost).toBe(1.1);

  // Stanek's Gift 2
  Factions["Church of the Machine God"].playerReputation = 1e100;
  ns.singularity.purchaseAugmentation("Church of the Machine God", AugmentationName.StaneksGift2);
  prestigeAndSetup();
  expect(Player.mults.hacknet_node_money).toBe(0.9500000000000001);
  expect(Player.mults.hacknet_node_purchase_cost).toBe(1.05);

  // Stanek's Gift 3
  Factions["Church of the Machine God"].playerReputation = 1e100;
  ns.singularity.purchaseAugmentation("Church of the Machine God", AugmentationName.StaneksGift3);
  prestigeAndSetup();
  expect(Player.mults.hacknet_node_money).toBe(1);
  expect(Player.mults.hacknet_node_purchase_cost).toBe(1);

  // Stanek's Gift charge
  staneksGift.storedCycles = 1e10;
  ns.stanek.placeFragment(0, 0, 0, 20);
  ns.stanek.placeFragment(0, 1, 0, 21);
  await ns.stanek.chargeFragment(0, 0);
  await ns.stanek.chargeFragment(0, 1);
  staneksGift.process(1000);
  expect(Player.mults.hacknet_node_money).toBe(1.0108347379040743);
  expect(Player.mults.hacknet_node_purchase_cost).toBe(0.9787901309364186);

  // Reset (lose stanek's effects)
  prestigeAndSetup();
  expect(Player.mults.hacknet_node_money).toBe(1);
  expect(Player.mults.hacknet_node_purchase_cost).toBe(1);

  // IPvGO
  Go.storedCycles = 1e10;
  for (const row of Go.currentGame.board) {
    for (const point of row) {
      if (!point) {
        continue;
      }
      point.color = GoColor.black;
    }
  }
  await ns.go.passTurn();
  expect(Player.mults.hacknet_node_money).toBe(1.0253103584897398);

  // Reset (lose IPvGO's effects)
  prestigeAndSetup();
  expect(Player.mults.hacknet_node_money).toBe(1);

  // Queue and install 1 normal aug
  ns.singularity.purchaseAugmentation("Netburners", AugmentationName.HacknetNodeCPUUpload);
  expect(Player.mults.hacknet_node_money).toBe(1);
  expect(Player.mults.hacknet_node_purchase_cost).toBe(1);
  prestigeAndSetup();
  expect(Player.mults.hacknet_node_money).toBe(1.15);
  expect(Player.mults.hacknet_node_purchase_cost).toBe(0.85);

  // Queue and install 1 NFG
  ns.singularity.purchaseAugmentation("Netburners", AugmentationName.NeuroFluxGovernor);
  expect(Player.mults.hacknet_node_money).toBe(1.15);
  expect(Player.mults.hacknet_node_purchase_cost).toBe(0.85);
  prestigeAndSetup();
  expect(Player.mults.hacknet_node_money).toBe(1.161503013);
  expect(Player.mults.hacknet_node_purchase_cost).toBe(0.8415819753022026);

  // Queue and install multiple NFGs
  ns.singularity.purchaseAugmentation("Netburners", AugmentationName.NeuroFluxGovernor);
  ns.singularity.purchaseAugmentation("Netburners", AugmentationName.NeuroFluxGovernor);
  expect(Player.queuedAugmentations.length).toBe(2);
  expect(Player.queuedAugmentations[1].level).toBe(3);
  expect(Player.mults.hacknet_node_money).toBe(1.161503013);
  expect(Player.mults.hacknet_node_purchase_cost).toBe(0.8415819753022026);
  prestigeAndSetup();
  expect(Player.augmentations[Player.augmentations.length - 1].level).toBe(3);
  expect(Player.mults.hacknet_node_money).toBe(1.184855370707819);
  expect(Player.mults.hacknet_node_purchase_cost).toBe(0.8249952054621251);

  // Grafting
  ns.singularity.travelToCity("New Tokyo");
  ns.grafting.graftAugmentation(AugmentationName.HacknetNodeCacheUpload);
  Player.processWork(1e6);
  expect(Player.mults.hacknet_node_money).toBe(1.277274089623029);
  expect(Player.mults.hacknet_node_purchase_cost).toBe(0.841831842308291);

  ns.grafting.graftAugmentation(AugmentationName.HacknetNodeNICUpload);
  Player.processWork(1e6);
  expect(Player.mults.hacknet_node_money).toBe(1.3769014686136254);
  expect(Player.mults.hacknet_node_purchase_cost).toBe(0.773110875589247);

  ns.grafting.graftAugmentation(AugmentationName.CongruityImplant);
  Player.processWork(1e6);
  expect(Player.augmentations.length).toBe(8);
  for (const aug of Player.augmentations) {
    if (aug.name === AugmentationName.NeuroFluxGovernor) {
      expect(aug.level).toBe(3);
    } else {
      expect(aug.level).toBe(1);
    }
  }
  expect(Player.queuedAugmentations.length).toBe(0);
  expect(Player.mults.hacknet_node_money).toBe(1.4336749985564614);
  expect(Player.mults.hacknet_node_purchase_cost).toBe(0.7424956849159127);

  // BN prestige
  getNS().singularity.b1tflum3(1);
  expect(Player.augmentations.length).toBe(0);
  expect(Player.queuedAugmentations.length).toBe(0);
  expect(Player.mults.hacknet_node_money).toBe(1);
  expect(Player.mults.hacknet_node_purchase_cost).toBe(1);
});
