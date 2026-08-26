# Bitburner 汉化规范（供所有翻译执行者严格遵守）

目标：将玩家可见的英文界面文字汉化为简体中文，**不破坏任何代码逻辑与编译**。

## 必须翻译
- JSX 文本节点：`<Typography>Some text</Typography>` → `<Typography>一些文字</Typography>`
- UI 属性的字符串值：`title=`、`tooltip=`、`label=`、`placeholder=`、`aria-label=`、`autoComplete` 以外的可见文本属性
- 对话框 / 通知 / 日志消息字符串（dialogBoxCreate、dialogBoxCreateAlert 等）
- 按钮文字、表头、列表项、选项卡名称、描述性句子

## 绝对不能翻译（翻译会导致 bug 或编译失败）
1. 用作 **标识符、比较值、对象键、枚举值、事件名、存储键、文件扩展名、路径、URL、正则表达式** 的字符串：
   - `if (x === "enabled")`、`{ key: "value" }`（value 为语义键）、`addEventListener("click")`
2. HTML/CSS/代码示例中的代码本身；HTML 标签与实体（`<br/>` `&nbsp;`）保持原样
3. Netscript 函数名/参数名/API 名称、命令名（如 `scan`、`nano`）、程序/文件名（如 `BruteSSH.exe`）
4. 插值与转义：`${...}`、`{expr}` JSX 表达式、`\n`、`%s`、`%d` 等占位符必须原样保留，不得增删
5. 单位符号：`$`、`RAM`、`GB`、`ms`、数字格式
6. 字符串首尾的空格必须保留

## 术语表（统一使用）
| 英文 | 中文 |
|---|---|
| Hack (动词) | 入侵 |
| Hacking (技能) | 黑客 |
| server | 服务器 |
| script | 脚本 |
| faction | 派系 |
| company | 公司 |
| Corporation | 企业 |
| division | 部门 |
| industry | 行业 |
| gang | 帮派 |
| Augmentation(s) | 强化 |
| Source-File | 源文件 |
| BitNode | BitNode（不译） |
| reputation | 声望 |
| money/funds | 资金 |
| Bladeburner | Bladeburner（不译） |
| Black Ops | 黑色行动 |
| Synthoid | 合成人 |
| Sleeve(s) | 分身 |
| Stanek's Gift | Stanek 的礼物 |
| Church of the Machine God | 机械神教 |
| Go (棋类) | 围棋 |
| Infiltration | 潜入 |
| Casino | 赌场 |
| Stock Market | 股票市场 |
| Dark Web | 暗网 |
| Coding Contract | 编程合约 |
| crime | 犯罪 |
| hospital | 医院 |
| gym | 健身房 |
| university | 大学 |
| travel | 旅行 |
| home computer | 家用电脑 |
| Terminal | 终端 |
| Script Editor | 脚本编辑器 |
| Active Scripts | 运行中的脚本 |
| Stats | 属性 |
| Character | 角色 |
| Hacknet | Hacknet（不译） |
| hash(es) | 哈希 |
| install(ation) | 安装 |
| augment player | 强化角色 |
| prestige | 转生 |
| save | 存档 |
| load | 读档 |
| export | 导出 |
| import | 导入 |
| options/settings | 设置 |
| tutorial | 教程 |

## 行文风格
- 句子末尾句号用中文句号"。"；列表短语可省略标点
- 冒号用中文冒号"："；括号用全角"（）"，但包裹纯英文/数字时保留半角
- 数字两侧保留空格习惯与原文一致
- 语气简洁自然，符合游戏 UI 文案习惯

## 工作方式
- 只修改字符串字面量的内容；不改动任何其他代码、注释、格式
- 不确定是否为标识符时，先查该字符串在仓库中是否有比较/赋值用法（rg 搜索），有则不译
- 完成后自查：括号/引号配对完整、无残留 `${` 缺失、无把 `{`/`}` 删掉
