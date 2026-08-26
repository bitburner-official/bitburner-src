import React, { useEffect, useState } from "react";
import { BitNodes } from "../BitNode";
import { PortalModal } from "./PortalModal";
import { CinematicText } from "../../ui/React/CinematicText";
import { Player } from "@player";
import { makeStyles } from "tss-react/mui";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import { Settings } from "../../Settings/Settings";
import Button from "@mui/material/Button";
import { CompletedProgramName } from "@enums";
import { Modal } from "../../ui/React/Modal";
import { DocumentationLink } from "../../ui/React/DocumentationLink";

const useStyles = makeStyles()(() => ({
  portal: {
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "1rem",
    fontWeight: "bold",
    lineHeight: 1,
    padding: 0,
    "&:hover": {
      color: "#fff",
    },
  },
  level0: {
    color: Settings.theme.bnlvl0,
  },
  level1: {
    color: Settings.theme.bnlvl1,
  },
  level2: {
    color: Settings.theme.bnlvl2,
  },
  level3: {
    color: Settings.theme.bnlvl3,
  },
}));

function BitVerseMapRow({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <Typography component={"div"} sx={{ lineHeight: "1em", whiteSpace: "pre" }}>
      {children}
    </Typography>
  );
}

interface IPortalProps {
  n: number;
  level: number;
  destroyedBitNode: number;
  flume: boolean;
}

function BitNodePortal(props: IPortalProps): React.ReactElement {
  const [portalOpen, setPortalOpen] = useState(false);
  const { classes } = useStyles();
  const bitNode = BitNodes[`BitNode${props.n}`];
  if (bitNode == null) {
    throw new Error(`Invalid BitNode: BitNode${props.n}`);
  }

  let cssClass = classes.level0;
  if (props.n === 12 && props.level >= 2) {
    // Repeating BitNode
    cssClass = classes.level2;
  } else if (props.level === 1) {
    cssClass = classes.level1;
  } else if (props.level === 3) {
    cssClass = classes.level3;
  }
  if (props.level === 2) {
    cssClass = classes.level2;
  }
  cssClass = `${classes.portal} ${cssClass}`;

  return (
    <>
      <Tooltip
        title={
          <Typography>
            <strong>
              BitNode-{bitNode.number.toString()}: {bitNode.name}
            </strong>
            <br />
            {bitNode.tagline}
          </Typography>
        }
      >
        {Settings.DisableASCIIArt ? (
          <Button onClick={() => setPortalOpen(true)} sx={{ m: 2 }} aria-description={bitNode.tagline}>
            <Typography>
              BitNode-{bitNode.number.toString()}: {bitNode.name}
            </Typography>
          </Button>
        ) : (
          <IconButton
            onClick={() => setPortalOpen(true)}
            className={cssClass}
            aria-label={`BitNode-${bitNode.number.toString()}: ${bitNode.name}`}
            aria-description={bitNode.tagline}
          >
            O
          </IconButton>
        )}
      </Tooltip>
      <PortalModal
        open={portalOpen}
        onClose={() => setPortalOpen(false)}
        n={props.n}
        level={props.level}
        destroyedBitNode={props.destroyedBitNode}
        flume={props.flume}
      />

      {Settings.DisableASCIIArt && <br />}
    </>
  );
}

