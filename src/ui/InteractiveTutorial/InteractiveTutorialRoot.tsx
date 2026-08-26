import React, { useEffect } from "react";

import { Paper, Box, Typography, Button, Link } from "@mui/material";
import { ITutorialEvents } from "./ITutorialEvents";
import { CopyableText } from "../React/CopyableText";

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

export const tutorialScriptName = `script.js`;

export function InteractiveTutorialRoot(): React.ReactElement {
  const { classes } = useStyles();
  const rerender = useRerender();

  const contents: Record<string, IContent | undefined> = {
    [iTutorialSteps.Start as number]: {
      content: (
        <>
          <Typography>
            Welcome to Bitburner, a cyberpunk-themed incremental RPG! The game takes place in a dark, dystopian
            future... The year is 2077...
            <br />
            <br />
            This tutorial will show you the basics of the game.
            <br />
            <br />
            If you need to hide this tutorial panel temporarily, there's a button to collapse it in the top-right.
            <br />
            <br />
            You can also exit the tutorial at any time. If you ever want to review it, go to the Options tab and select
            Repeat Tutorial.
          </Typography>
        </>
      ),
      canNext: true,
    },
    [iTutorialSteps.TerminalIntro as number]: {
      content: (
        <>
          <Typography>
            We're currently on the{" "}
            <Box sx={{ display: "inline-flex", alignItems: "center", verticalAlign: "bottom" }}>
              <LastPageIcon color="primary" />
              <Typography color="primary">Terminal</Typography>
            </Box>{" "}
            tab.
            <br />
            <br />
            You can use the{" "}
            <Box sx={{ display: "inline-flex", alignItems: "center", verticalAlign: "bottom" }}>
              <LastPageIcon color="primary" />
              <Typography color="primary"> Terminal</Typography>
            </Box>{" "}
            to interface with your home computer, as well as with other machines around the world.
          </Typography>
        </>
      ),
      canNext: true,
    },
    [iTutorialSteps.TerminalScan as number]: {
      content: (
        <>
          <Typography>
            Let's try that out. Start by entering
            <br />
            <br />
          </Typography>
          <Typography classes={{ root: classes.textfield }}>{"[home /]> scan"}</Typography>
          <Typography>
            <br />
            (Don't forget to press Enter after typing the command.)
          </Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalScanAnalyze1 as number]: {
      content: (
        <>
          <Typography>
            Running
            <br />
            <br />
          </Typography>
          <Typography classes={{ root: classes.textfield }}>{"[home /]> scan"}</Typography>
          <Typography>
            <br />
            shows all servers that you can connect to from your current machine. Servers are identified by their
            hostname.
            <br />
            <br />
            The network's much bigger than these nearby servers though. To start exploring it, let's enter
            <br />
            <br />
          </Typography>
          <Typography classes={{ root: classes.textfield }}>{"[home /]> scan-analyze"}</Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalScanAnalyze2 as number]: {
      content: (
        <>
          <Typography>
            That's given more detailed information about the servers you can connect to.
            <br />
            <br />
            To look depeer into the network, we can change our scanning depth to 2.
            <br />
            <br />
          </Typography>
          <Typography classes={{ root: classes.textfield }}>{"[home /]> scan-analyze 2"}</Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalConnectInterval as number]: {
      content: (
        <>
          <Typography>
            Now you can see information about all servers that are up to 2 nodes away. You can also see how to navigate
            to those servers through the network.
            <br />
            <br />
            That's great and all, but there are so many servers. Which one should we go to? Well, let's pick a target we
            can hack!
          </Typography>
        </>
      ),
      canNext: true,
    },
    [iTutorialSteps.TerminalConnect as number]: {
      content: (
        <>
          <Typography>
            In the year 2077, currency is digital and decentralized. People and corporations store their money on
            servers and computers. Using hacking skills and malware, you can hack servers to steal money and gain
            experience.
            <br />
            <br />
            If you check the read-out of scan-analyze you can see that n00dles has a required hacking skill of only 1.
            That means you can hack it right now.
            <br />
            <br />
            To do that, we need to connect to it. You can connect to a machine that is one node away using
            <br />
            <br />
          </Typography>
          <Typography classes={{ root: classes.textfield }}>{"[home /]> connect hostname"}</Typography>
          <Typography>
            <br />
            So let's connect to n00dles.
            <br />
            <br />
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
            Before we try hacking, let's start by running some diagnostics using
            <br />
            <br />
          </Typography>
          <Typography classes={{ root: classes.textfield }}>{"[n00dles /]> analyze"}</Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalNuke as number]: {
      content: (
        <>
          <Typography>
            When
            <br />
            <br />
          </Typography>
          <Typography classes={{ root: classes.textfield }}>{"[n00dles /]> analyze"}</Typography>
          <Typography>
            <br />
            finishes running, it'll display some useful diagnostic data.
            <br />
            <br />
            In the data, you can see the server's Root Access status. To hack a server you must gain root access first.
            Handily, you've come prepared with a virus called NUKE.exe. NUKE.exe will grant you root access to a machine
            as long as there are enough open ports.
            <br />
            <br />
            If you look at the diagnostics again, you'll also see that the required number of open ports for NUKE is 0.
            So you're good to go ahead and run the virus! Just enter
            <br />
            <br />
          </Typography>
          <Typography classes={{ root: classes.textfield }}>{"[n00dles /]> NUKE.exe"}</Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalManualHack as number]: {
      content: (
        <>
          <Typography>
            You now have root access! You can hack the server using
            <br />
            <br />
          </Typography>
          <Typography classes={{ root: classes.textfield }}>{"[n00dles /]> hack"}</Typography>
          <Typography>
            <br />
            Try doing that now.
          </Typography>
        </>
      ),
      canNext: true,
    },
    [iTutorialSteps.TerminalHackingMechanics as number]: {
      content: (
        <>
          <Typography>
            You're now attempting to hack the server. Performing a hack takes time, and has a certain success chance.
            Both the hack time and success chance are affected by your hacking skill, and by the server's security
            level.
            <br />
            <br />
            If your attempt to hack the server is successful, you'll steal a percentage of the server's available money.
            (Again, this percentage is affected by your hacking skill and the server's security level).
            <br />
            <br />
            As you hack a server, you'll deplete the money it has available and cause its security level to rise. To
            restore things, you need to use
            <br />
            <br />
          </Typography>
          <Typography classes={{ root: classes.textfield }}>{"[n00dles /]> grow"}</Typography>
          <Typography>
            <br />
            which tricks the company into adding money to their server, and
            <br />
            <br />
          </Typography>
          <Typography classes={{ root: classes.textfield }}>{"[n00dles /]> weaken"}</Typography>
          <Typography>
            <br />
            which lowers the server's security level.
          </Typography>
        </>
      ),
      canNext: true,
    },
    [iTutorialSteps.TerminalGoHome as number]: {
      content: (
        <>
          <Typography>
            Hacking from the terminal is OK, but it's manual. It sure would be handy if there was a way to automate it!
            <br />
            <br />
            So let's head home and create our first script.
            <br />
            <br />
            You can get back home from any server using
            <br />
            <br />
          </Typography>
          <Typography classes={{ root: classes.textfield }}>{"[n00dles /]> home"}</Typography>
        </>
      ),
      canNext: false,
    },

    [iTutorialSteps.TerminalCreateScript as number]: {
      content: (
        <>
          <Typography>
            To create a new script or edit an existing one, you can use
            <br />
            <br />
          </Typography>
          <Typography classes={{ root: classes.textfield }}>{"[home /]> nano file"}</Typography>
          <Typography>
            <br />
            Script names must end with a script extension (.js, .ts, .jsx, .tsx). Let's make a script now by entering
            <br />
            <br />
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
            This is the script editor.
            <br />
            <br />
            Below is a basic script that hacks n00dles. Click it to copy it, then paste it into the editor.
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
            If you have a look at the code of the script, you might be able to see that it hacks n00dles while 'true' is
            true – which it always is! So this script hacks n00dles on a loop forever.
            <br />
            <br />
            Unlike manual hacking where you need to be connected to your target, scripts can target any server on the
            network
            <em>from</em> any server on the network.
            <br />
            <br />
            While we're in the editor, it's worth saying that everything we do in this tutorial can be scripted. You can
            map the network with ns.scan(), run scripts with ns.run() or ns.exec(), and get server diagnostics with
            ns.getServer().
            <br />
            <br />
            If you ever want to check which functions are available to you, you can do that in the editor. Either search
            using the search bar tool at the bottom of the editor, or click the{" "}
            <DocumentationLink page={defaultNsApiPage}>
              <strong>NS API documentation</strong>
            </DocumentationLink>{" "}
            link beside it.
            <br />
            <br />
            OK, back to hacking. Click <strong>Save</strong> at the bottom to save your script and close the editor.
          </Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalFree as number]: {
      content: (
        <>
          <Typography>
            Now we'll run the script. Scripts need RAM to run, and can be run on any machine which you have root access
            to. Different servers have different amounts of RAM. You can also purchase more RAM for your home server.
            <br />
            <br />
            To check how much RAM is available on this machine, enter
            <br />
            <br />
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
            We have 8GB of free RAM, which is enough to run our script. Let's run our script using
            <br />
            <br />
          </Typography>
          <Typography classes={{ root: classes.textfield }}>{`[home /]> ${tutorialScriptName}`}</Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalGoToActiveScriptsPage as number]: {
      content: (
        <>
          <Typography>
            Your script is now running! Scripts run in the background until their code completes (although
            {tutorialScriptName} will never complete because it has an infinite loop).
            <br />
            <br />
            Scripts can passively earn you income and hacking experience. They'll keep earning even while you're
            offline, although at a slower rate.
            <br />
            <br />
            Let's check out some statistics for our running scripts by clicking{" "}
            <Box sx={{ display: "inline-flex", alignItems: "center", verticalAlign: "bottom" }}>
              <StorageIcon color={"error"} />
              <Typography color={"error"}> Active Scripts</Typography>
            </Box>
          </Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.ActiveScriptsPage as number]: {
      content: (
        <>
          <Typography>
            This page displays information about all of your scripts that are running across every server. You can use
            this to gauge how well your scripts are doing.
            <br />
            <br />
            Click <strong>home</strong> to see the scripts running on it.
            <br />
            <br />
            Then click <strong>${tutorialScriptName}</strong> to see the script's information.
            <br />
            <br />
            Let's go back to the{" "}
            <Box sx={{ display: "inline-flex", alignItems: "center", verticalAlign: "bottom" }}>
              <LastPageIcon color={"error"} />
              <Typography color={"error"}> Terminal</Typography>
            </Box>
          </Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.ActiveScriptsToTerminal as number]: {
      content: (
        <>
          <Typography>
            Each active script has logs that detail what it's doing. You can check these logs using the tail command. To
            do that for the script you just ran, you can enter
            <br />
            <br />
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
            The log for this script may not show much right now because it just started running... but check back again
            in a few minutes!
          </Typography>
        </>
      ),
      canNext: true,
    },
    [iTutorialSteps.TerminalLs as number]: {
      content: (
        <>
          <Typography>
            We're not going to get very far running scripts on our home computer alone. We need to copy them to other
            servers too.
            <br />
            <br />
            Before we do that, let's see what's currently on our home computer using
            <br />
            <br />
          </Typography>
          <Typography classes={{ root: classes.textfield }}>{"[home /]> ls"}</Typography>
          <Typography>
            <br />
            ("ls" is short for "list".)
          </Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalScp as number]: {
      content: (
        <>
          <Typography>
            That's shown all the files on your home computer. Right now, you can see the NUKE.exe program that you used
            earlier, and {tutorialScriptName}.
            <br />
            <br />
            NUKE.exe can only ever be on your home computer. But if you want other servers to run {tutorialScriptName},
            you need to copy it to them.
            <br />
            <br />
            To do that, we use
            <br />
            <br />
          </Typography>
          <Typography classes={{ root: classes.textfield }}>{"[home /]> scp file destination"}</Typography>
          <Typography>
            <br />
            To copy {tutorialScriptName} to n00dles, enter
            <br />
            <br />
          </Typography>
          <Typography classes={{ root: classes.textfield }}>{`[home /]> scp ${tutorialScriptName} n00dles`}</Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalHelp as number]: {
      content: (
        <>
          <Typography>
            Lastly, if you can't remember the right terminal command, you can always use
            <br />
            <br />
          </Typography>
          <Typography classes={{ root: classes.textfield }}>{"[home /]> help"}</Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.GoToCharacterPage as number]: {
      content: (
        <>
          <Typography>
            Now we've made some money and exp, let's head to the Stats tab and see our gains. Click{" "}
            <Box sx={{ display: "inline-flex", alignItems: "center", verticalAlign: "bottom" }}>
              <EqualizerIcon color={"error"} />
              <Typography color={"error"}> Stats</Typography>
            </Box>{" "}
            at the left-hand side of the screen.
          </Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.CharacterPage as number]: {
      content: (
        <>
          <Typography>
            <Box sx={{ display: "inline-flex", alignItems: "center", verticalAlign: "bottom" }}>
              <EqualizerIcon color={"error"} />
              <Typography color={"error"}> Stats</Typography>
            </Box>{" "}
            shows information about your skills, money, and bonuses.
          </Typography>
        </>
      ),
      canNext: true,
    },
    [iTutorialSteps.GoToHacknetNodesPage as number]: {
      content: (
        <>
          <Typography>
            Hacking isn't the only way to earn money. One other way to passively earn money is to purchase and upgrade
            Hacknet Nodes. Let's go to{" "}
            <Box sx={{ display: "inline-flex", alignItems: "center", verticalAlign: "bottom" }}>
              <AccountTreeIcon color={"error"} />
              <Typography color={"error"}> Hacknet</Typography>
            </Box>{" "}
            .
          </Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.HacknetNodesIntroduction as number]: {
      content: (
        <Typography>
          Here you can purchase new Hacknet Nodes and upgrade your existing ones. Let's purchase a new one.
        </Typography>
      ),
      canNext: true,
    },
    [iTutorialSteps.HacknetNodesGoToWorldPage as number]: {
      content: (
        <>
          <Typography>
            Hacknet Nodes earn you money over time, both online and offline. When you get enough money, you can upgrade
            your newly-purchased Hacknet Node below.
            <br />
            <br />
            Let's go to{" "}
            <Box sx={{ display: "inline-flex", alignItems: "center", verticalAlign: "bottom" }}>
              <LocationCityIcon color={"error"} />
              <Typography color={"error"}> City</Typography>
            </Box>{" "}
            .
          </Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.WorldDescription as number]: {
      content: (
        <>
          <Typography>
            This page lists all of the locations in your current city. Each location has something that you can do.
            There's a lot of content out in the world, so make sure you explore and discover!
            <br />
            <br />
            Lastly, click on{" "}
            <Box sx={{ display: "inline-flex", alignItems: "center", verticalAlign: "bottom" }}>
              <HelpIcon color={"error"} />
              <Typography color={"error"}> Documentation</Typography>
            </Box>{" "}
            .
          </Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.DocumentationPageInfo as number]: {
      content: (
        <Typography component="div">
          The pages in the Documentation tab explain the game's content and mechanics. I know it looks a lot, but I
          highly suggest you read (or at least skim) through this before you start playing.
          <br />
          <br />
          If you look at nothing else, the three pages I'd recommend are:
          <ul>
            <li>
              the <DocumentationLink page="help/getting_started.md">Beginner's guide</DocumentationLink>, which will
              help you navigate through most of the early game
            </li>
            <li>
              the <DocumentationLink page={defaultNsApiPage}>NS API documentation</DocumentationLink>, which contains
              reference materials for all NS APIs
            </li>
            <li>
              the <DocumentationLink page="help/faq.md">FAQ</DocumentationLink>, which answers questions often asked by
              beginners
            </li>
          </ul>
          You'll notice that some of the pages are inaccessible right now. Don't worry – you'll unlock them later on.
          <br />
          <br />
          If you want to open one of the Documentaion page links in a new tab, click it while holding Ctrl (Control on a
          Mac keyboard). If you're playing the Steam version, doing that will open the link in your default browser.
          <br />
          <br />
          While the documentation page is the best place to get information, especially when you get stuck, if you can't
          find the answer here then please{" "}
          <Link href="https://discord.com/channels/415207508303544321/415207508303544323" underline="hover">
            ask us on Discord
          </Link>
          .
          <br />
          <Typography color={Settings.theme.warning}>
            The documentation at readthedocs is outdated and unmaintained. Do not use it!
          </Typography>
          <br />
          And that's the end of the tutorial. We hope you enjoy the game!
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
    <Paper square sx={{ width: "50vw", minWidth: "50vw", p: 2 }}>
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
  );
}
