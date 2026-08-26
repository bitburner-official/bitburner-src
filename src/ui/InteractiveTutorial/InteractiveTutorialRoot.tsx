import React, { useEffect } from "react";

import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { ITutorialEvents } from "./ITutorialEvents";
import { CopyableText } from "../React/CopyableText";

import ListItem from "@mui/material/ListItem";
import EqualizerIcon from "@mui/icons-material/Equalizer";
import LastPageIcon from "@mui/icons-material/LastPage";
import HelpIcon from "@mui/icons-material/Help";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import StorageIcon from "@mui/icons-material/Storage";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";

import {
  iTutorialPrevStep,
  iTutorialNextStep,
  ITutorial,
  iTutorialSteps,
  iTutorialEnd,
} from "../../InteractiveTutorial";
import { useRerender } from "../React/hooks";
import { Settings } from "../../Settings/Settings";
import { DocumentationLink } from "../React/DocumentationLink";
import { defaultNsApiPage } from "../React/Documentation";

interface IContent {
  content: React.ReactElement;
  canNext: boolean;
}

const useStyles = makeStyles()((theme: Theme) => ({
  textfield: {
    borderBottom: "1px solid " + theme.palette.primary.main,
  },
  code: {
    whiteSpace: "pre",
    backgroundColor: theme.palette.background.paper,
  },
}));

