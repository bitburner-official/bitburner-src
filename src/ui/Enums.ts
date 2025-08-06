export enum ToastVariant {
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error",
  INFO = "info",
}

// This enum doesn't need enum helper support for now
/**
 * The full-screen page the player is currently be on.
 * These are "simple" pages that don't require any extra parameters to
 * transition to. You can use setPage() with these.
 */
export enum SimplePage {
  ActiveScripts = "Active Scripts",
  RecentlyKilledScripts = "Recently Killed Scripts",
  RecentErrors = "Recent Errors",
  Augmentations = "Augmentations",
  Bladeburner = "Bladeburner",
  City = "City",
  Corporation = "Corporation",
  CreateProgram = "Create Program",
  DevMenu = "Dev",
  Factions = "Factions",
  Gang = "Gang",
  Go = "IPvGO Subnet",
  Hacknet = "Hacknet",
  Milestones = "Milestones",
  Options = "Options",
  Grafting = "Grafting",
  Sleeves = "Sleeves",
  Stats = "Stats",
  StockMarket = "Stock Market",
  Terminal = "Terminal",
  Travel = "Travel",
  Job = "Job",
  Work = "Work",
  BladeburnerCinematic = "Bladeburner Cinematic",
  Loading = "Loading",
  StaneksGift = "Stanek's Gift",
  Recovery = "Recovery",
  Achievements = "Achievements",
  ThemeBrowser = "Theme Browser",
}

export enum ComplexPage {
  BitVerse = "BitVerse",
  Infiltration = "Infiltration",
  Faction = "Faction",
  FactionAugmentations = "Faction Augmentations",
  ScriptEditor = "Script Editor",
  Location = "Location",
  ImportSave = "Import Save",
  Documentation = "Documentation",
  LoadingScreen = "Loading Screen", // Has no PageContext, and thus toPage() cannot be used
}
