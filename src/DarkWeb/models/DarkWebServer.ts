import { getName, getRandomIcon } from "../controllers/DarkWebServerGenerator";
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
};

export type DwebConnection = {
  id: string;
  x: number;
  y: number;
};

export type DarkWebServer = {
  name: string;
  id: string;
  icon: Icon;
  difficulty: number;
  chaRequired: number;
  password: string;
  passwordChecker: (attemptedPassword: string, server: DarkWebServer) => PasswordResponse;
  unlocked: boolean;
  x: number;
  y: number;
  connections: DwebConnection[];
}

export const DWebServerBuilder = (options: Partial<DarkWebServer>): DarkWebServer => <DarkWebServer>({
  name: options.name ?? getName(options.difficulty ?? 1),
  icon: options.icon ?? getRandomIcon(),
  difficulty: options.difficulty ?? 1,
  chaRequired: options.chaRequired ?? (options.difficulty ?? 1) * 10,
  password: options.password ?? "",
  passwordChecker: options.passwordChecker,
  unlocked: options.unlocked ?? false,
  id: Math.random().toString(16).slice(2),
  x: options.x,
  y: options.y,
  connections: options.connections ?? [],
});
