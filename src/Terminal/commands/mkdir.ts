import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { StdIO } from "../StdIO/StdIO";

export function mkdir(args: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): undefined {
  Terminal.fatal(
    "Directories do not exist in the Bitburner filesystem. They are simply part of the file path.\n" +
      `For example, with "/foo/bar.txt", there is no actual "/foo" directory.`,
    stdIO,
  );
}
