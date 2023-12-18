/**
 * React Subcomponent for displaying a location's UI, when that location is a company
 *
 * This subcomponent renders all of the buttons for applying to jobs at a company
 */
import React, { useState } from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";

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
import { JobListingsModal } from "../../Company/ui/JobListingsModal";
import type { Company } from "../../Company/Company";
import type { CompanyPosition } from "../../Company/CompanyPosition";

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

  const isEmployedHere = jobTitle != null;
  const favorGain = company.getFavorGain();

  return (
    <>
      {isEmployedHere && hasMoreJobs && (
        <>
          <Box>
            <Button onClick={() => switchLoc(-1)}>Previous</Button>
            <Button onClick={() => switchLoc(1)}>Next</Button>
          </Box>
          <br />
        </>
      )}
      {isEmployedHere && (
        <>
          <Typography>Job Title: {jobTitle}</Typography>
          <Typography>-------------------------</Typography>
          <Box display="flex">
            <Tooltip
              title={
                <>
                  You will have <Favor favor={company.favor + favorGain} /> company favor upon resetting after
                  installing Augmentations
                </>
              }
            >
              <Typography>
                Company reputation: <Reputation reputation={company.playerReputation} />
              </Typography>
            </Tooltip>
          </Box>
          <Typography>-------------------------</Typography>
          <Box display="flex">
            <Tooltip
              title={
                <>
                  Company favor increases the rate at which you earn reputation for this company by 1% per favor.
                  Company favor is gained whenever you reset after installing Augmentations. The amount of favor you
                  gain depends on how much reputation you have with the company.
                </>
              }
            >
              <Typography>
                Company Favor: <Favor favor={company.favor} />
              </Typography>
            </Tooltip>
          </Box>
          <Typography>-------------------------</Typography>
          <br />
        </>
      )}
      <Box sx={{ display: "grid", width: "fit-content" }}>
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

        {company.companyPositions.size > 0 && <JobListingsButton company={company} currentPosition={currentPosition}/>}

        {location.infiltrationData != null && <Button onClick={startInfiltration}>Infiltrate Company</Button>}
      </Box>
    </>
  );
}

interface IJobListingsButtonProps {
  company: Company;
  currentPosition: CompanyPosition | null;
}

function JobListingsButton(props: IJobListingsButtonProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={()=>{setOpen(true)}}>
        Job Listings
      </Button>
      <JobListingsModal open={open} onClose={()=>setOpen(false)} {...props} />
    </>
  )
}
