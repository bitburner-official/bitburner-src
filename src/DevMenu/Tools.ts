import { Companies } from "../Company/Companies";
import { DarknetState } from "../DarkNet/models/DarknetState";
import { Factions } from "../Faction/Factions";
import { Go } from "../Go/Go";
import { Player } from "../Player";
import { saveObject } from "../SaveObject";
import { GetAllServers } from "../Server/AllServers";

declare global {
  // This property is available in the dev build and can be exposed via the dev menu
  // eslint-disable-next-line no-var
  var Bitburner: {
    Player: typeof Player;
    GetAllServers: typeof GetAllServers;
    Factions: typeof Factions;
    Companies: typeof Companies;
    saveObject: typeof saveObject;
    Go: typeof Go;
    DarknetState: typeof DarknetState;
  };
  // eslint-disable-next-line no-var
  var openDevMenu: () => void;
}

export function exposeInternalObjects(): void {
  globalThis.Bitburner = {
    // Most data is in this object
    Player: Player,
    // Manipulate data of servers
    GetAllServers: GetAllServers,
    // Manipulate data of Factions and Companies
    Factions: Factions,
    Companies: Companies,
    // saveObject and loadGame can be used to create a custom save/load tool
    saveObject: saveObject,
    // These are global states that are not in the Player object
    Go: Go,
    DarknetState: DarknetState,
  };
}
