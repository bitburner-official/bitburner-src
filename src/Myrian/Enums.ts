export enum DeviceType {
  Bus = "bus",
  ISocket = "isocket",
  OSocket = "osocket",
  Reducer = "reducer",
  Cache = "cache",
  Lock = "lock",
  Battery = "battery",
}

export enum Component {
  // tier 0
  R0 = "r0",
  G0 = "g0",
  B0 = "b0",

  // tier 1
  R1 = "r1",
  G1 = "g1",
  B1 = "b1",

  Y1 = "y1",
  C1 = "c1",
  M1 = "m1",

  // tier 2
  R2 = "r2",
  G2 = "g2",
  B2 = "b2",

  Y2 = "y2",
  C2 = "c2",
  M2 = "m2",

  W2 = "w2",

  // tier 3
  R3 = "r3",
  G3 = "g3",
  B3 = "b3",

  Y3 = "y3",
  C3 = "c3",
  M3 = "m3",

  W3 = "w3",

  // tier 4
  R4 = "r4",
  G4 = "g4",
  B4 = "b4",

  Y4 = "y4",
  C4 = "c4",
  M4 = "m4",

  W4 = "w4",

  // tier 5
  R5 = "r5",
  G5 = "g5",
  B5 = "b5",

  Y5 = "y5",
  C5 = "c5",
  M5 = "m5",

  W5 = "w5",

  // tier 6
  Y6 = "y6",
  C6 = "c6",
  M6 = "m6",

  W6 = "w6",

  // tier 7
  W7 = "w7",
}

export enum Glitch {
  // Locks spawn at random
  Segmentation = "segmentation",
  // ISockets and OSockets move around on their own
  Roaming = "roaming",
  // OSocket ask for more complicated components
  Encryption = "encryption",
  // Energy starts being consumed (level 0 is no consumption)
  Magnetism = "magnetism",
  // Hidden tiles on the board, when stepped on the bus loses upgrades
  Rust = "rust",
  // Move slows down
  Friction = "friction",
  // Transfer components and charging slows down
  Isolation = "isolation",
  // Install/Uninstall slows down
  Virtualization = "virtualization",
  // Reduce slows down
  Jamming = "jamming",
}
