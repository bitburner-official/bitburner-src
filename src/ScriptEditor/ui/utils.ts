import { GetServer } from "../../Server/AllServers";
import { OpenScript } from "./OpenScript";

function getServerCode(scripts: OpenScript[], index: number): string | null {
  const openScript = scripts[index];
  const server = GetServer(openScript.hostname);
  if (server === null) throw new Error(`Server '${openScript.hostname}' should not be null, but it is.`);
  const data = server.getContentFile(openScript.path)?.content ?? null;
  return data;
}

function dirty(scripts: OpenScript[], index: number): string {
  const openScript = scripts[index];
  const serverData = getServerCode(scripts, index);
  if (serverData === null) return " *";
  return serverData !== openScript.code ? " *" : "";
}

function reorder(list: unknown[], startIndex: number, endIndex: number): void {
  const [removed] = list.splice(startIndex, 1);
  list.splice(endIndex, 0, removed);
}

export { getServerCode, dirty, reorder };
