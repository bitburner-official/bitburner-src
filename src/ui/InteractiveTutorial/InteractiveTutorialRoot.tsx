import React, { useEffect } from "react";

import { Paper, Box, Typography, Button, Link } from "@mui/material";
import { ITutorialEvents } from "./ITutorialEvents";
import { CopyableText } from "../React/CopyableText";

import EqualizerIcon from "@mui/icons-material/Equalizer";
import SettingsIcon from "@mui/icons-material/Settings";
import LastPageIcon from "@mui/icons-material/LastPage";
import HelpIcon from "@mui/icons-material/Help";
import StorageIcon from "@mui/icons-material/Storage";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import { styled } from "@mui/material/styles";

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
  const TerminalText = styled(Typography)(({ theme }) => ({
    borderBottom: `1px solid ${theme.palette.primary.main}`,
  }));
  const rerender = useRerender();

  const contents: Record<string, IContent | undefined> = {
    [iTutorialSteps.Start as number]: {
      content: (
        <>
          <Typography>
            Welcome to Bitburner, a cyberpunk-themed incremental RPG. The game takes place in a dark, dystopian
            future... The year is 2077...
            <br />
            <br />
            This tutorial will show you the basics of the game. We'll look at:
            <ul>
              <li>the network</li>
              <li>hacking</li>
              <li>working with scripts</li>
            </ul>
            If you need to hide the tutorial panel temporarily, you can collapse it.
            <br />
            <br />
            You can also exit the tutorial at any time. If you ever want to review it, go to the{" "}
            <Box sx={{ display: "inline-flex", alignItems: "center", verticalAlign: "bottom" }}>
              <SettingsIcon sx={{ color: "primary.main", mr: 0.8 }} />
              <Typography sx={{ color: "primary.main" }}>Options</Typography>
            </Box>{" "}
            tab and select Repeat Tutorial.
          </Typography>
        </>
      ),
      canNext: true,
    },
    [iTutorialSteps.TerminalScan as number]: {
      content: (
        <>
          <Typography>
            We're currently on the{" "}
            <Box sx={{ display: "inline-flex", alignItems: "center", verticalAlign: "bottom" }}>
              <LastPageIcon sx={{ color: "primary.main", mr: 0.8 }} />
              <Typography sx={{ color: "primary.main" }}>Terminal</Typography>
            </Box>{" "}
            tab.
            <br />
            <br />
            You can use the{" "}
            <Box sx={{ display: "inline-flex", alignItems: "center", verticalAlign: "bottom" }}>
              <LastPageIcon sx={{ color: "primary.main", mr: 0.8 }} />
              <Typography sx={{ color: "primary.main" }}>Terminal</Typography>
            </Box>{" "}
            to interface with your home computer, and with other computers around the world.
            <br />
            <br />
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
            That's shown you every server you can connect to from your current machine.
            <br />
            <br />
            The network's much bigger than that though! To start exploring it, enter
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
            That's given us more detailed information.
            <br />
            <br />
            To look depeer into the network, let's increase the scanning depth to 2.
            <br />
            <br />
          </Typography>
          <TerminalText>{"[home /]> scan-analyze 2"}</TerminalText>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalConnect as number]: {
      content: (
        <>
          <Typography>
            Now you can see all the servers that are up to 2 nodes away, and the routes to get to them.
            <br />
            <br />
            You can connect to any machine that is 1 node away using
            <br />
            <br />
          </Typography>
          <TerminalText>{"[home /]> connect"}</TerminalText>
          <Typography>
            <br />
            Let's connect to n00dles.
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
            In the year 2077, currency is digital and decentralized. People and corporations store their money on
            servers and computers. Using specialised skills, you can hack servers to steal money and gain experience.
            <br />
            <br />
            You've got the hacking skill needed to hack n00dles – scan-analyze showed us that n00dles has a required
            hacking skill of 1.
            <br />
            <br />
            But there's something else we need as well. To see what, let's run some diagnostics using
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
            If you look, you can see that n00dles' "Root Access" status is "NO". You must gain root access before you
            can hack a server. Handily, you've built a virus called NUKE.exe.
            <br />
            <br />
            NUKE.exe will grant you root access to any machine as long as enough ports are open.
            <br />
            <br />
            In the diagnostics, you'll see that n00dles' "Required number of open ports for NUKE" is 0.
            <br />
            <br />
            So you're good to run the virus. Just enter
            <br />
            <br />
          </Typography>
          <TerminalText>{"[n00dles /]> run NUKE.exe"}</TerminalText>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalManualHack as number]: {
      content: (
        <>
          <Typography>
            Now you've got root access, you can hack the server! Try entering
            <br />
            <br />
          </Typography>
          <TerminalText>{"[n00dles /]> hack"}</TerminalText>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalHackingMechanics as number]: {
      content: (
        <>
          <Typography>
            You're now attempting to hack n00dles. If your hack is successful, you'll steal a percentage of the server's
            available money.
            <br />
            <br />
            As your hacking skill increases, hacking will take less time, steal more money, and have a higher success
            chance.
            <br />
            <br />
            When you hack a server, you deplete its available money and increase its security level. Higher security
            levels make hacking slower and less effective.
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
            which lowers the server's security level.
            <br />
            <br />
            Lowering the security level helps grow and weaken too. It speeds them both up, and makes grow more
            effective.
          </Typography>
        </>
      ),
      canNext: true,
    },
    [iTutorialSteps.TerminalGoHome as number]: {
      content: (
        <>
          <Typography>
            Hacking is the core mechanic of the game and is necessary to progress. So you don't want to be hacking
            manually the entire time. You need a way to automate it!
            <br />
            <br />
            Let's head home and create our first script.
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
          <TerminalText>{"[home /]> nano"}</TerminalText>
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
    [iTutorialSteps.ScriptEditorEdit as number]: {
      content: (
        <>
          <Typography>
            Below is a script that hacks n00dles on a continuous loop. Click it to copy it, then paste it into the
            editor.
          </Typography>
          <br />
          <Typography component="div" sx={{ whiteSpace: "pre", backgroundColor: "background.paper" }}>
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
            When using scripts to hack, you don't need to be connected to the target server. Scripts can target any
            server, no matter where you are.
            <br />
            <br />
            Almost everything we do in this tutorial can be scripted using functions available to you right away. To
            check what functions are available, you can:
            <ul>
              <li>use the search bar at the bottom</li>
              <li>
                click the <DocumentationLink page={defaultNsApiPage}>NS API documentation</DocumentationLink> link
              </li>
            </ul>
            For now though, click{" "}
            <Box component="span" sx={{ color: "info.main" }}>
              Save
            </Box>{" "}
            at the bottom.
          </Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.ScriptEditorRam as number]: {
      content: (
        <>
          <Typography>
            Scripts cost RAM to run.
            <br />
            <br />
            To see how much RAM this script costs, check the{" "}
            <Box component="span" sx={{ color: "info.main" }}>
              RAM
            </Box>{" "}
            button at the bottom.
            <br />
            <br />
            You can also click the{" "}
            <Box component="span" sx={{ color: "info.main" }}>
              RAM
            </Box>{" "}
            button to see what's contributing to the RAM cost.
            <br />
            <br />
            Try doing that now.
          </Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.ScriptEditorGoToTerminal as number]: {
      content: (
        <>
          <Typography>
            Now we know how much RAM we need, let's head back to the{" "}
            <Box sx={{ display: "inline-flex", alignItems: "center", verticalAlign: "bottom" }}>
              <LastPageIcon sx={{ color: "info.main", mr: 0.8 }} />
              <Typography sx={{ color: "info.main" }}>Terminal</Typography>
            </Box>{" "}
            to run our script.
          </Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalFree as number]: {
      content: (
        <>
          <Typography>
            To check how much RAM is available, enter
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
            You have 8GB of free RAM, enough to run your script!
            <br />
            <br />
            You can run it using
            <br />
            <br />
          </Typography>
          <TerminalText>{`[home /]> run ${tutorialScriptName}`}</TerminalText>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.TerminalGoToActiveScriptsPage as number]: {
      content: (
        <>
          <Typography>
            Your script is now running.
            <br />
            <br />
            Scripts run in the background until their code completes (if they have an continuous loop, like{" "}
            {tutorialScriptName} does, they'll run indefinitely).
            <br />
            <br />
            Scripts will passively earn you money and hacking exp. They even earn money and exp while you're offline,
            although at a slower rate.
            <br />
            <br />
            Let's check how our running scripts are doing by clicking{" "}
            <Box sx={{ display: "inline-flex", alignItems: "center", verticalAlign: "bottom" }}>
              <StorageIcon sx={{ color: "info.main", mr: 0.8 }} />
              <Typography sx={{ color: "info.main" }}>Active Scripts</Typography>
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
            Then click {tutorialScriptName} to see some data about it.
            <br />
            <br />
            When you're ready, let's go back to the{" "}
            <Box sx={{ display: "inline-flex", alignItems: "center", verticalAlign: "bottom" }}>
              <LastPageIcon sx={{ color: "info.main" }} />
              <Typography sx={{ color: "info.main" }}>Terminal</Typography>
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
            Each active script has a log that details what it's doing. You can check these using the tail command. To do
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
            You can run scripts on any servers that you have root access to. To do that, you first need to copy your
            scripts over to them.
            <br />
            <br />
            Let's check what files are stored on our home computer using
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
            To copy a script to another server, you can use the scp command.
            <br />
            <br />
            Let's copy {tutorialScriptName} to n00dles.
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
            Now we've gained some money and exp, let's look at the{" "}
            <Box sx={{ display: "inline-flex", alignItems: "center", verticalAlign: "bottom" }}>
              <EqualizerIcon sx={{ color: "info.main", mr: 0.8 }} />
              <Typography sx={{ color: "info.main" }}>Stats</Typography>
            </Box>{" "}
            tab.
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
              <EqualizerIcon sx={{ color: "primary.main", mr: 0.8 }} />
              <Typography sx={{ color: "primary.main" }}>Stats</Typography>
            </Box>{" "}
            shows information about your skills, money, and bonuses.
          </Typography>
        </>
      ),
      canNext: true,
    },
    [iTutorialSteps.GoToWorldPage as number]: {
      content: (
        <>
          <Typography>
            Next, let's go to{" "}
            <Box sx={{ display: "inline-flex", alignItems: "center", verticalAlign: "bottom" }}>
              <LocationCityIcon sx={{ color: "info.main", mr: 0.8 }} />
              <Typography sx={{ color: "info.main" }}>City</Typography>
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
            Each location in a city has something that you can do.
            <br />
            <br />
            Look out for <strong>T</strong>ech centres like alpha ent. They'll let you purchase servers and upgrade your
            home computer.
            <br />
            <br />
            There's a lot of other content out in the world, so make sure you explore and discover!
            <br />
            <br />
            Lastly, go to{" "}
            <Box sx={{ display: "inline-flex", alignItems: "center", verticalAlign: "bottom" }}>
              <HelpIcon sx={{ color: "info.main", mr: 0.8 }} />
              <Typography sx={{ color: "info.main" }}>Documentation</Typography>
            </Box>{" "}
          </Typography>
        </>
      ),
      canNext: false,
    },
    [iTutorialSteps.DocumentationPageInfo as number]: {
      content: (
        <Typography component="div">
          These pages explain the game's content and mechanics. I know it's a lot, but I highly suggest you read (or at
          least skim) through this before you start playing.
          <br />
          <br />
          These pages are especially helpful:
          <ul>
            <li>
              The <DocumentationLink page="help/getting_started.md">Beginner's guide</DocumentationLink> gives you an{" "}
              <strong>invaluable</strong> basic hacking script, and helps with most of the early game.
            </li>
            <li>
              The <DocumentationLink page={defaultNsApiPage}>NS API documentation</DocumentationLink> details the
              functions you can use in scripts.
            </li>
            <li>
              The <DocumentationLink page="help/faq.md">FAQ</DocumentationLink> answers questions often asked by
              beginners.
            </li>
          </ul>
          You'll notice that some Documentation pages are inaccessible right now. You'll unlock those later on.
          <br />
          <br />
          If you want to open one of the Documentaion page links in a new tab, click it while holding Ctrl (Control on a
          Mac keyboard). If you're playing the Steam version, doing that will open the link in your default browser.
          <br />
          <br />
          <Typography color={Settings.theme.warning}>
            Note: The documentation at readthedocs is outdated and unmaintained. Do not use it!
          </Typography>
          <br />
          While the documentation is the first place to get help, if you can't find an answer then please{" "}
          <Link
            href="https://discord.com/channels/415207508303544321/415207508303544323"
            underline="always"
            target="_blank"
            color={Settings.theme.info}
          >
            ask us on Discord
          </Link>
          .
          <br />
          <br />
          And that concludes the tutorial. I hope you enjoy the game!
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
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
        <Box>
          <Button onClick={iTutorialEnd}>
            {step !== iTutorialSteps.DocumentationPageInfo ? "Exit Tutorial" : "Finish Tutorial"}
          </Button>
        </Box>
        <Box>
          <Typography color="secondary" align="right">
            {step + 1} / {Object.keys(iTutorialSteps).length / 2 - 1}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
