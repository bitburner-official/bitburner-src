export const ConsoleHelpText: {
  [key: string]: string[];
  helpList: string[];
  automate: string[];
  clear: string[];
  cls: string[];
  help: string[];
  log: string[];
  skill: string[];
  start: string[];
  stop: string[];
} = {
  helpList: [
    "使用 'help [command]' 可查看某个Bladeburner控制台命令的更多信息。",
    " ",
    "    automate [var] [val] [hi/low] 为Bladeburner任务配置简单的自动化",
    "    clear/cls                     清空控制台",
    "    help [cmd]                    显示本帮助文本，或某个特定命令的帮助文本",
    "    log [en/dis] [type]           启用或禁用事件与行动的日志记录",
    "    skill [action] [name]         升级你的Bladeburner技能，或显示技能信息",
    "    start [type] [name]           开始一个Bladeburner行动/任务",
    "    stop                          停止当前Bladeburner行动/任务",
    " ",
  ],
  automate: [
    "用法：automate [var] [val] [hi/low]",
    " ",
    "一种自动化Bladeburner行动的简单方式。该控制台命令可在你的体力高于某一阈值时自动开始某个行动，并在体力低于另一阈值时" +
      "自动切换到另一个行动。",
    " ",
    "    automate status - 查看自动化的当前状态及其行为简述",
    "    automate en - 启用自动化功能",
    "    automate dis - 禁用自动化功能",
    " ",
    "要让自动化正常工作，必须设置四个属性。设置方法如下：",
    " ",
    "    automate stamina 100 high",
    "    automate contract Tracking high",
    "    automate stamina 50 low",
    "    automate general 'Field Analysis' low",
    " ",
    "使用上面四条控制台命令后，自动化将在体力达到100或更高时执行追踪（Tracking）合约，并在体力低于" +
      "50时切换到现场分析（Field Analysis）。注意：设置行动时，行动名称区分大小写（CASE-SENSITIVE）。它必须" +
      "与UI中的名称完全一致。",
    " ",
  ],
  clear: ["用法：clear", " ", "清空控制台", " "],
  cls: ["用法：cls", " ", "清空控制台", " "],
  help: [
    "用法：help [command]",
    " ",
    "不带参数运行 'help' 会显示通用帮助文本，其中列出所有控制台命令" +
      "及其简要说明。也可以指定某个命令来获取该命令的具体帮助文本。" +
      "例如：",
    " ",
    "    help automate",
    " ",
    "将显示 automate 控制台命令的详细用法说明",
    " ",
  ],
  log: [
    "用法：log [en/dis] [type]",
    " ",
    "启用或禁用日志记录。默认情况下，合约/行动等任务的完成结果会记录在控制台中。" +
      "此外还有一些随机事件也会被记录。共有五类可记录的内容：",
    " ",
    "[general, contracts, ops, blackops, events]",
    " ",
    "这些类别的日志可按如下方式启用或禁用：",
    " ",
    "    log dis contracts - 禁用合约完成时的日志记录",
    "    log en contracts - 启用合约完成时的日志记录",
    "    log dis events - 禁用Bladeburner随机事件的日志记录",
    " ",
    "可以使用 'all' 关键字统一启用/禁用所有日志：",
    " ",
    "    log dis all",
    "    log en all",
    " ",
  ],
  skill: [
    "用法：skill [action] [name]",
    " ",
    "升级你的技能，或显示技能信息。",
    " ",
    "要显示所有技能及加成信息，请使用：",
    " ",
    "    skill list",
    " ",
    "要显示某个具体技能的信息，请在后面附上技能名称。" +
      "注意技能名称区分大小写，必须与UI中显示的完全一致。如果" +
      "技能名称中含有空格，请用双引号将其括起来：",
    " ",
    "    skill list Reaper",
    "    skill list 'Digital Observer'",
    " ",
    "该控制台命令也可用于升级技能：",
    " ",
    "    skill level [skill name]",
    " ",
  ],
  start: [
    "用法：start [type] [name]",
    " ",
    "开始一个行动。行动由其类型和名称指定。名称区分大小写，必须与UI中显示的完全一致。如果行动名称中含有空格，请用双引号将其括起来。" +
      "有效的行动类型包括：",
    " ",
    "[general, contract, op, blackop]",
    " ",
    "示例：",
    " ",
    "    start contract Tracking",
    "    start op 'Undercover Operation'",
    " ",
  ],
  stop: ["用法：stop", " ", "停止当前行动并进入空闲状态。", " "],
};
