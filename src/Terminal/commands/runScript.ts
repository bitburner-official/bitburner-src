import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { LogBoxEvents } from "../../ui/React/LogBoxManager";
import { createRunningScriptInstance, startWorkerScript } from "../../NetscriptWorker";
import libarg from "arg";
import { ScriptArg } from "@nsdefs";
import { isPositiveInteger } from "../../types";
import { ScriptFilePath, isLegacyScript } from "../../Paths/ScriptFilePath";
import { sendDeprecationNotice } from "./common/deprecation";
import { roundToTwo } from "../../utils/helpers/roundToTwo";
import { RamCostConstants } from "../../Netscript/RamCostGenerator";
import { pluralize } from "../../utils/I18nUtils";

export function runScript(
  scriptPath: ScriptFilePath,
  commandArgs: (string | number | boolean)[],
  server: BaseServer,
): void {
  if (isLegacyScript(scriptPath)) {
    sendDeprecationNotice();
    return;
  }
  const runArgs = { "--tail": Boolean, "-t": Number, "--ram-override": Number, "--temporary": Boolean };
  let flags: {
    _: ScriptArg[];
    "--tail": boolean;
    "-t": string;
    "--ram-override": string;
    "--temporary": boolean;
  };
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
    flags = libarg(runArgs, {
      permissive: true,
      argv: commandArgs,
    });
  } catch (error) {
    Terminal.error(`无效的参数。${error}。`);
    return;
  }
  const tailFlag = flags["--tail"] === true;
  const numThreads = parseFloat(flags["-t"] ?? 1);
  const ramOverride = flags["--ram-override"] != null ? roundToTwo(parseFloat(flags["--ram-override"])) : undefined;
  if (!isPositiveInteger(numThreads)) {
    return Terminal.error("指定的线程数无效。线程数必须是大于 0 的整数");
  }
  if (ramOverride != null && (isNaN(ramOverride) || ramOverride < RamCostConstants.Base)) {
    Terminal.error(
      `指定的 RAM 覆盖值无效。RAM 覆盖值必须是大于 ${RamCostConstants.Base} 的数字`,
    );
    return;
  }
  const tempFlag = flags["--temporary"] === true;

  // Todo: Switch out arg for something with typescript support
  const args = flags._;

  const result = createRunningScriptInstance(
    server,
    scriptPath,
    { threads: numThreads, temporary: tempFlag, ramOverride, preventDuplicates: false },
    args,
  );
  if (!result.success) {
    Terminal.error(result.message);
    return;
  }

  // Able to run script
  const runningScript = result.runningScript;
  runningScript.threads = numThreads;

  const success = startWorkerScript(runningScript, server);
  if (!success) {
    Terminal.error(`启动脚本失败`);
    return;
  }

  Terminal.print(
    `正在以 ${pluralize(numThreads, "个线程", "个线程")}运行脚本，pid ${runningScript.pid}，参数：${JSON.stringify(
      args,
    )}。`,
  );
  if (tailFlag) {
    LogBoxEvents.emit(runningScript);
  }
  return;
}
