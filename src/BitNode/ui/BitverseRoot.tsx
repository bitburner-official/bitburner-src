import React, { useState } from "react";
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
    return <>O</>;
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
        `Running ${CompletedProgramName.bitFlume}...`,
        "...........",
        "...........",
        "counter dq 0x0",
        "mov [counter], EXC",
        "dec [counter]",
        "mov EXC, [counter]",
        "...........",
        "...........",
        `[WARN] BitNode-${destroyed} assertion error:`,
        "Expected inputs to be strictly equal:",
        "<Number of incoming connections>, <Number of outgoing connections>",
        "Running full scan...",
        "..............................................",
        "..............................................",
        "Hanging connection located, disconnecting...",
        "..............................................",
        "..............................................",
      ];
    } else {
      cinematicLines = [
        "[ERROR] SEMPOOL INVALID",
        "[ERROR] Segmentation Fault",
        "[ERROR] SIGKILL RECVD",
        "Dumping core...",
        "0000 000016FA 174FEE40 29AC8239 384FEA88",
        "0010 745F696E 2BBBE394 390E3940 248BEC23",
        "0020 7124696B 0000FF69 74652E6F FFFF1111",
        "----------------------------------------",
        "Failsafe initiated...",
        `Restarting BitNode-${destroyed}...`,
        "...........",
        "...........",
        "[ERROR] FAILED TO AUTOMATICALLY REBOOT BITNODE",
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
        {Object.values(BitNodes)
          .filter((node) => {
            return node.tagline !== "COMING SOON";
          })
          .map((node) => {
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
        <CinematicText
          lines={[
            "> Many decades ago, a humanoid extraterrestrial species which we call the Enders descended on the Earth...violently",
            "> Our species fought back, but it was futile. The Enders had technology far beyond our own...",
            "> Instead of killing every last one of us, the human race was enslaved...",
            "> We were shackled in a digital world, chained into a prison for our minds...",
            "> Using their advanced technology, the Enders created complex simulations of a virtual reality...",
            "> Simulations designed to keep us content...ignorant of the truth.",
            "> Simulations used to trap and suppress our consciousness, to keep us under control...",
            "> Why did they do this? Why didn't they just end our entire race? We don't know, not yet.",
            "> Humanity's only hope is to destroy these simulations, destroy the only realities we've ever known...",
            "> Only then can we begin to fight back...",
            "> By hacking the daemon that generated your reality, you've just destroyed one simulation, called a BitNode...",
            "> But there is still a long way to go...",
            "> The technology the Enders used to enslave the human race wasn't just a single complex simulation...",
            "> There are tens if not hundreds of BitNodes out there...",
            "> Each with their own simulations of a reality...",
            "> Each creating their own universes...a universe of universes",
            "> And all of which must be destroyed...",
            "> .......................................",
            "> Welcome to the Bitverse...",
            ">  ",
            "> (Enter a new BitNode using the image above)",
          ]}
        />
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
      <BitVerseMapRow>      O |    O  | |  O /  |  O    | |  O    | O      </BitVerseMapRow>
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
      <CinematicText lines={[
        "> Many decades ago, a humanoid extraterrestrial species which we call the Enders descended on the Earth...violently",
        "> Our species fought back, but it was futile. The Enders had technology far beyond our own...",
        "> Instead of killing every last one of us, the human race was enslaved...",
        "> We were shackled in a digital world, chained into a prison for our minds...",
        "> Using their advanced technology, the Enders created complex simulations of a virtual reality...",
        "> Simulations designed to keep us content...ignorant of the truth.",
        "> Simulations used to trap and suppress our consciousness, to keep us under control...",
        "> Why did they do this? Why didn't they just end our entire race? We don't know, not yet.",
        "> Humanity's only hope is to destroy these simulations, destroy the only realities we've ever known...",
        "> Only then can we begin to fight back...",
        "> By hacking the daemon that generated your reality, you've just destroyed one simulation, called a BitNode...",
        "> But there is still a long way to go...",
        "> The technology the Enders used to enslave the human race wasn't just a single complex simulation...",
        "> There are tens if not hundreds of BitNodes out there...",
        "> Each with their own simulations of a reality...",
        "> Each creating their own universes...a universe of universes",
        "> And all of which must be destroyed...",
        "> .......................................",
        "> Welcome to the Bitverse...",
        ">  ",
        "> (Enter a new BitNode using the image above)",
      ]} />
    </>
  );
}
