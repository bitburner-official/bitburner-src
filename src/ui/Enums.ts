export enum ToastVariant {
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error",
  INFO = "info",
}

/**
 * The full-screen page the player is currently be on.
 * These are "simple" pages that don't require any extra parameters to
 * transition to. You can use setPage() with these.
 */
export enum SimplePage {
  RecentlyKilledScripts = "Recently Killed Scripts",
  RecentErrors = "Recent Errors",
  Augmentations = "Augmentations",
  Bladeburner = "Bladeburner",
  City = "City",
  Corporation = "Corporation",
  CreateProgram = "Create Program",
  DarkNet = "Dark Net",
  DevMenu = "Dev",
  Factions = "Factions",
  Gang = "Gang",
  Go = "IPvGO Subnet",
  Hacknet = "Hacknet",
  Infiltration = "Infiltration",
  Milestones = "Milestones",
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
  ActiveScripts = "Active Scripts",
  BitVerse = "BitVerse",
  Faction = "Faction",
  FactionAugmentations = "Faction Augmentations",
  ScriptEditor = "Script Editor",
  Location = "Location",
  ImportSave = "Import Save",
  Documentation = "Documentation",
  Options = "Options",
  CustomPage = "Custom Page",
  // LoadingScreen is a special state that should never be returned to after the initial game load. To enforce this, it
  // is constructed as a ComplexPage with no PageContext, and thus toPage() cannot be used (since no overload will fit
  // it).
  LoadingScreen = "Loading Screen",
}