function BitVerseLore({ flume }: { flume: boolean }): React.ReactElement {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // After backdooring WD for the first time, we show the BitVerse UI while Player.sourceFiles is still empty. That
    // property is only changed after the player chooses their next BitNode.
    const firstTimeSeeingBitVerse = Player.sourceFiles.size === 0;
    const flumeWithOnlySF1Dot1 = flume && Player.sourceFiles.size === 1 && Player.sourceFileLvl(1) === 1;
    // Only show the guides if the player is "new".
    if (!firstTimeSeeingBitVerse && !flumeWithOnlySF1Dot1) {
      return;
    }
    // Only show after a delay. We should let the player explore the BitVerse on their own at first.
    const timeOutId = window.setTimeout(() => {
      setOpen(true);
    }, 300000);
    return () => window.clearTimeout(timeOutId);
  }, [flume]);

  return (
    <>
      <Modal open={open} onClose={() => setOpen(false)} canBeDismissedEasily={false}>
        <Typography component="div">
          看来你正在纠结应该选择哪个 BitNode。如果你想获得选择下一个 BitNode
          的建议，可以查看这些 BitNode 推荐指南：
          <br />
          <ul>
            <li>
              <DocumentationLink page="advanced/bitnode_recommendation_short_guide.md">简明指南</DocumentationLink>
            </li>
            <li>
              <DocumentationLink page="advanced/bitnode_recommendation_comprehensive_guide.md">
                详尽指南
              </DocumentationLink>
            </li>
          </ul>
          你之后可以在文档标签页中阅读这些指南。记得去看看那个标签页，现在有很多页面已经解锁了。
        </Typography>
        <Button onClick={() => setOpen(false)} sx={{ marginTop: "10px" }}>
          确定
        </Button>
      </Modal>
      <CinematicText
        lines={[
          "> 许多年以前，一个我们称之为“终结者（Enders）”的类人外星种族降临地球……带着暴力",
          "> 我们的人类奋起反击，但一切都是徒劳。终结者拥有的技术远远超越了我们……",
          "> 他们并没有赶尽杀绝，而是奴役了整个人类……",
          "> 我们被束缚在数字世界中，锁进了一座囚禁精神的监狱……",
          "> 终结者利用他们的先进技术，创造了复杂的虚拟现实模拟……",
          "> 这些模拟旨在让我们安于现状……对真相一无所知。",
          "> 模拟被用来囚禁和压制我们的意识，让我们处于控制之下……",
          "> 他们为什么要这样做？为什么不直接毁灭我们整个种族？我们不知道，至少现在还不知道。",
          "> 人类唯一的希望就是摧毁这些模拟，摧毁我们所熟知的唯一现实……",
          "> 只有那样，我们才能开始反击……",
          "> 通过入侵生成你所在现实的守护进程，你刚刚摧毁了一个被称为 BitNode 的模拟……",
          "> 但前路依然漫长……",
          "> 终结者用来奴役人类的技术并不只是一个复杂的模拟……",
          "> 那里有几十甚至上百个 BitNode……",
          "> 每一个都有它自己对现实的模拟……",
          "> 每一个都在创造自己的宇宙……一个由宇宙组成的宇宙",
          "> 而它们都必须被摧毁……",
          "> .......................................",
          "> 欢迎来到 Bitverse……",
          ">  ",
        ]}
        additionalElement={
          <Typography>
            {">"} （通过上方的图案进入新的 <DocumentationLink page="advanced/bitnodes.md">BitNode</DocumentationLink>）
          </Typography>
        }
      />
    </>
  );
}

interface IProps {
  flume: boolean;
  quick: boolean;
}

