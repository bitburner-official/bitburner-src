import { Terminal } from "../../Terminal";

export function mkdir(): void {
  Terminal.error(
    "Directories do not exist in the Bitburner filesystem. They are simply part of the file path.\n" +
      `For example, with "/foo/bar.txt", there is no actual "/foo" directory.`,
  );
}
