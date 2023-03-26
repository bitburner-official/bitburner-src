import React, { useEffect } from "react";
import { find } from "lodash";

import { Box, Typography, Button, Container, Paper } from "@mui/material";
import { Check, Lock, Create } from "@mui/icons-material";

import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { Player } from "@player";
import { Settings } from "../../Settings/Settings";

import { Programs } from "../Programs";
import { CreateProgramWork, isCreateProgramWork } from "../../Work/CreateProgramWork";
import { useRerender } from "../../ui/React/hooks";

export const ProgramsSeen: string[] = [];

export function ProgramsRoot(): React.ReactElement {
  useRerender(200);

  const programs = [...Object.values(Programs)]
    .filter((prog) => {
      const create = prog.create;
      if (create === null) return false;
      if (prog.name === "b1t_flum3.exe") {
        return create.req();
      }
      return true;
    })
    .sort((a, b) => {
      if (Player.hasProgram(a.name)) return 1;
      if (Player.hasProgram(b.name)) return -1;
      return (a.create?.level ?? 0) - (b.create?.level ?? 0);
    });

  useEffect(() => {
    programs.forEach((p) => {
      if (ProgramsSeen.includes(p.name)) return;
      ProgramsSeen.push(p.name);
    });
  }, []);

  const getHackingLevelRemaining = (lvl: number): number => {
    return Math.ceil(Math.max(lvl - (Player.skills.hacking + Player.skills.intelligence / 2), 0));
  };

  const getProgCompletion = (name: string): number => {
    const programFile = find(Player.getHomeComputer().programs, (p) => {
      return p.startsWith(name) && p.endsWith("%-INC");
    });
    if (!programFile) return -1;

    const res = programFile.split("-");
    if (res.length != 3) return -1;
    const percComplete = Number(res[1].slice(0, -1));
    if (isNaN(percComplete) || percComplete < 0 || percComplete >= 100) {
      return -1;
    }
    return percComplete;
  };

  return (
    <Container disableGutters maxWidth="lg" sx={{ mx: 0, mb: 10 }}>
      <Typography variant="h4">Create program</Typography>
      <Typography>
        This page displays any programs that you are able to create. Writing the code for a program takes time, which
        can vary based on how complex the program is. If you are working on creating a program you can cancel at any
        time. Your progress will be saved and you can continue later.
      </Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", my: 1 }}>
        {programs.map((program) => {
          const create = program.create;
          if (create === null) return <></>;
          const curCompletion = getProgCompletion(program.name);

          return (
            <Box
              component={Paper}
              sx={{ p: 1, opacity: Player.hasProgram(program.name) ? 0.75 : 1 }}
              key={program.name}
            >
              <>
                <Typography variant="h6" sx={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                  {(Player.hasProgram(program.name) && <Check sx={{ mr: 1 }} />) ||
                    (create.req() && <Create sx={{ mr: 1 }} />) || <Lock sx={{ mr: 1 }} />}
                  {program.name}
                </Typography>
                {!Player.hasProgram(program.name) && create.req() && (
                  <Button
                    sx={{ my: 1, width: "100%" }}
                    onClick={(event) => {
                      if (!event.isTrusted) return;
                      if (isCreateProgramWork(Player.currentWork)) {
                        Player.finishWork(true);
                      }
                      Player.startWork(new CreateProgramWork({ singularity: false, programName: program.name }));
                      Player.startFocusing();
                      Router.toPage(Page.Work);
                    }}
                  >
                    {isCreateProgramWork(Player.currentWork) && Player.currentWork?.programName === program.name
                      ? "Resume focus"
                      : "Create program"}
                  </Button>
                )}
                {Player.hasProgram(program.name) || getHackingLevelRemaining(create.level) === 0 || (
                  <Typography color={Settings.theme.hack}>
                    <b>Unlocks in:</b> {getHackingLevelRemaining(create.level)} hacking levels
                  </Typography>
                )}
                {curCompletion !== -1 && (
                  <Typography color={Settings.theme.infolight}>
                    <b>Current completion:</b> {curCompletion}%
                  </Typography>
                )}
                {/*Displays the current completion of the program currently being created*/}
                {isCreateProgramWork(Player.currentWork) && Player.currentWork?.programName === program.name && (
                  <Typography color={Settings.theme.infolight}>
                    <b>Current completion:</b>{" "}
                    {((100 * Player.currentWork.unitCompleted) / Player.currentWork.unitNeeded()).toFixed(2)}%
                  </Typography>
                )}
                <Typography>{create.tooltip}</Typography>
              </>
            </Box>
          );
        })}
      </Box>
    </Container>
  );
}
