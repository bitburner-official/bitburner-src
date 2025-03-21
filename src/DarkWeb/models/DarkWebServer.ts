import { getName } from "../controllers/DarkWebServerGenerator";
import { Icon } from "../controllers/ServerIcon";

export type PasswordResponse = {
  success: boolean;
  status: number;
  msg: string;
  responseTime: number;
  passwordLength?: number;
  passwordFormat?: string;
  charsMatchingAndCorrectlyLocated?: number;
  charsMatchingButMisplaced?: number;
}

export type DwebConnection = {
  id: string,
  x: number,
  y: number,
}

export class DarkWebServer {
    name: string;
    id: string;
    icon: Icon;
    difficulty: number;
    chaRequired: number;
    password: string;
    passwordChecker: (attemptedPassword: string, server: DarkWebServer) => PasswordResponse;
    unlocked: boolean = false;
    x: number;
    y: number;
    connections: DwebConnection[] = [];

    constructor(options: Partial<DarkWebServer> & {
      passwordChecker: (attemptedPassword: string, server: DarkWebServer) => PasswordResponse,
      x: number, y: number}
    ) {
      this.difficulty = options.difficulty ?? 1;
      this.name = options.name ?? getName(this.difficulty);
      this.icon = options.icon ?? Icon.ConnectedTv;
      this.chaRequired = options.chaRequired ?? this.difficulty * 10;
      this.password = options.password ?? "";
      this.passwordChecker = options.passwordChecker;
      this.unlocked = options.unlocked ?? false;
      this.id = Math.random().toString(16).slice(2);
      this.x = options.x;
      this.y = options.y;
    }
}