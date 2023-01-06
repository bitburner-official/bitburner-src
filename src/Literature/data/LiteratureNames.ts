import { buildObjectEnum } from "../../utils/helpers/enum";

const literatureNames = {
  HackersStartingHandbook: "hackers-starting-handbook.lit",
  CorporationManagementHandbook: "corporation-management-handbook.lit",
  HistoryOfSynthoids: "history-of-synthoids.lit",
  AGreenTomorrow: "A-Green-Tomorrow.lit",
  AlphaOmega: "alpha-omega.lit",
  SimulatedReality: "simulated-reality.lit",
  BeyondMan: "beyond-man.lit",
  BrighterThanTheSun: "brighter-than-the-sun.lit",
  DemocracyIsDead: "democracy-is-dead.lit",
  Sector12Crime: "sector-12-crime.lit",
  ManAndMachine: "man-and-machine.lit",
  SecretSocieties: "secret-societies.lit",
  TheFailedFrontier: "the-failed-frontier.lit",
  CodedIntelligence: "coded-intelligence.lit",
  SyntheticMuscles: "synthetic-muscles.lit",
  TensionsInTechRace: "tensions-in-tech-race.lit",
  CostOfImmortality: "cost-of-immortality.lit",
  TheHiddenWorld: "the-hidden-world.lit",
  TheNewGod: "the-new-god.lit",
  NewTriads: "new-triads.lit",
  TheSecretWar: "the-secret-war.lit",
} as const;

export type LiteratureName = typeof literatureNames[keyof typeof literatureNames];
export const LiteratureNames = buildObjectEnum<typeof literatureNames, LiteratureName>(literatureNames);
