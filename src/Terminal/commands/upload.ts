import { Terminal } from "../../Terminal";
import type { TerminalAction } from "../TerminalAction";
import type { BaseServer } from "../../Server/BaseServer";
import { combinePath, isFilePath } from "../../Paths/FilePath";
import { hasTextExtension, validTextExtensions } from "../../Paths/TextFilePath";
import { hasScriptExtension, validScriptExtensions } from "../../Paths/ScriptFilePath";
import { PromptEvent } from "../../ui/React/PromptManager";
import type { ContentFilePath } from "../../Paths/ContentFile";
import { type Directory, invalidCharacters } from "../../Paths/Directory";
import { pluralize } from "../../utils/I18nUtils";

function pickDirectory(): Promise<FileList | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.webkitdirectory = true;
    input.onchange = () => {
      resolve(input.files);
    };
    input.oncancel = () => {
      resolve(null);
    };
    input.click();
  });
}

function askConfirm(txt: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    PromptEvent.emit({
      txt,
      resolve: (value: string | boolean) => {
        if (typeof value === "string") {
          reject(new Error("PromptEvent got a string, expected boolean"));
        } else {
          resolve(value);
        }
      },
    });
  });
}

async function uploadAsync(destination: Directory, destForPrint: string, server: BaseServer) {
  const files = await pickDirectory();
  if (files === null || files.length === 0) {
    return;
  }
  const withPath: (
    | { badPath: string }
    | { overwrite: ContentFilePath; file: File }
    | { create: ContentFilePath; file: File }
  )[] = [...files].map((f) => {
    const { webkitRelativePath } = f;
    /*
     If the player has a directory /home/alice/foo/bar on her computer
     and wants to upload the contents of the directory
     and if the directory hierarchy looks like this:
     /home/alice/foo/bar
     ├── hello
     │   └── world.js
     └── more
         └── files.txt
      `webkitRelativePath` for world.js will be "bar/hello/world.js"
      `path` will be "hello/world.js"
      `webkitRelativePath` for files.txt will "bar/more/files.txt"
      `path` will be "more/files.txt"
     */
    const path = webkitRelativePath.substring(1 + webkitRelativePath.indexOf("/"));
    if (!isFilePath(path)) {
      return { badPath: path };
    }
    const destFilePath = combinePath(destination, path);
    let fileExists: boolean;
    if (hasTextExtension(destFilePath)) {
      fileExists = server.textFiles.has(destFilePath);
    } else if (hasScriptExtension(destFilePath)) {
      fileExists = server.scripts.has(destFilePath);
    } else {
      return { badPath: path };
    }
    if (fileExists) {
      return {
        overwrite: destFilePath,
        file: f,
      };
    }
    return {
      create: destFilePath,
      file: f,
    };
  });
  const overwrite = withPath.filter((item) => "overwrite" in item);
  const skipped = withPath.filter((item) => "badPath" in item);
  const create = withPath.filter((item) => "create" in item);
  const lines = [`将文件上传到 ${destForPrint}？`];
  if (overwrite.length !== 0) {
    lines.push(
      "",
      `${pluralize(overwrite.length, "个文件", "个文件")}将被覆盖：`,
      ...overwrite.map(({ overwrite }) => overwrite),
    );
  }
  if (skipped.length !== 0) {
    const extensions = [...validScriptExtensions, ...validTextExtensions];
    lines.push(
      "",
      `文件路径中不允许使用字符 ${invalidCharacters
        .filter((v) => v !== "/")
        .join(" ")} 和空白字符。`,
      `只允许以下文件扩展名：${extensions.join(", ")}。`,
      "文件名在扩展名之前必须至少有一个字符。",
      "",
      `${pluralize(skipped.length, "个文件", "个文件")}因文件路径不合规而被跳过：`,
      ...skipped.map(({ badPath }) => badPath),
    );
  }
  if (create.length !== 0) {
    lines.push("", `将创建 ${pluralize(create.length, "个新文件", "个新文件")}：`, ...create.map(({ create }) => create));
  }
  if (!(await askConfirm(lines.join("\n")))) {
    return;
  }
  for (const item of [...overwrite, ...create]) {
    const destFilePath = "create" in item ? item.create : item.overwrite;
    let text: string | undefined = undefined;
    try {
      text = await item.file.text();
    } catch (error) {
      console.error(error);
      Terminal.error(`上传 ${destFilePath} 失败。错误：${error}`);
      continue;
    }
    server.writeToContentFile(destFilePath, text);
  }
  Terminal.print(`已成功将文件上传到 ${destForPrint}`);
}

export function upload(args: (string | number | boolean)[], server: BaseServer): undefined | TerminalAction {
  if (args.length !== 1) {
    return Terminal.error("upload 命令用法不正确。用法：upload [dir]");
  }
  const destinationInput = String(args[0]);
  const destination = Terminal.getDirectory(destinationInput);
  if (destination === null) {
    return Terminal.error(`无法将 ${destinationInput} 解析为目录`);
  }
  const destForPrint = destination === "" ? "/" : destination;
  return {
    cancel: () => {}, // Upload ignores cancellation
    finished: uploadAsync(destination, destForPrint, server),
    getProgressText: () => `正在将文件上传到 ${destForPrint}`,
  };
}