export function InteractiveTutorialRoot(): React.ReactElement {
  const { classes } = useStyles();
  const rerender = useRerender();

  const tutorialScriptName = `n00dles.js`;

  const contents: Record<string, IContent | undefined> = {
    [iTutorialSteps.Start as number]: {
      content: (
        <>
          <Typography>
            欢迎来到 Bitburner，一款赛博朋克题材的放置类 RPG！游戏发生在黑暗的反乌托邦未来……那一年是 2077 年……
            <br />
            <br />
            本教程将向你介绍游戏的基础知识。你可以随时跳过教程。
            <br />
            <br />
            你可以在“设置”选项卡中点击“重置教程”来重新进行本教程。
            <br />
            <br />
            你也可以折叠此面板来暂时隐藏本教程。
          </Typography>
        </>
      ),
      canNext: true,
    },
    [iTutorialSteps.GoToCharacterPage as number]: {
      content: (
        <>
          <Typography>我们先前往“属性”页面。点击</Typography>
          <ListItem>
            <EqualizerIcon color={"error"} />
            <Typography color={"error"}>属性</Typography>
          </ListItem>

          <Typography>（位于主导航菜单，即屏幕左侧）</Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.CharacterPage as number]: {
      content: (
        <>
          <ListItem>
            <EqualizerIcon color={"primary"} />
            <Typography color={"primary"}>属性</Typography>
          </ListItem>
          <Typography>
            显示了许多关于你游戏进度的重要信息，例如你的技能、资金和加成。
          </Typography>
        </>
      ),
      canNext: true,
    },
    [iTutorialSteps.CharacterGoToTerminalPage as number]: {
      content: (
        <>
          <Typography>接下来点击</Typography>
          <ListItem>
            <LastPageIcon color={"error"} />
            <Typography color={"error"}>终端</Typography>
          </ListItem>
          <Typography>前往你的电脑终端（位于主导航菜单中）。</Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalIntro as number]: {
      content: (
        <>
          <ListItem>
            <LastPageIcon color={"primary"} />
            <Typography color={"primary"}>终端</Typography>
          </ListItem>
          <Typography>
            用于连接你的家用电脑以及世界各地的其他机器。
          </Typography>
        </>
      ),
      canNext: true,
    },
    [iTutorialSteps.TerminalHelp as number]: {
      content: (
        <>
          <Typography>我们来试试看。先输入</Typography>
          <Typography classes={{ root: classes.textfield }}>{"[home /]> help"}</Typography>
          <Typography>（别忘了输入命令后按回车键）</Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalLs as number]: {
      content: (
        <>
          <Typography classes={{ root: classes.textfield }}>{"[home /]> help"}</Typography>
          <Typography>
            会显示所有可用的终端命令列表、用法及其功能说明。{" "}
            <br />
            <br />
            我们再试另一个命令。输入
          </Typography>

          <Typography classes={{ root: classes.textfield }}>{"[home /]> ls"}</Typography>
          <Typography>
            <br />（“ls” 是 “list” 的缩写）
          </Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalScan as number]: {
      content: (
        <>
          <Typography classes={{ root: classes.textfield }}>{"[home /]> ls"}</Typography>
          <Typography>
            {" "}
            是一个列出电脑上文件的基础命令。现在，它显示你的电脑上有一个名为{" "}
            NUKE.exe 的程序。我们稍后会介绍它的用途。 <br />
            <br />
            使用家用电脑的终端，你可以连接到世界各地的其他机器。我们现在就来试试，先输入
          </Typography>
          <Typography classes={{ root: classes.textfield }}>{"[home /]> scan"}</Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalScanAnalyze1 as number]: {
      content: (
        <>
          <Typography classes={{ root: classes.textfield }}>{"[home /]> scan"}</Typography>
          <Typography>
            显示所有可用的网络连接。也就是说，它会列出从当前机器可以直接连接的所有服务器。服务器由其主机名标识。 <br />
            <br />
            不过服务器实在太多了，你该去哪一个呢？{" "}
          </Typography>

          <Typography classes={{ root: classes.textfield }}>{"[home /]> scan-analyze"}</Typography>
          <Typography>会给出网络中服务器的更详细信息。现在就试试吧！</Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalScanAnalyze2 as number]: {
      content: (
        <>
          <Typography classes={{ root: classes.textfield }}>{"[home /]> scan-analyze"}</Typography>
          <Typography>
            显示你可以连接到的每台服务器（距离一个节点的服务器）的更详细信息。 <br />
            <br /> 还可以用更大的深度运行 scan-analyze。让我们用以下命令尝试深度为 2：{" "}
          </Typography>

          <Typography classes={{ root: classes.textfield }}>{"[home /]> scan-analyze 2"}</Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalConnect as number]: {
      content: (
        <>
          <Typography>
            现在你可以看到两节点以内的所有服务器信息，并了解如何通过网络导航到这些服务器。你只能连接距离一个节点以内的服务器。要连接到某台机器，请使用
          </Typography>
          <Typography classes={{ root: classes.textfield }}>{"[home /]> connect hostname"}</Typography>

          <Typography>根据 </Typography>
          <Typography classes={{ root: classes.textfield }}>{"[home /]> scan-analyze 2"}</Typography>

          <Typography>
            {" "}
            的结果可以看到 n00dles 服务器只有一个节点的距离。我们现在使用以下命令连接它：
          </Typography>

          <Typography classes={{ root: classes.textfield }}>{"[home /]> connect n00dles"}</Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalAnalyze as number]: {
      content: (
        <>
          <Typography>
            你已经连接到了另一台机器！现在能做什么？入侵它！
            <br />
            <br /> 在 2077 年，货币已经数字化并去中心化。人们和企业把资金存储在服务器和电脑上。利用你的黑客能力，你可以入侵服务器来窃取资金并获得经验。 <br />
            <br />
            在你尝试入侵服务器之前，应该先用以下命令运行诊断{" "}
          </Typography>
          <Typography classes={{ root: classes.textfield }}>{"[n00dles /]> analyze"}</Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalNuke as number]: {
      content: (
        <>
          <Typography>当 </Typography>
          <Typography classes={{ root: classes.textfield }}>{"[n00dles /]> analyze"}</Typography>

          <Typography>
            运行完毕后，会显示有关入侵该服务器的有用信息。 <br />
            <br /> 对于这台服务器，所需的黑客等级只有 1，也就是说你现在就可以入侵它。但是，要入侵一台服务器，你必须先获得
            root 权限。之前在你的家用电脑上看到的 NUKE.exe 程序是一种病毒，只要开放端口数量足够，它就能让你获得机器的
            root 权限。
          </Typography>
          <Typography classes={{ root: classes.textfield }}>{"[n00dles /]> analyze"}</Typography>

          <Typography>
            {" "}
            显示这台机器不需要任何开放端口，NUKE 病毒即可生效，那就用以下命令运行病毒吧{" "}
          </Typography>
          <Typography classes={{ root: classes.textfield }}>{"[n00dles /]> run NUKE.exe"}</Typography>

          <Typography></Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalManualHack as number]: {
      content: (
        <>
          <Typography>你现在已获得 root 权限！可以用以下命令入侵服务器 </Typography>
          <Typography classes={{ root: classes.textfield }}>{"[n00dles /]> hack"}</Typography>

          <Typography> 现在就试试吧。</Typography>
        </>
      ),
      canNext: true,
    },
    [iTutorialSteps.TerminalHackingMechanics as number]: {
      content: (
        <Typography component="div">
          你现在正在尝试入侵该服务器。入侵需要时间，且只有一定的成功率。时间和成功率由多种因素决定，包括你的黑客等级和服务器的安全等级。
          <br />
          <br />
          如果入侵成功，你将窃取该服务器总资金的一定百分比。这个百分比受你的黑客等级和服务器安全等级影响。
          <br />
          <br />
          服务器上的资金并非无限。因此，如果你不断入侵同一台服务器并耗尽其资金，你会发现收益递减。你需要使用{" "}
          <Typography classes={{ root: classes.textfield }}>{"[n00dles /]> grow"}</Typography>
          来欺骗该公司向其服务器添加资金，以及{" "}
          <Typography classes={{ root: classes.textfield }}>{"[n00dles /]> weaken"}</Typography>
          来提高入侵和增长的速度。
        </Typography>
      ),
      canNext: true,
    },
    [iTutorialSteps.TerminalGoHome as number]: {
      content: (
        <>
          <Typography>在任何服务器上，你都可以使用以下命令回到家</Typography>
          <Typography classes={{ root: classes.textfield }}>{"[n00dles /]> home"}</Typography>

          <Typography>在编写第一个脚本之前，先回家吧！</Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalCreateScript as number]: {
      content: (
        <>
          <Typography>
            入侵是游戏的核心机制，也是推进游戏所必需的。但你不会想一直手动入侵的。你可以通过编写脚本来自动化入侵！
            <br />
            <br />
            要创建新脚本或编辑现有脚本，可以使用{" "}
          </Typography>
          <Typography classes={{ root: classes.textfield }}>{"[home /]> nano"}</Typography>

          <Typography>
            脚本必须以脚本扩展名结尾（.js、.jsx、.ts、.tsx）。我们现在输入以下命令来创建脚本
          </Typography>
          <Typography classes={{ root: classes.textfield }}>{`[home /]> nano ${tutorialScriptName}`}</Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalEditScript as number]: {
      content: (
        <>
          <Typography>
            这是脚本编辑器。你可以在其中编写脚本。点击下面的文本即可复制，然后粘贴到文本编辑器中：
          </Typography>
          <br />
          <Typography component="div" classes={{ root: classes.code }}>
            {
              <CopyableText
                value={`/** @param {NS} ns */
export async function main(ns) {
  while (true) {
    await ns.hack("n00dles");
  }
}`}
              />
            }
          </Typography>
          <br />
          <Typography>
            对于有基础编程经验的人来说，这段代码应该很容易理解。这个脚本会持续入侵 n00dles 服务器。
            <br />
            <br />
            使用底部的搜索工具可以查找并快速浏览任意 NS API 的文档。
            <br />
            <br />
            要访问 <DocumentationLink page={defaultNsApiPage}>NS API 文档</DocumentationLink>，请点击底部的链接。
            <br />
            <br />
            要保存并关闭脚本编辑器，请按底部的按钮。
          </Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalFree as number]: {
      content: (
        <>
          <Typography>
            现在我们来运行脚本。脚本运行需要一定量的 RAM，并且可以在任何你拥有 root 权限的机器上运行。不同服务器的
            RAM 大小不同。你也可以为家用服务器购买更多 RAM。
            <br />
            <br />
            要查看这台机器有多少可用 RAM，请输入
          </Typography>
          <Typography classes={{ root: classes.textfield }}>{"[home /]> free"}</Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalRunScript as number]: {
      content: (
        <>
          <Typography>
            这台机器有 8GB 的空闲 RAM，足以运行我们的脚本。使用以下命令运行脚本
          </Typography>
          <Typography classes={{ root: classes.textfield }}>{`[home /]> run ${tutorialScriptName}`}</Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalGoToActiveScriptsPage as number]: {
      content: (
        <>
          <Typography>
            你的脚本正在运行！它会持续在后台运行，当代码执行完成时自动停止（{tutorialScriptName}
            永远不会结束，因为它运行的是无限循环）。 <br />
            <br />
            这些脚本可以为你被动赚取收入和黑客经验。即使离线，脚本也会继续赚取资金和经验，只是速度略慢。 <br />
            <br />
            点击查看运行中脚本的统计信息{" "}
          </Typography>
          <ListItem>
            <StorageIcon color={"error"} />
            <Typography color={"error"}>运行中的脚本</Typography>
          </ListItem>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.ActiveScriptsPage as number]: {
      content: (
        <>
          <Typography>
            此页面显示你在所有服务器上运行的脚本信息。你可以用它来评估脚本的运行状况。
            <br />
            <br />
            点击 home 查看其上运行的脚本。
            <br />
            <br />
            然后点击 n00dles.js 查看脚本详情。
            <br />
            <br />
            我们回到
          </Typography>
          <ListItem>
            <LastPageIcon color={"error"} />
            <Typography color={"error"}>终端</Typography>
          </ListItem>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.ActiveScriptsToTerminal as number]: {
      content: (
        <>
          <Typography>
            关于脚本的最后一点：每个运行中的脚本都有详细记录其行为的日志。我们可以使用 tail
            命令查看这些日志。现在为我们刚运行的脚本输入以下命令{" "}
          </Typography>
          <Typography classes={{ root: classes.textfield }}>{`[home /]> tail ${tutorialScriptName}`}</Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalTailScript as number]: {
      content: (
        <>
          <Typography>
            这个脚本的日志现在还不会显示太多内容（甚至可能什么都没有），因为它刚刚开始运行……过几分钟再回来看看吧！ <br />
            <br />
            以上就是入侵的基础知识。要了解更多编写脚本的知识，请选择
          </Typography>
          <ListItem>
            <HelpIcon color={"primary"} />
            <Typography color={"primary"}>文档</Typography>
          </ListItem>
          <Typography>
            查看主导航菜单中的文档。
            <br />
            <br />
            现在，让我们继续下一步！
          </Typography>
        </>
      ),
      canNext: true,
    },
    [iTutorialSteps.GoToHacknetNodesPage as number]: {
      content: (
        <>
          <Typography>
            入侵并不是赚钱的唯一途径。另一种被动赚钱的方式是购买和升级 Hacknet 节点。让我们前往
          </Typography>
          <ListItem>
            <AccountTreeIcon color={"error"} />
            <Typography color={"error"}>Hacknet</Typography>
          </ListItem>
          <Typography>（位于主导航菜单中）。</Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.HacknetNodesIntroduction as number]: {
      content: (
        <Typography>
          在这里你可以购买新的 Hacknet 节点并升级已有的节点。现在就来购买一个新的吧。
        </Typography>
      ),
      canNext: true,
    },
    [iTutorialSteps.HacknetNodesGoToWorldPage as number]: {
      content: (
        <>
          <Typography>
            你刚购买了一个 Hacknet 节点！无论在线还是离线，这个节点都会随时间为你被动赚取资金。当你有足够的资金时，可以在下方升级新购买的
            Hacknet 节点。
            <br />
            <br />
            让我们前往
          </Typography>
          <ListItem>
            <LocationCityIcon color={"error"} />
            <Typography color={"error"}>城市</Typography>
          </ListItem>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.WorldDescription as number]: {
      content: (
        <>
          <Typography>
            此页面列出了你当前可以前往的所有地点。每个地点都有可以做的事情。世界上有很多内容等待你去探索和发现！
            <br />
            <br />
            最后，点击
          </Typography>
          <ListItem>
            <HelpIcon color={"error"} />
            <Typography color={"error"}>文档</Typography>
          </ListItem>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.DocumentationPageInfo as number]: {
      content: (
        <Typography component="div">
          此页面包含大量关于游戏内容和机制的文档。我知道内容很多，但我强烈建议你在开始游玩前通读（或至少浏览）一遍。有些页面一开始无法访问，之后才会解锁。
          <br />
          <br />
          按住 Ctrl 键（Mac 键盘上为 Control 键）点击这些页面中的链接时，链接会在新标签页中打开。如果你玩的是
          Steam 版本，链接将在默认浏览器中打开。
          <br />
          <br />
          你至少应该看看这些页面：
          <ul>
            <li>
              <DocumentationLink page="help/getting_started.md">新手指南</DocumentationLink>{" "}
              包含面向新玩家的指南，带你度过大部分前期游戏。
            </li>
            <li>
              <DocumentationLink page={defaultNsApiPage}>NS API 文档</DocumentationLink> 包含所有 NS API 的参考资料。
            </li>
            <li>
              <DocumentationLink page="help/faq.md">常见问题</DocumentationLink> 包含游戏新手经常提出的问题。
            </li>
          </ul>
          <Typography fontWeight="fontWeightBold">
            这个文档页面是获取最新信息的最佳场所，尤其是在你遇到困难时。如果你有问题且在这里找不到答案，请在
            Discord 上询问我们。
          </Typography>
          <br />
          <Typography color={Settings.theme.warning}>
            readthedocs 上的文档已过时且无人维护，请不要使用它们！
          </Typography>
          <br />
          教程到此结束。祝你游戏愉快！
        </Typography>
      ),
      canNext: true,
    },
    [iTutorialSteps.End as number]: {
      content: <Typography></Typography>,
      canNext: true,
    },
  };

  useEffect(() => {
    return ITutorialEvents.subscribe(rerender);
  }, [rerender]);

  const step = ITutorial.currStep;
  const content = contents[step];
  if (content === undefined) {
    throw new Error(`Invalid step in the tutorial: ${step}`);
  }
  return (
    <Paper square sx={{ maxWidth: "70vw", p: 2 }}>
      {content.content}
      <br />
      {step !== iTutorialSteps.DocumentationPageInfo && (
        <>
          {step !== iTutorialSteps.Start && (
            <Button onClick={iTutorialPrevStep} aria-label="上一步" style={{ marginRight: "1em" }}>
              上一步
            </Button>
          )}
          {(content.canNext || ITutorial.stepIsDone[step]) && (
            <Button onClick={iTutorialNextStep} aria-label="下一步">
              下一步
            </Button>
          )}
        </>
      )}
      <br />
      <br />
      <Button onClick={iTutorialEnd}>
        {step !== iTutorialSteps.DocumentationPageInfo ? "退出教程" : "完成教程"}
      </Button>
    </Paper>
  );
}
