import { Icon, labIcon } from "../DarkNet/ui/ServerIcon";
import { BaseServer, IConstructorParams } from "./BaseServer";
import { constructorsForReviver, IReviverValue } from "../utils/JSONReviver";
import { DarknetServer as IDarknetServer } from "@nsdefs";
import { DarknetServerData } from "../DarkNet/models/DarknetServerOptions";
import { exampleDarknetServer, Minigames } from "../DarkNet/enums";
import { createRandomIp } from "../utils/IPAddress";

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

  constructor(
    params: IConstructorParams & DarknetServerData = {
      ...exampleDarknetServer,
      ip: createRandomIp(),
      icon: Icon.Terminal,
      leftOffset: 0,
      password: "",
    },
  ) {
    super(params);
    this.icon = params.icon;
    this.password = params.password;
    this.modelId = params.modelId;
    this.staticPasswordHint = params.staticPasswordHint;
    this.passwordHintData = params.passwordHintData;
    this.difficulty = params.difficulty;
    this.depth = params.depth;
    this.leftOffset = params.leftOffset;
    this.hasStasisLink = params.hasStasisLink;
    this.ramBlock = params.ramBlock;
    this.logTrafficInterval = params.logTrafficInterval;
    this.requiredCharismaSkill = params.requiredCharismaSkill;
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
