/**
 * React Subcomponent for displaying a location's UI, when that location is a company
 *
 * This subcomponent renders all of the buttons for applying to jobs at a company
 */
import React, { useState } from "react";
import { Paper, Box, Tooltip, Button, Typography } from "@mui/material";

import { Locations } from "../Locations";
import { CompanyName } from "@enums";

import { Companies } from "../../Company/Companies";
import { CompanyPositions } from "../../Company/CompanyPositions";

import { Reputation } from "../../ui/React/Reputation";
import { Favor } from "../../ui/React/Favor";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { Player } from "@player";
import { QuitJobModal } from "../../Company/ui/QuitJobModal";
import { CompanyWork } from "../../Work/CompanyWork";
import { useRerender } from "../../ui/React/hooks";
import { companyNameAsLocationName } from "../../Company/utils";
import { JobSummary } from "../../Company/ui/JobSummary";
import { StatsTable } from "../../ui/React/StatsTable";
import { JobListings } from "../../Company/ui/JobListings";
import { calculateFavorAfterResetting } from "../../Faction/formulas/favor";

interface IProps {
  companyName: CompanyName;
}

export function CompanyLocation(props: IProps): React.ReactElement {
  const [quitOpen, setQuitOpen] = useState(false);
  const rerender = useRerender(200);

  /**
   * We'll keep a reference to the Company that this component is being rendered for,
   * so we don't have to look it up every time
   */
  const company = Companies[props.companyName];
  if (company == null)
    throw new Error(`CompanyLocation component constructed with invalid company: ${props.companyName}`);

  /** Reference to the Location that this component is being rendered for */
  const location = Locations[props.companyName];
  if (location == null) {
    throw new Error(`CompanyLocation component constructed with invalid location: ${props.companyName}`);
  }

  /** Name of company position that player holds, if applicable */
  const jobTitle = Player.jobs[props.companyName] ? Player.jobs[props.companyName] : null;
  const hasMoreJobs = Object.keys(Player.jobs).length > 1;

  /**
   * CompanyPosition object for the job that the player holds at this company, if applicable
   */
  const currentPosition = jobTitle ? CompanyPositions[jobTitle] : null;

  Player.location = companyNameAsLocationName(props.companyName);

  function startInfiltration(e: React.MouseEvent<HTMLElement>): void {
    if (!e.isTrusted) {
      return;
    }
    if (!location.infiltrationData)
      throw new Error(`trying to start infiltration at ${props.companyName} but the infiltrationData is null`);

    Router.toPage(Page.Infiltration, { location });
  }

  function work(e: React.MouseEvent<HTMLElement>): void {
    if (!e.isTrusted) {
      return;
    }

    if (currentPosition) {
      Player.startWork(
        new CompanyWork({
          singularity: false,
          companyName: props.companyName,
        }),
      );
      Player.startFocusing();
      Router.toPage(Page.Work);
    }
  }

  function switchLoc(num: number): void {
    let targetNum = Object.keys(Player.jobs).findIndex((x) => x == props.companyName);
    if (targetNum === -1) return;
    targetNum += num;
    if (targetNum >= Object.keys(Player.jobs).length) {
      targetNum = 0;
    } else if (targetNum < 0) {
      targetNum = Object.keys(Player.jobs).length - 1;
    }
    Router.toPage(Page.Job, { location: Locations[Object.keys(Player.jobs)[targetNum]] });
  }

  const isEmployedHere = currentPosition != null;

  return (
    <>
      <Box sx={{ display: "grid", width: "fit-content", minWidth: "25em" }}>
        {isEmployedHere && hasMoreJobs && (
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <Button onClick={() => switchLoc(-1)}>Previous Job</Button>
            <Button onClick={() => switchLoc(1)}>Next Job</Button>
          </Box>
        )}
        {isEmployedHere && (
          <Paper sx={{ p: "0.5em 1em", mt: 2, mb: 2 }}>
            <JobSummary company={company} position={currentPosition} />
            <StatsTable
              wide
              rows={[
                [
                  <Tooltip
                    key="repLabel"
                    title={
                      <>
                        You will have{" "}
                        <Favor favor={calculateFavorAfterResetting(company.favor, company.playerReputation)} /> company
                        favor upon resetting after installing Augmentations
                      </>
                    }
                  >
                    <Typography>Total reputation:</Typography>
                  </Tooltip>,
                  <Reputation key="rep" reputation={company.playerReputation} />,
                ],
                [
                  <Tooltip
                    key="favorLabel"
                    title={
                      <>
                        Company favor increases the rate at which you earn reputation for this company by 1% per favor.
                        Company favor is gained whenever you reset after installing Augmentations. The amount of favor
                        you gain depends on how much reputation you have with the company.
                      </>
                    }
                  >
                    <Typography>Company favor:</Typography>
                  </Tooltip>,
                  <Favor key="favor" favor={company.favor} />,
                ],
              ]}
            />
          </Paper>
        )}

        {isEmployedHere && (
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <Button onClick={work}>Work</Button>
            <Button onClick={() => setQuitOpen(true)}>Quit</Button>
            <QuitJobModal
              companyName={props.companyName}
              company={company}
              onQuit={rerender}
              open={quitOpen}
              onClose={() => setQuitOpen(false)}
            />
          </Box>
        )}

        {company.companyPositions.size > 0 && <JobListings company={company} currentPosition={currentPosition} />}

        {location.infiltrationData != null && <Button onClick={startInfiltration}>Infiltrate Company</Button>}
      </Box>
    </>
  );
}