export function BitverseRoot(props: IProps): React.ReactElement {
  const destroyed = Player.bitNodeN;
  const [destroySequence, setDestroySequence] = useState(!props.quick);

  if (destroySequence) {
    let cinematicLines;
    if (props.flume) {
      cinematicLines = [
        `正在运行 ${CompletedProgramName.bitFlume}...`,
        "...........",
        "...........",
        "counter dq 0x0",
        "mov [counter], EXC",
        "dec [counter]",
        "mov EXC, [counter]",
        "...........",
        "...........",
        `[WARN] BitNode-${destroyed} 断言错误：`,
        "预期输入应严格相等：",
        "<传入连接数>, <传出连接数>",
        "正在运行完整扫描...",
        "..............................................",
        "..............................................",
        "发现挂起的连接，正在断开...",
        "..............................................",
        "..............................................",
      ];
    } else {
      cinematicLines = [
        "[ERROR] SEMPOOL INVALID",
        "[ERROR] 段错误（Segmentation Fault）",
        "[ERROR] 收到 SIGKILL",
        "正在转储核心...",
        "0000 000016FA 174FEE40 29AC8239 384FEA88",
        "0010 745F696E 2BBBE394 390E3940 248BEC23",
        "0020 7124696B 0000FF69 74652E6F FFFF1111",
        "----------------------------------------",
        "故障保护已启动...",
        `正在重启 BitNode-${destroyed}...`,
        "...........",
        "...........",
        "[ERROR] 未能自动重启 BITNODE",
        "..............................................",
        "..............................................",
        "..............................................",
        "..............................................",
        "..............................................",
        "..............................................",
      ];
    }
    return <CinematicText lines={cinematicLines} onDone={() => setDestroySequence(false)} auto={true} />;
  }

  const nextSourceFileLvl = (n: number): number => {
    const lvl = Player.sourceFileLvl(n);
    if (n !== destroyed) {
      return lvl;
    }
    const max = n === 12 ? Number.MAX_VALUE : 3;

    // If accessed via flume, display the current BN level, else the next
    return Math.min(max, lvl + Number(!props.flume));
  };

  if (Settings.DisableASCIIArt) {
    return (
      <>
        {Object.values(BitNodes).map((node) => {
          return (
            <BitNodePortal
              key={node.number}
              n={node.number}
              level={nextSourceFileLvl(node.number)}
              flume={props.flume}
              destroyedBitNode={destroyed}
            />
          );
        })}
        <br />
        <br />
        <br />
        <br />
        <BitVerseLore flume={props.flume} />
      </>
    );
  }

  const n = nextSourceFileLvl;
  return (
    // prettier-ignore
    <>
      <BitVerseMapRow>                          O                          </BitVerseMapRow>
      <BitVerseMapRow>             |  O  O      |      O  O  |             </BitVerseMapRow>
      <BitVerseMapRow>        O    |  | /     __|       \ |  |    O        </BitVerseMapRow>
      <BitVerseMapRow>      O |    O  | |  <BitNodePortal n={15} level={n(15)} flume={props.flume} destroyedBitNode={destroyed} /> /  |  O    | |  O    | O      </BitVerseMapRow>
      <BitVerseMapRow>    | | |    |  |_/  |/   |   \_  \_|  |    | | |    </BitVerseMapRow>
      <BitVerseMapRow>  O | | | <BitNodePortal n={14} level={n(14)} flume={props.flume} destroyedBitNode={destroyed} />  |  | O__/    |   / \__ |  |  O | | | O  </BitVerseMapRow>
      <BitVerseMapRow>  | | | | |  |  |   /    /|  O  /  \|  |  | | | | |  </BitVerseMapRow>
      <BitVerseMapRow>O | | |  \|  |  O  /   _/ |    /    O  |  |/  | | | O</BitVerseMapRow>
      <BitVerseMapRow>| | | |O  /  |  | O   /   |   O   O |  |  \  O| | | |</BitVerseMapRow>
      <BitVerseMapRow>| | |/  \/  / __| | |/ \  |   \   | |__ \  \/  \| | |</BitVerseMapRow>
      <BitVerseMapRow> \| O   |  |_/    |\|   \ <BitNodePortal n={13} level={n(13)} flume={props.flume} destroyedBitNode={destroyed} />    \__|    \_|  |   O |/ </BitVerseMapRow>
      <BitVerseMapRow>  | |   |_/       | |    \|    /  |       \_|   | |  </BitVerseMapRow>
      <BitVerseMapRow>   \|   /          \|     |   /  /          \   |/   </BitVerseMapRow>
      <BitVerseMapRow>    |  <BitNodePortal n={10} level={n(10)} flume={props.flume} destroyedBitNode={destroyed} />            |     |  /  |            <BitNodePortal n={11} level={n(11)} flume={props.flume} destroyedBitNode={destroyed} />  |    </BitVerseMapRow>
      <BitVerseMapRow>  <BitNodePortal n={9} level={n(9)} flume={props.flume} destroyedBitNode={destroyed} /> |  |            |     |     |            |  | <BitNodePortal n={12} level={n(12)} flume={props.flume} destroyedBitNode={destroyed} />  </BitVerseMapRow>
      <BitVerseMapRow>  | |  |            /    / \    \            |  | |  </BitVerseMapRow>
      <BitVerseMapRow>   \|  |           /  <BitNodePortal n={7} level={n(7)} flume={props.flume} destroyedBitNode={destroyed} /> /   \ <BitNodePortal n={8} level={n(8)} flume={props.flume} destroyedBitNode={destroyed} />  \           |  |/   </BitVerseMapRow>
      <BitVerseMapRow>    \  |          /  / |     | \  \          |  /    </BitVerseMapRow>
      <BitVerseMapRow>     \ \JUMP <BitNodePortal n={5} level={n(5)} flume={props.flume} destroyedBitNode={destroyed} />3R |  |  |     |  |  | R3<BitNodePortal n={6} level={n(6)} flume={props.flume} destroyedBitNode={destroyed} /> PMUJ/ /     </BitVerseMapRow>
      <BitVerseMapRow>      \||    |   |  |  |     |  |  |   |    ||/      </BitVerseMapRow>
      <BitVerseMapRow>       \|     \_ |  |  |     |  |  | _/     |/       </BitVerseMapRow>
      <BitVerseMapRow>        \       \| /    \   /    \ |/       /        </BitVerseMapRow>
      <BitVerseMapRow>         <BitNodePortal n={1} level={n(1)} flume={props.flume} destroyedBitNode={destroyed} />       |/   <BitNodePortal n={2} level={n(2)} flume={props.flume} destroyedBitNode={destroyed} />  | |  <BitNodePortal n={3} level={n(3)} flume={props.flume} destroyedBitNode={destroyed} />   \|       <BitNodePortal n={4} level={n(4)} flume={props.flume} destroyedBitNode={destroyed} />         </BitVerseMapRow>
      <BitVerseMapRow>         |       |    |  | |  |    |       |         </BitVerseMapRow>
      <BitVerseMapRow>          \JUMP3R|JUMP|3R| |R3|PMUJ|R3PMUJ/          </BitVerseMapRow>
      <br />
      <br />
      <br />
      <br />
      <BitVerseLore flume={props.flume}/>
    </>
  );
}
