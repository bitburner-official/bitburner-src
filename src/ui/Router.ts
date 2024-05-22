import type { ScriptFilePath } from "../Paths/ScriptFilePath";
import type { TextFilePath } from "../Paths/TextFilePath";
import type { Faction } from "../Faction/Faction";
import type { Location } from "../Locations/Location";
import { SaveData } from "../types";

// This enum doesn't need enum helper support for now
/**
 * The full-screen page the player is currently be on.
 * These are "simple" pages that don't require any extra parameters to
 * transition to. You can use setPage() with these.
 */
export enum SimplePage {
  ActiveScripts = "Active Scripts",
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
  Work = "Work",
  BladeburnerCinematic = "Bladeburner Cinematic",
  Loading = "Loading",
  StaneksGift = "Staneks Gift",
  Recovery = "Recovery",
  Achievements = "Achievements",
  ThemeBrowser = "Theme Browser",
}

export enum ComplexPage {
  BitVerse = "BitVerse",
  Infiltration = "Infiltration",
  Job = "Job",
  Faction = "Faction",
  FactionAugmentations = "Faction Augmentations",
  ScriptEditor = "Script Editor",
  Location = "Location",
  ImportSave = "Import Save",
  Documentation = "Documentation",
}

// Using the same name as both type and object to mimic enum-like behavior.
// See https://stackoverflow.com/a/71255520/202091
export type Page = SimplePage | ComplexPage;
export const Page = { ...SimplePage, ...ComplexPage };

export type PageContext<T extends Page> = T extends ComplexPage.BitVerse
  ? { flume: boolean; quick: boolean }
  : T extends ComplexPage.Infiltration
  ? { location: Location }
  : T extends ComplexPage.Job
  ? { location: Location }
  : T extends ComplexPage.Faction
  ? { faction: Faction }
  : T extends ComplexPage.FactionAugmentations
  ? { faction: Faction }
  : T extends ComplexPage.ScriptEditor
  ? { files?: Map<ScriptFilePath | TextFilePath, string>; options?: ScriptEditorRouteOptions }
  : T extends ComplexPage.Location
  ? { location: Location }
  : T extends ComplexPage.ImportSave
  ? { saveData: SaveData; automatic?: boolean }
  : T extends ComplexPage.Documentation
  ? { docPage?: string }
  : never;

export type PageWithContext =
  | ({ page: ComplexPage.BitVerse } & PageContext<ComplexPage.BitVerse>)
  | ({ page: ComplexPage.Infiltration } & PageContext<ComplexPage.Infiltration>)
  | ({ page: ComplexPage.Job } & PageContext<ComplexPage.Job>)
  | ({ page: ComplexPage.Faction } & PageContext<ComplexPage.Faction>)
  | ({ page: ComplexPage.FactionAugmentations } & PageContext<ComplexPage.FactionAugmentations>)
  | ({ page: ComplexPage.ScriptEditor } & PageContext<ComplexPage.ScriptEditor>)
  | ({ page: ComplexPage.Location } & PageContext<ComplexPage.Location>)
  | ({ page: ComplexPage.ImportSave } & PageContext<ComplexPage.ImportSave>)
  | ({ page: ComplexPage.Documentation } & PageContext<ComplexPage.Documentation>)
  | { page: SimplePage };

export interface ScriptEditorRouteOptions {
  vim?: boolean;
  hostname?: string;
}

/** The router keeps track of player navigation/routing within the game. */
export interface IRouter {
  isInitialized: boolean;
  page(): Page;
  allowRouting(value: boolean): void;
  toPage(page: SimplePage): void;
  toPage<T extends ComplexPage>(page: T, context: PageContext<T>): void;
  /** go to a preveious page (if any) */
  back(): void;
}

const simplePages = Object.values(SimplePage);
export const isSimplePage = (page: Page): page is SimplePage => simplePages.includes(page as SimplePage);
