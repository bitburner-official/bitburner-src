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

import { ApplyToJobButton } from "./ApplyToJobButton";

import { Locations } from "../Locations";
import { CompanyName, JobName, JobField } from "@enums";

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

  /**
   * CompanyPosition object for the job that the player holds at this company
   * (if he has one)
   */
  const companyPosition = jobTitle ? CompanyPositions[jobTitle] : null;

  Player.location = companyNameAsLocationName(props.companyName);

  function applyForAgentJob(e: React.MouseEvent<HTMLElement>): void {
    if (!e.isTrusted) {
      return;
    }
    Player.applyForAgentJob();
    rerender();
  }

  function applyForBusinessConsultantJob(e: React.MouseEvent<HTMLElement>): void {
    if (!e.isTrusted) {
      return;
    }
    Player.applyForBusinessConsultantJob();
    rerender();
  }

  function applyForBusinessJob(e: React.MouseEvent<HTMLElement>): void {
    if (!e.isTrusted) {
      return;
    }
    Player.applyForBusinessJob();
    rerender();
  }

  function applyForEmployeeJob(e: React.MouseEvent<HTMLElement>): void {
    if (!e.isTrusted) {
      return;
    }
    Player.applyForEmployeeJob();
    rerender();
  }

  function applyForItJob(e: React.MouseEvent<HTMLElement>): void {
    if (!e.isTrusted) {
      return;
    }
    Player.applyForItJob();
    rerender();
  }

  function applyForPartTimeEmployeeJob(e: React.MouseEvent<HTMLElement>): void {
    if (!e.isTrusted) {
      return;
    }
    Player.applyForPartTimeEmployeeJob();
    rerender();
  }

  function applyForPartTimeWaiterJob(e: React.MouseEvent<HTMLElement>): void {
    if (!e.isTrusted) {
      return;
    }
    Player.applyForPartTimeWaiterJob();
    rerender();
  }

  function applyForSecurityJob(e: React.MouseEvent<HTMLElement>): void {
    if (!e.isTrusted) {
      return;
    }
    Player.applyForSecurityJob();
    rerender();
  }

  function applyForSoftwareConsultantJob(e: React.MouseEvent<HTMLElement>): void {
    if (!e.isTrusted) {
      return;
    }
    Player.applyForSoftwareConsultantJob();
    rerender();
  }

  function applyForSoftwareJob(e: React.MouseEvent<HTMLElement>): void {
    if (!e.isTrusted) {
      return;
    }
    Player.applyForSoftwareJob();
    rerender();
  }

  function applyForWaiterJob(e: React.MouseEvent<HTMLElement>): void {
    if (!e.isTrusted) {
      return;
    }
    Player.applyForWaiterJob();
    rerender();
  }

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

    const pos = companyPosition;
    if (pos) {
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

  const isEmployedHere = jobTitle != null;
  const favorGain = company.getFavorGain();

  return (
    <>
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
        {company.hasAgentPositions() && (
          <ApplyToJobButton
            company={company}
            entryPosType={CompanyPositions[JobName.agent0]}
            onClick={applyForAgentJob}
            text={"Apply for " + JobField.agent + " Job"}
          />
        )}
        {company.hasBusinessConsultantPositions() && (
          <ApplyToJobButton
            company={company}
            entryPosType={CompanyPositions[JobName.businessConsult0]}
            onClick={applyForBusinessConsultantJob}
            text={"Apply for " + JobField.businessConsultant + " Job"}
          />
        )}
        {company.hasBusinessPositions() && (
          <ApplyToJobButton
            company={company}
            entryPosType={CompanyPositions[JobName.business0]}
            onClick={applyForBusinessJob}
            text={"Apply for " + JobField.business + " Job"}
          />
        )}
        {company.hasEmployeePositions() && (
          <ApplyToJobButton
            company={company}
            entryPosType={CompanyPositions[JobName.employee]}
            onClick={applyForEmployeeJob}
            text={"Apply to be an " + JobField.employee}
          />
        )}
        {company.hasEmployeePositions() && (
          <ApplyToJobButton
            company={company}
            entryPosType={CompanyPositions[JobName.employeePT]}
            onClick={applyForPartTimeEmployeeJob}
            text={"Apply to be a " + JobField.partTimeEmployee}
          />
        )}
        {company.hasITPositions() && (
          <ApplyToJobButton
            company={company}
            entryPosType={CompanyPositions[JobName.IT0]}
            onClick={applyForItJob}
            text={"Apply for " + JobField.it + " Job"}
          />
        )}
        {company.hasSecurityPositions() && (
          <ApplyToJobButton
            company={company}
            entryPosType={CompanyPositions[JobName.security0]}
            onClick={applyForSecurityJob}
            text={"Apply for " + JobField.security + " Job"}
          />
        )}
        {company.hasSoftwareConsultantPositions() && (
          <ApplyToJobButton
            company={company}
            entryPosType={CompanyPositions[JobName.softwareConsult0]}
            onClick={applyForSoftwareConsultantJob}
            text={"Apply for " + JobField.softwareConsultant + " Job"}
          />
        )}
        {company.hasSoftwarePositions() && (
          <ApplyToJobButton
            company={company}
            entryPosType={CompanyPositions[JobName.software0]}
            onClick={applyForSoftwareJob}
            text={"Apply for " + JobField.software + " Job"}
          />
        )}
        {company.hasWaiterPositions() && (
          <ApplyToJobButton
            company={company}
            entryPosType={CompanyPositions[JobName.waiter]}
            onClick={applyForWaiterJob}
            text={"Apply to be a " + JobField.waiter}
          />
        )}
        {company.hasWaiterPositions() && (
          <ApplyToJobButton
            company={company}
            entryPosType={CompanyPositions[JobName.waiterPT]}
            onClick={applyForPartTimeWaiterJob}
            text={"Apply to be a " + JobField.partTimeWaiter}
          />
        )}
        {location.infiltrationData != null && <Button onClick={startInfiltration}>Infiltrate Company</Button>}
      </Box>
    </>
  );
}
