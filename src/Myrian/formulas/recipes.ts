import { Recipe } from "@nsdefs";
import { Component } from "@enums";

const make = (input: Component[], output: Component): Recipe => ({ input, output });

export const Tier1Recipes: Recipe[] = [
  make([Component.R0, Component.R0], Component.R1),
  make([Component.G0, Component.G0], Component.G1),
  make([Component.B0, Component.B0], Component.B1),

  make([Component.R0, Component.G0], Component.Y1),
  make([Component.G0, Component.B0], Component.C1),
  make([Component.B0, Component.R0], Component.M1),
];

export const Tier2Recipes: Recipe[] = [
  make([Component.R1, Component.R1], Component.R2),
  make([Component.G1, Component.G1], Component.G2),
  make([Component.B1, Component.B1], Component.B2),

  make([Component.R1, Component.G1], Component.Y2),
  make([Component.G1, Component.B1], Component.C2),
  make([Component.B1, Component.R1], Component.M2),

  make([Component.Y1, Component.C1, Component.M1], Component.W2),
];

export const Tier3Recipes: Recipe[] = [
  make([Component.R2, Component.R2], Component.R3),
  make([Component.G2, Component.G2], Component.G3),
  make([Component.B2, Component.B2], Component.B3),

  make([Component.R2, Component.G2], Component.Y3),
  make([Component.G2, Component.B2], Component.C3),
  make([Component.B2, Component.R2], Component.M3),

  make([Component.Y2, Component.C2, Component.M2], Component.W3),
];

export const Tier4Recipes: Recipe[] = [
  make([Component.R3, Component.R3], Component.R4),
  make([Component.G3, Component.G3], Component.G4),
  make([Component.B3, Component.B3], Component.B4),

  make([Component.R3, Component.G3], Component.Y4),
  make([Component.G3, Component.B3], Component.C4),
  make([Component.B3, Component.R3], Component.M4),

  make([Component.Y3, Component.C3, Component.M3], Component.W4),
];

export const Tier5Recipes: Recipe[] = [
  make([Component.R4, Component.R4], Component.R5),
  make([Component.G4, Component.G4], Component.G5),
  make([Component.B4, Component.B4], Component.B5),

  make([Component.R4, Component.G4], Component.Y5),
  make([Component.G4, Component.B4], Component.C5),
  make([Component.B4, Component.R4], Component.M5),

  make([Component.Y4, Component.C4, Component.M4], Component.W5),
];

export const Tier6Recipes: Recipe[] = [
  make([Component.R5, Component.G5], Component.Y6),
  make([Component.G5, Component.B5], Component.C6),
  make([Component.B5, Component.R5], Component.M6),

  make([Component.Y5, Component.C5, Component.M5], Component.W6),
];

export const Tier7Recipes: Recipe[] = [make([Component.Y6, Component.C6, Component.M6], Component.W7)];

export const recipes: Recipe[][] = [
  [],
  Tier1Recipes,
  Tier2Recipes,
  Tier3Recipes,
  Tier4Recipes,
  Tier5Recipes,
  Tier6Recipes,
  Tier7Recipes,
];
