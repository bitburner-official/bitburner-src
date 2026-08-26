import { Terminal } from "../../Terminal";

export function mkdir(): undefined {
  Terminal.error(
    "Bitburner 文件系统中不存在目录。目录只是文件路径的一部分。\n" +
      `例如，对于 "/foo/bar.txt"，并不存在实际的 "/foo" 目录。`,
  );
}
