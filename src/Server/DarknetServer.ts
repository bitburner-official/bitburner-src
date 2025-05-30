import { Icon, labIcon } from "../DarkNet/ui/ServerIcon";
import { BaseServer, IConstructorParams } from "./BaseServer";
import { constructorsForReviver, IReviverValue } from "../utils/JSONReviver";
import { DarknetServer as IDarknetServer } from "@nsdefs";
import { DarknetServerData } from "../DarkNet/models/DarknetServerOptions";
import { Minigames } from "../DarkNet/enums";

export class DarknetServer extends BaseServer implements IDarknetServer, DarknetServerData {
  /** The icon of the server, used for display */
  icon: Icon | typeof labIcon;
  /** The password for the server, used for authentication */
  password: string;
  /** The model of the server. Similar models have similar vulnerabilities. */
  modelId: Minigames;
  /** The generic password prompt for the server */
  staticPasswordHint: string;
  /** Data associated with the password hint */
  passwordHintData?: string;
  /** The difficulty rating of the server, associated with its original depth in the net */
  difficulty: number;
  /** The depth of the server in the net */
  depth: number;
  /** The left offset of the server in the net */
  leftOffset: number;
  /** If the server has a stasis link applied */
  hasStasisLink: boolean;
  /** The amount of ram blocked by the server owner */
  ramBlock: number;
  /** The interval at which the server logs traffic */
  logTrafficInterval: number;
  /** The charisma skill required to heartbleed the server */
  requiredCharismaSkill: number;

  constructor(props?: IConstructorParams & DarknetServerData) {
    super(props);
    this.icon = props?.icon || labIcon;
    this.password = props?.password || "";
    this.modelId = props?.modelId || "ZeroLogon";
    this.staticPasswordHint = props?.staticPasswordHint || "";
    this.passwordHintData = props?.passwordHintData;
    this.difficulty = props?.difficulty || 0;
    this.depth = props?.depth || 0;
    this.leftOffset = props?.leftOffset || 0;
    this.hasStasisLink = props?.hasStasisLink || false;
    this.ramBlock = props?.ramBlock || 0;
    this.logTrafficInterval = props?.logTrafficInterval || 0;
    this.requiredCharismaSkill = props?.requiredCharismaSkill || 0;
  }

  toJSON(): IReviverValue {
    return this.toJSONBase("DarknetServer", includedKeys);
  }

  static fromJSON(value: IReviverValue): DarknetServer {
    return BaseServer.fromJSONBase(value, DarknetServer, includedKeys);
  }
}

const includedKeys = BaseServer.getIncludedKeys(DarknetServer);
constructorsForReviver.DarknetServer = DarknetServer;

export const exampleDarknetServer: IDarknetServer = {
  difficulty: 0,
  hasAdminRights: false,
  hasStasisLink: false,
  hostname: "darkweb",
  ip: "",
  isConnectedTo: false,
  maxRam: 16,
  organizationName: "",
  purchasedByPlayer: false,
  ramBlock: 0,
  ramUsed: 0,
  requiredCharismaSkill: 0,
  staticPasswordHint: "The passkey is 'leekspin'",
  passwordHintData: "leekspin",
  depth: -1,
  modelId: "DeskMemo_3.1",
  logTrafficInterval: -1,
};
