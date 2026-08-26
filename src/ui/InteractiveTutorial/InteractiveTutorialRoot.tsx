import React, { useEffect } from "react";

import { Paper, Box, Typography, Button, Link } from "@mui/material";
import { ITutorialEvents } from "./ITutorialEvents";
import { CopyableText } from "../React/CopyableText";
import { useStyles as codeBlockStyles } from "../MD/code";

import EqualizerIcon from "@mui/icons-material/Equalizer";
import SettingsIcon from "@mui/icons-material/Settings";
import LastPageIcon from "@mui/icons-material/LastPage";
import HelpIcon from "@mui/icons-material/Help";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import StorageIcon from "@mui/icons-material/Storage";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import { useTheme, styled } from "@mui/material/styles";

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

export const tutorialScriptName = `hacking.js`;

export function InteractiveTutorialRoot(): React.ReactElement {
  const theme = useTheme();
  const { classes: codeClasses } = codeBlockStyles();
  const TerminalText = styled(Typography)(({ theme }) => ({
    borderBottom: `1px solid ${theme.palette.primary.main}`,
  }));
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
            If you need to hide the tutorial panel temporarily, you can collapse it.
            <br />
            <br />
            You can also exit the tutorial at any time. If you ever want to review it, go to the{" "}
            <Box sx={{ display: "inline-flex", alignItems: "center", verticalAlign: "bottom" }}>
              <SettingsIcon sx={{ color: theme.palette.primary.main, mr: 0.8 }} />
              <Typography sx={{ color: theme.palette.primary.main }}>Options</Typography>
            </Box>{" "}
            tab and select Repeat Tutorial.
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
              <LastPageIcon sx={{ color: theme.palette.primary.main, mr: 0.8 }} />
              <Typography sx={{ color: theme.palette.primary.main }}>Terminal</Typography>
            </Box>{" "}
            tab.
            <br />
            <br />
            You can use the{" "}
            <Box sx={{ display: "inline-flex", alignItems: "center", verticalAlign: "bottom" }}>
              <LastPageIcon sx={{ color: theme.palette.primary.main, mr: 0.8 }} />
              <Typography sx={{ color: theme.palette.primary.main }}>Terminal</Typography>
            </Box>{" "}
            to interface with your home computer, and with other machines around the world.
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
          <TerminalText>{"[home /]> scan"}</TerminalText>
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
          <TerminalText>{"[home /]> scan"}</TerminalText>
          <Typography>
            <br />
            shows all servers that you can connect to from your current machine.
            <br />
            <br />
            The network's much bigger than that though. To start exploring it, let's enter
            <br />
            <br />
          </Typography>
          <TerminalText>{"[home /]> scan-analyze"}</TerminalText>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalScanAnalyze2 as number]: {
      content: (
        <>
          <Typography>
            That's given us more detailed information about the servers we can connect to.
            <br />
            <br />
            To look depeer into the network, increase your scanning depth to 2.
            <br />
            <br />
          </Typography>
          <TerminalText>{"[home /]> scan-analyze 2"}</TerminalText>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalConnectInterval as number]: {
      content: (
        <>
          <Typography>
            Now you can see all servers that are up to 2 nodes away, and how to navigate to them.
            <br />
            <br />
            That's great and all, but there are so many servers. Which ones do we focus on? Well, let's pick a target we
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
            servers and computers. Using your specialised skills, you can hack servers to steal money and gain
            experience.
            <br />
            <br />
            If you check the read-out of scan-analyze in the Terminal you can see that n00dles has a required hacking
            skill of only 1. That means you can hack it right now.
            <br />
            <br />
            To do that, you need to connect to it. You can connect to any machine that is one node away using
            <br />
            <br />
          </Typography>
          <TerminalText>{"[home /]> connect hostname"}</TerminalText>
          <Typography>
            <br />
            So let's connect to n00dles.
            <br />
            <br />
          </Typography>
          <TerminalText>{"[home /]> connect n00dles"}</TerminalText>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalAnalyze as number]: {
      content: (
        <>
          <Typography>
            Before we try hacking, let's run some diagnostics using
            <br />
            <br />
          </Typography>
          <TerminalText>{"[n00dles /]> analyze"}</TerminalText>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalNuke as number]: {
      content: (
        <>
          <Typography>
            If you have a look at the diagnostic data, you can see the server's root access status. To hack a server,
            you must gain root access first.
            <br />
            <br />
            Handily, you've come prepared with a virus called NUKE.exe. NUKE.exe will grant you root access to any
            machine as long as it has enough open ports.
            <br />
            <br />
            If you look at the diagnostics again, you'll see that n00dles' "Required number of open ports for NUKE" is
            0. So you're good to go ahead and run the virus! Just enter
            <br />
            <br />
          </Typography>
          <TerminalText>{"[n00dles /]> NUKE.exe"}</TerminalText>
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
          <TerminalText>{"[n00dles /]> hack"}</TerminalText>
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
            You're now attempting to hack the server. Hacking takes time, and has a success chance. If your hack is
            successful, you'll steal a percentage of the server's available money.
            <br />
            <br />
            All of those variables (hacking time, success chance, and the percentage stolen) are affected by:
            <ul>
              <li>your hacking skill</li>
              <li>the server's security level</li>
            </ul>
          </Typography>
        </>
      ),
      canNext: true,
    },
    [iTutorialSteps.TerminalWeakenGrowMechanics as number]: {
      content: (
        <>
          <Typography>
            When you hack a server, you deplete the money it has available, so the following hacks take less money. You
            also cause its security level to rise, so your hacks take longer.
            <br />
            <br />
            To restore things, you can use
            <br />
            <br />
          </Typography>
          <TerminalText>{"[n00dles /]> grow"}</TerminalText>
          <Typography>
            <br />
            which tricks the company into adding money to their server, and
            <br />
            <br />
          </Typography>
          <TerminalText>{"[n00dles /]> weaken"}</TerminalText>
          <Typography>
            <br />
            which lowers the server's security level, speeding up hack, grow and weaken.
          </Typography>
        </>
      ),
      canNext: true,
    },
    [iTutorialSteps.TerminalGoHome as number]: {
      content: (
        <>
          <Typography>
            Hacking is the core mechanic of the game and is necessary for progression. So you don't want to be hacking
            manually the entire time. What we need is a way to automate it.
            <br />
            <br />
            So let's head home and create our first script.
            <br />
            <br />
            You can get back home from any server using
            <br />
            <br />
          </Typography>
          <TerminalText>{"[n00dles /]> home"}</TerminalText>
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
          <TerminalText>{"[home /]> nano file"}</TerminalText>
          <Typography>
            <br />
            Script names must end with a script extension (.js, .jsx, .ts, .tsx).
            <br />
            <br />
            Let's create a script now by entering
            <br />
            <br />
          </Typography>
          <TerminalText>{`[home /]> nano ${tutorialScriptName}`}</TerminalText>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalEditScript as number]: {
      content: (
        <>
          <Typography>
            Below is a basic script that hacks n00dles on a continuous loop. Copy and paste it into the editor.
          </Typography>
          <br />
          <CopyableText
            className={codeClasses.code}
            value={`/** @param {NS} ns */
export async function main(ns) {
  while (true) {
    await ns.hack("n00dles");
  }
}`}
          />
          <br />
          <br />
          <Typography>
            One benefit of using scripts to hack is that they don't need to be connected to the server they're hacking.
            Scripts can target any server on the network.
            <br />
            <br />
            While we're in the editor, it's worth saying that everything we do in this tutorial can be scripted. You can
            map the network with ns.scan(), run scripts with ns.run(), or get server information with ns.getServer().
            <br />
            <br />
            If you want to check which functions are available to you in the editor, use the search bar at the bottom,
            or click the <DocumentationLink page={defaultNsApiPage}>NS API documentation</DocumentationLink> link beside
            it.
            <br />
            <br />
            OK, back to hacking. Click Save at the bottom to save your script and close the editor.
          </Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalFree as number]: {
      content: (
        <>
          <Typography>
            Now we'll run the script. You can run scripts on any server that you have root access to.
            <br />
            <br />
            Scripts need RAM to run. To check how much RAM is available on this machine, enter
            <br />
            <br />
          </Typography>
          <TerminalText>{"[home /]> free"}</TerminalText>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalRunScript as number]: {
      content: (
        <>
          <Typography>
            We have 8GB of free RAM. If that doesn't sound like much, don't worry: you can purchase more RAM for your
            home server later.
            <br />
            <br />
            For now, let's run our script using
            <br />
            <br />
          </Typography>
          <TerminalText>{`[home /]> ${tutorialScriptName}`}</TerminalText>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalGoToActiveScriptsPage as number]: {
      content: (
        <>
          <Typography>
            Your script is now running! Scripts run in the background until their code completes ({tutorialScriptName}{" "}
            will never complete because it has an infinite loop).
            <br />
            <br />
            Scripts will passively earn you income and hacking experience. They even keep earning while you're offline,
            although at a slower rate.
            <br />
            <br />
            Let's check out some statistics of our running scripts by clicking{" "}
            <Box sx={{ display: "inline-flex", alignItems: "center", verticalAlign: "bottom" }}>
              <StorageIcon sx={{ color: theme.palette.info.main, mr: 0.8 }} />
              <Typography sx={{ color: theme.palette.info.main }}>Active Scripts</Typography>
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
            This page shows every script you're running across every server. You can use it to gauge how well your
            scripts are doing.
            <br />
            <br />
            Click home to see the scripts running on it.
            <br />
            <br />
            Then click {tutorialScriptName} to see the script's information.
            <br />
            <br />
            Let's go back to the{" "}
            <Box sx={{ display: "inline-flex", alignItems: "center", verticalAlign: "bottom" }}>
              <LastPageIcon sx={{ color: theme.palette.info.main }} />
              <Typography sx={{ color: theme.palette.info.main }}>Terminal</Typography>
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
            Each active script has logs that detail what it's doing. You can check these using the tail command. To do
            that for the script you just ran, enter
            <br />
            <br />
          </Typography>
          <TerminalText>{`[home /]> tail ${tutorialScriptName}`}</TerminalText>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalTailScript as number]: {
      content: (
        <>
          <Typography>
            This log might not show much because the script just started... but check back again in a few minutes!
          </Typography>
        </>
      ),
      canNext: true,
    },
    [iTutorialSteps.TerminalLs as number]: {
      content: (
        <>
          <Typography>
            We won't get far running scripts on just our home computer. We can run them on other servers too, and to do
            that, we need to copy them over.
            <br />
            <br />
            First though, let's see what files are stored on our home computer using
            <br />
            <br />
          </Typography>
          <TerminalText>{"[home /]> ls"}</TerminalText>
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
            To copy {tutorialScriptName} to another server, you can use
            <br />
            <br />
          </Typography>
          <TerminalText>{"[home /]> scp file destination"}</TerminalText>
          <Typography>
            <br />
            To copy it to n00dles, enter
            <br />
            <br />
          </Typography>
          <TerminalText>{`[home /]> scp ${tutorialScriptName} n00dles`}</TerminalText>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalHelp as number]: {
      content: (
        <>
          <Typography>
            Lastly, if you can't remember the right terminal command, you can always enter
            <br />
            <br />
          </Typography>
          <TerminalText>{"[home /]> help"}</TerminalText>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.GoToCharacterPage as number]: {
      content: (
        <>
          <Typography>
            Now we've made some money and exp, let's head to the Stats tab and see what we've gained. Click{" "}
            <Box sx={{ display: "inline-flex", alignItems: "center", verticalAlign: "bottom" }}>
              <EqualizerIcon sx={{ color: theme.palette.info.main, mr: 0.8 }} />
              <Typography sx={{ color: theme.palette.info.main }}>Stats</Typography>
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
              <EqualizerIcon sx={{ color: theme.palette.info.main, mr: 0.8 }} />
              <Typography sx={{ color: theme.palette.info.main }}>Stats</Typography>
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
            Hacking isn't the only way to earn money. One other way to passively earn money is to purchase Hacknet
            Nodes. Let's go to{" "}
            <Box sx={{ display: "inline-flex", alignItems: "center", verticalAlign: "bottom" }}>
              <AccountTreeIcon sx={{ color: theme.palette.info.main, mr: 0.8 }} />
              <Typography sx={{ color: theme.palette.info.main }}>Hacknet</Typography>
            </Box>{" "}
          </Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.HacknetNodesIntroduction as number]: {
      content: (
        <Typography>
          Here you can purchase new Hacknet Nodes and upgrade your existing ones. Let's purchase one.
        </Typography>
      ),
      canNext: true,
    },
    [iTutorialSteps.HacknetNodesGoToWorldPage as number]: {
      content: (
        <>
          <Typography>
            Hacknet Nodes earn you money over time, both online and offline. When you get enough money, you can upgrade
            your Hacknet Node below.
            <br />
            <br />
            Let's go to{" "}
            <Box sx={{ display: "inline-flex", alignItems: "center", verticalAlign: "bottom" }}>
              <LocationCityIcon sx={{ color: theme.palette.info.main, mr: 0.8 }} />
              <Typography sx={{ color: theme.palette.info.main }}>City</Typography>
            </Box>{" "}
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
            Lastly, go to{" "}
            <Box sx={{ display: "inline-flex", alignItems: "center", verticalAlign: "bottom" }}>
              <HelpIcon sx={{ color: theme.palette.info.main, mr: 0.8 }} />
              <Typography sx={{ color: theme.palette.info.main }}>Documentation</Typography>
            </Box>{" "}
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
              the <DocumentationLink page="help/getting_started.md">Beginner's guide</DocumentationLink>, which gives
              you an <strong>invaluable</strong> basic hacking script, and helps you with most of the early game
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
          You'll notice that some of the pages are inaccessible right now. You'll unlock those later on.
          <br />
          <br />
          If you want to open one of the Documentaion page links in a new tab, click it while holding Ctrl (Control on a
          Mac keyboard). If you're playing the Steam version, doing that will open the link in your default browser.
          <br />
          <br />
          <Typography fontWeight="fontWeightBold">
            While the documentation is the best place to get help, if you can't find the answer then please{" "}
            <Link href="https://discord.com/channels/415207508303544321/415207508303544323" underline="hover">
              ask us on Discord
            </Link>
            .
          </Typography>
          <br />
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
