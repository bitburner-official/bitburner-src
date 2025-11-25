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
import { NsApiDocumentationLink } from "../React/NsApiDocumentationLink";

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

function Example({ content }: { content: string }): React.ReactElement {
  const { classes } = useStyles();
  return (
    <>
      <br />
      <Typography>
        Example:{" "}
        <Typography component="span" classes={{ root: classes.textfield }}>
          {content}
        </Typography>
      </Typography>
    </>
  );
}

export function InteractiveTutorialRoot(): React.ReactElement {
  const { classes } = useStyles();
  const rerender = useRerender();

  const tutorialScriptName = `n00dles.js`;

  const contents: Record<iTutorialSteps, IContent | undefined> = {
    [iTutorialSteps.Start]: {
      content: (
        <>
          <Typography>
            Welcome to Bitburner, a cyberpunk-themed incremental RPG! The game takes place in a dark, dystopian
            future... The year is 2077...
            <br />
            <br />
            This tutorial will show you the basics of the game. You may skip the tutorial at any time.
            <br />
            <br />
            You can replay this tutorial by going to the Options tab and pressing "Reset tutorial".
            <br />
            <br />
            You can also collapse this panel to temporarily hide this tutorial.
          </Typography>
        </>
      ),
      canNext: true,
    },
    [iTutorialSteps.GoToCharacterPage]: {
      content: (
        <>
          <Typography>Let's start by heading to the Stats page. Click</Typography>
          <ListItem>
            <EqualizerIcon color={"error"} />
            <Typography color={"error"}>Stats</Typography>
          </ListItem>

          <Typography>on the main navigation menu (left-hand side of the screen)</Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.CharacterPage]: {
      content: (
        <>
          <ListItem>
            <EqualizerIcon color={"primary"} />
            <Typography color={"primary"}>Stats</Typography>
          </ListItem>
          <Typography>
            shows a lot of important information about your progress, such as your skills, money, and bonuses.
          </Typography>
        </>
      ),
      canNext: true,
    },
    [iTutorialSteps.CharacterGoToTerminalPage]: {
      content: (
        <>
          <Typography>Let's head to your computer's terminal by clicking</Typography>
          <ListItem>
            <LastPageIcon color={"error"} />
            <Typography color={"error"}>Terminal</Typography>
          </ListItem>
          <Typography>on the main navigation menu.</Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalIntro]: {
      content: (
        <>
          <ListItem>
            <LastPageIcon color={"primary"} />
            <Typography color={"primary"}>Terminal</Typography>
          </ListItem>
          <Typography>
            is used to interface with your home computer as well as all of the other machines around the world.
          </Typography>
          <br />
          <Typography>
            In the next steps, the tutorial will show you how to use the most basic commands. In each step, we may show
            you an example of how the terminal should look when you enter the command.
          </Typography>
        </>
      ),
      canNext: true,
    },
    [iTutorialSteps.TerminalHelp]: {
      content: (
        <>
          <Typography>Let's try it out. Start by entering "help" to the terminal</Typography>
          <Typography>(Don't forget to press Enter after typing the command)</Typography>
          <Example content="[home /]> help" />
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalLs]: {
      content: (
        <>
          <Typography>
            The "help" command displays a list of all available Terminal commands, how to use them, and a description of
            what they do. <br />
            <br />
            Let's try another command. Enter "ls" ("ls" is short for "list" ).
          </Typography>
          <Example content="[home /]> ls" />
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalScan]: {
      content: (
        <>
          <Typography>
            The "ls" command is a basic command that lists the files on the computer. Right now, it shows that you have
            a program called NUKE.exe on your computer. We'll get to what this does later. <br />
            <br />
            Using your home computer's terminal, you can connect to other machines throughout the world. Let's do that
            now by first entering "scan".
          </Typography>
          <Example content="[home /]> scan" />
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalScanAnalyze1]: {
      content: (
        <>
          <Typography>
            The "scan" command shows all available network connections. In other words, it displays a list of all
            servers that can be connected to from your current machine. A server is identified by its hostname. <br />
            <br />
            That's great and all, but there's so many servers. Which one should you go to?
          </Typography>

          <Typography>
            The "scan-analyze" command gives some more detailed information about servers on the network. Try it now!
          </Typography>
          <Example content="[home /]> scan-analyze" />
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalScanAnalyze2]: {
      content: (
        <>
          <Typography>
            The "scan-analyze" command shows more detailed information about each server that you can connect to
            (servers that are a distance of one node away). <br />
            <br /> It is also possible to run scan-analyze with a higher depth. Let's try a depth of two with the
            following command: "scan-analyze 2"
          </Typography>

          <Example content="[home /]> scan-analyze 2" />
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalConnect]: {
      content: (
        <>
          <Typography>
            Now you can see information about all servers that are up to two nodes away, as well as figure out how to
            navigate to those servers through the network. You can only connect to a server that is one node away. To
            connect to a machine, use the "connect" command.
          </Typography>

          <Typography>
            From the results of the "scan-analyze" command, we can see that the n00dles server is only one node away.
            Let's connect to it now using "connect n00dles".
          </Typography>

          <Example content="[home /]> connect n00dles" />
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalAnalyze]: {
      content: (
        <>
          <Typography>
            You are now connected to another machine! What can you do now? You can hack it!
            <br />
            <br /> In the year 2077, currency has become digital and decentralized. People and corporations store their
            money on servers and computers. Using your hacking abilities, you can hack servers to steal money and gain
            experience. <br />
            <br />
            Before you try to hack a server, you should run diagnostics using the "analyze" command.
          </Typography>
          <Example content="[n00dles /]> analyze" />
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalNuke]: {
      content: (
        <>
          <Typography>
            When the "analyze" command finishes running, it will show useful information about hacking the server.
            <br />
            For this server, the required hacking skill is only 1, which means you can hack it right now. However, in
            order to hack a server you must first gain root access. The NUKE.exe program that we saw earlier on your
            home computer is a virus that will grant you root access to a machine if there are enough open ports.
          </Typography>
          <br />
          <Typography>
            The "analyze" command shows that there do not need to be any open ports on this machine for the NUKE program
            to work, so go ahead and run the NUKE program using "run NUKE.exe".
          </Typography>
          <Example content="[n00dles /]> run NUKE.exe" />
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalManualHack]: {
      content: (
        <>
          <Typography>You now have root access! You can hack the server using the "hack" command.</Typography>
          <Typography> Try doing that now.</Typography>
          <Example content="[n00dles /]> hack" />
        </>
      ),
      canNext: true,
    },
    [iTutorialSteps.TerminalHackingMechanics]: {
      content: (
        <Typography component="div">
          You are now attempting to hack the server. Performing a hack takes time and only has a certain percentage
          chance of success. This time and success chance is determined by a variety of factors, including your hacking
          skill and the server's security level.
          <br />
          <br />
          If your attempt to hack the server is successful, you will steal a certain percentage of the server's total
          money. This percentage is affected by your hacking skill and the server's security level.
          <br />
          <br />
          The amount of money on a server is not limitless. So, if you constantly hack a server and deplete its money,
          then you will encounter diminishing returns in your hacking. You will need to use the "grow" command which
          tricks the company into adding money to their server and the "weaken" command which decreases the server's
          security level.
          <br />
          <Example content="[n00dles /]> grow" />
          <Example content="[n00dles /]> weaken" />
        </Typography>
      ),
      canNext: true,
    },
    [iTutorialSteps.TerminalGoHome]: {
      content: (
        <>
          <Typography>From any server you can get back home using the "home" command.</Typography>
          <Typography>Let's head home before creating our first script!</Typography>
          <Example content="[n00dles /]> home" />
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalCreateScript]: {
      content: (
        <>
          <Typography>
            Hacking is the core mechanic of the game and is necessary for progressing. However, you don't want to be
            hacking manually the entire time. You can automate your hacking by writing scripts!
            <br />
            <br />
            To create a new script or edit an existing one, you can use the "nano" command.
          </Typography>

          <Typography>
            Scripts must end with a script extension (.js, .jsx, .ts, .tsx). Let's make a script now by entering "
            {`nano ${tutorialScriptName}`}"
          </Typography>
          <Example content={`[home /]> nano ${tutorialScriptName}`} />
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalEditScript]: {
      content: (
        <>
          <Typography>
            This is the script editor. You can use it to program your scripts. Click this text to copy it and paste it
            into the text editor:
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
            For anyone with basic programming experience, this code should be straightforward. This script will
            continuously hack the n00dles server.
            <br />
            <br />
            Use the search tool at the bottom to find and have a quick glance at documentation of any NS APIs.
            <br />
            <br />
            To access <NsApiDocumentationLink />, press the link at the bottom.
            <br />
            <br />
            To save and close the script editor, press the button at the bottom.
          </Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalFree]: {
      content: (
        <>
          <Typography>
            Now we'll run the script. Scripts require a certain amount of RAM to run, and can be run on any machine
            which you have root access to. Different servers have different amounts of RAM. You can also purchase more
            RAM for your home server.
            <br />
            <br />
            To check how much RAM is available on this machine, use the "free" command.
          </Typography>
          <Example content="[home /]> free" />
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalRunScript]: {
      content: (
        <>
          <Typography>
            We have 8GB of free RAM on this machine, which is enough to run our script. Let's run our script using "
            {`run ${tutorialScriptName}`}"
          </Typography>
          <Example content={`[home /]> run ${tutorialScriptName}`} />
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalGoToActiveScriptsPage]: {
      content: (
        <>
          <Typography>
            Your script is now running! It will continuously run in the background and will automatically stop if the
            code ever completes (the {tutorialScriptName} will never complete because it runs an infinite loop). <br />
            <br />
            These scripts can passively earn you income and hacking experience. Your scripts will also earn money and
            experience while you are offline, although at a slightly slower rate. <br />
            <br />
            Let's check out some statistics for our running scripts by clicking{" "}
          </Typography>
          <ListItem>
            <StorageIcon color={"error"} />
            <Typography color={"error"}>Active Scripts</Typography>
          </ListItem>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.ActiveScriptsPage]: {
      content: (
        <>
          <Typography>
            This page displays information about all of your scripts that are running across every server. You can use
            this to gauge how well your scripts are doing.
            <br />
            <br />
            Click on Home to see the scripts running on it.
            <br />
            <br />
            Then click on n00dles.js to see the scripts information.
            <br />
            <br />
            Let's go back to
          </Typography>
          <ListItem>
            <LastPageIcon color={"error"} />
            <Typography color={"error"}>Terminal</Typography>
          </ListItem>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.ActiveScriptsToTerminal]: {
      content: (
        <>
          <Typography>
            One last thing about scripts, each active script contains logs that detail what it's doing. We can check
            these logs using the "tail" command. Do that now for the script we just ran by typing "
            {`tail ${tutorialScriptName}`}"
          </Typography>
          <Example content={`[home /]> tail ${tutorialScriptName}`} />
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalTailScript]: {
      content: (
        <>
          <Typography>
            The log for this script won't show much right now (it might show nothing at all) because it just started
            running...but check back again in a few minutes! <br />
            <br />
            This covers the basics of hacking. To learn more about writing scripts, select
          </Typography>
          <ListItem>
            <HelpIcon color={"primary"} />
            <Typography color={"primary"}>Documentation</Typography>
          </ListItem>
          <Typography>
            in the main navigation menu to look at the documentation.
            <br />
            <br />
            For now, let's move on to something else!
          </Typography>
        </>
      ),
      canNext: true,
    },
    [iTutorialSteps.GoToHacknetNodesPage]: {
      content: (
        <>
          <Typography>
            Hacking is not the only way to earn money. One other way to passively earn money is by purchasing and
            upgrading Hacknet Nodes. Let's go to
          </Typography>
          <ListItem>
            <AccountTreeIcon color={"error"} />
            <Typography color={"error"}>Hacknet</Typography>
          </ListItem>
          <Typography>through the main navigation menu now.</Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.HacknetNodesIntroduction]: {
      content: (
        <Typography>
          Here you can purchase new Hacknet Nodes and upgrade your existing ones. Let's purchase a new one now.
        </Typography>
      ),
      canNext: true,
    },
    [iTutorialSteps.HacknetNodesGoToWorldPage]: {
      content: (
        <>
          <Typography>
            You just purchased a Hacknet Node! This Hacknet Node will passively earn you money over time, both online
            and offline. When you get enough money, you can upgrade your newly-purchased Hacknet Node below.
            <br />
            <br />
            Let's go to
          </Typography>
          <ListItem>
            <LocationCityIcon color={"error"} />
            <Typography color={"error"}>City</Typography>
          </ListItem>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.WorldDescription]: {
      content: (
        <>
          <Typography>
            This page lists all of the different locations you can currently travel to. Each location has something that
            you can do. There's a lot of content out in the world, make sure you explore and discover!
            <br />
            <br />
            Lastly, click on
          </Typography>
          <ListItem>
            <HelpIcon color={"error"} />
            <Typography color={"error"}>Documentation</Typography>
          </ListItem>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.DocumentationPageInfo]: {
      content: (
        <Typography component="div">
          This page contains a lot of different documentation about the game's contents and mechanics. I know it's a
          lot, but I highly suggest you read (or at least skim) through this before you start playing. Some pages are
          inaccessible at the start and will be unlocked later.
          <br />
          <br />
          If you click a link in these pages while holding Ctrl key (Control key on Mac keyboard), it will be opened in
          a new tab. If you play the Steam version, that link will be opened in your default browser.
          <br />
          <br />
          You should at least check these pages:
          <ul>
            <li>
              The Beginner's guide contains the guide for new players, navigating you through most of the early game.
            </li>
            <li>The NS API documentation contains reference materials for all NS APIs.</li>
            <li>The FAQ contains questions often asked in our Discord server.</li>
          </ul>
          <Typography fontWeight="fontWeightBold">
            This documentation page is the best place to get up-to-date information, especially when you get stuck. If
            you have a question and cannot find the answer here, please ask us on Discord.
          </Typography>
          <br />
          <Typography color={Settings.theme.warning}>
            The documentation at readthedocs is outdated and unmaintained. Do not use them!
          </Typography>
          <br />
          That's the end of the tutorial. Hope you enjoy the game!
        </Typography>
      ),
      canNext: true,
    },
    [iTutorialSteps.End]: {
      content: <Typography></Typography>,
      canNext: true,
    },
  };

  useEffect(() => {
    return ITutorialEvents.subscribe(rerender);
  }, [rerender]);

  const step = ITutorial.currStep;
  const content = contents[step];
  if (content === undefined) throw new Error("error in the tutorial");
  return (
    <>
      <Paper square sx={{ maxWidth: "70vw", p: 2 }}>
        {content.content}
        <br />
        {step !== iTutorialSteps.DocumentationPageInfo && (
          <>
            {step !== iTutorialSteps.Start && (
              <Button onClick={iTutorialPrevStep} aria-label="previous" style={{ marginRight: "1em" }}>
                Previous
              </Button>
            )}
            {(content.canNext || ITutorial.stepIsDone[step]) && (
              <Button onClick={iTutorialNextStep} aria-label="next">
                Next
              </Button>
            )}
          </>
        )}
        <br />
        <br />
        <Button onClick={iTutorialEnd}>
          {step !== iTutorialSteps.DocumentationPageInfo ? "Exit Tutorial" : "Finish Tutorial"}
        </Button>
      </Paper>
    </>
  );
}
