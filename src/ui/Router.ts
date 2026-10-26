import type { ScriptFilePath } from "../Paths/ScriptFilePath";
import type { TextFilePath } from "../Paths/TextFilePath";
import type { Faction } from "../Faction/Faction";
import type { Location } from "../Locations/Location";
import type { SaveData } from "../types";
import type { OptionsTabName } from "../GameOptions/ui/GameOptionsRoot";
import type { ReactElement } from "@nsdefs";
import { ComplexPage, SimplePage } from "./Enums";

// Using the same name as both type and object to mimic enum-like behavior.
// See https://stackoverflow.com/a/71255520/202091
export type Page = SimplePage | ComplexPage;
export const Page = { ...SimplePage, ...ComplexPage };

export type PageContext<T extends Page> = T extends ComplexPage.BitVerse
  ? { flume: boolean; quick: boolean }
  : T extends ComplexPage.Faction
  ? { faction: Faction }
  : T extends ComplexPage.FactionAugmentations
  ? { faction: Faction }
  : T extends ComplexPage.ScriptEditor
  ? { files: Map<ScriptFilePath | TextFilePath, string>; options: ScriptEditorRouteOptions }
  : T extends ComplexPage.Location
  ? { location: Location }
  : T extends ComplexPage.ImportSave
  ? { saveData: SaveData; automatic?: boolean }
  : T extends ComplexPage.Documentation
  ? { docPage?: string }
  : T extends ComplexPage.Options
  ? { tab?: OptionsTabName }
  : T extends ComplexPage.CustomPage
  ? { content: ReactElement }
  : T extends ComplexPage.ActiveScripts
  ? { serverName?: string }
  : never;

export type PageWithContext =
  | ({ page: ComplexPage.BitVerse } & PageContext<ComplexPage.BitVerse>)
  | ({ page: ComplexPage.Faction } & PageContext<ComplexPage.Faction>)
  | ({ page: ComplexPage.FactionAugmentations } & PageContext<ComplexPage.FactionAugmentations>)
  | ({ page: ComplexPage.ScriptEditor } & PageContext<ComplexPage.ScriptEditor>)
  | ({ page: ComplexPage.Location } & PageContext<ComplexPage.Location>)
  | ({ page: ComplexPage.ImportSave } & PageContext<ComplexPage.ImportSave>)
  | ({ page: ComplexPage.Documentation } & PageContext<ComplexPage.Documentation>)
  | ({ page: ComplexPage.Options } & PageContext<ComplexPage.Options>)
  | ({ page: ComplexPage.CustomPage } & PageContext<ComplexPage.CustomPage>)
  | ({ page: ComplexPage.ActiveScripts } & PageContext<ComplexPage.ActiveScripts>)
  | { page: ComplexPage.LoadingScreen }
  | { page: SimplePage };

export interface ScriptEditorRouteOptions {
  vim: boolean;
  hostname: string;
}

/** The router keeps track of player navigation/routing within the game. */
export interface IRouter {
  page(): Page;
  allowRouting(value: boolean): void;
  /** If messages/toasts are hidden on this page */
  hidingMessages(): boolean;
  toPage(page: SimplePage): void;
  toPage<T extends ComplexPage>(page: T, context: PageContext<T>): void;
  /** go to a preveious page (if any) */
  back(): void;
}

const simplePages = Object.values(SimplePage);
export const isSimplePage = (page: Page): page is SimplePage => simplePages.includes(page as SimplePage);

export type RouterAction = (
  | {
      type: "toPage";
      page: Page;
      context?: PageContext<ComplexPage>;
    }
  | {
      type: "back";
    }
) & { stackTrace: string | undefined };

/**
 * When the main UI is not loaded, all router actions ("toPage" and "back") are stored in this array. After that, we
 * will run them and show a warning popup. This queue is empty in a normal situation. If it has items, there are bugs
 * that try to route the main UI when it's not loaded.
 */
export const pendingRouterActions: RouterAction[] = [];

export let Router: IRouter = {
  page: () => {
    return Page.LoadingScreen;
  },
  /**
   * This function is only called in ImportSave.tsx. That component is only used when the main UI shows Page.ImportSave,
   * so it's impossible for this function to run before the main UI is loaded. If it happens, it's a fatal error. In
   * that case, throwing an error is the only option.
   */
  allowRouting: () => {
    throw new Error("Router.allowRouting() was called before initialization.");
  },
  hidingMessages: () => true,
  toPage: (page: Page, context?: PageContext<ComplexPage>) => {
    const stackTrace = new Error().stack;
    console.error("Router.toPage() was called before initialization.", page, context, stackTrace);
    pendingRouterActions.push({
      type: "toPage",
      page,
      context,
      stackTrace,
    });
  },
  back: () => {
    const stackTrace = new Error().stack;
    console.error("Default Router.back() was called before initialization.", stackTrace);
    pendingRouterActions.push({
      type: "back",
      stackTrace,
    });
  },
};

/** Called by GameRoot on render to install the real router implementation. */
export function setRouter(router: IRouter): void {
  Router = router;
}
