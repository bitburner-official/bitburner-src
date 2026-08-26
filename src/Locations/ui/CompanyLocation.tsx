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
import { useCycleRerender } from "../../ui/React/hooks";
import { companyNameAsLocationName } from "../../Company/utils";
import { JobSummary } from "../../Company/ui/JobSummary";
import { StatsTable } from "../../ui/React/StatsTable";
import { JobListings } from "../../Company/ui/JobListings";
import { addRepToFavor } from "../../Faction/formulas/favor";

interface IProps {
  companyName: CompanyName;
}

export function CompanyLocation(props: IProps): React.ReactElement {
  const [quitOpen, setQuitOpen] = useState(false);
  const rerender = useCycleRerender();

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
   * CompanyPosition object for the job that the player holds at this company, if applicable
   */
  const currentPosition = jobTitle ? CompanyPositions[jobTitle] : null;

  Player.gotoLocation(companyNameAsLocationName(props.companyName));

  function startInfiltration(e: React.MouseEvent<HTMLElement>): void {
    if (!e.isTrusted) {
      return;
    }

    Player.initInfiltration(location);
    Router.toPage(Page.Infiltration);
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

  const isEmployedHere = currentPosition != null;

  return (
    <>
      <Box sx={{ display: "grid", width: "fit-content", minWidth: "25em" }}>
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
                        安装强化并转生后，你将拥有{" "}
                        <Favor favor={addRepToFavor(company.favor, company.playerReputation)} /> 点公司好感
                      </>
                    }
                  >
                    <Typography>总声望：</Typography>
                  </Tooltip>,
                  <Reputation key="rep" reputation={company.playerReputation} />,
                ],
                [
                  <Tooltip
                    key="favorLabel"
                    title={
                      <>
                        公司好感每有 1 点，你在该公司获取声望的速度就会提高 1%。每次安装强化后转生都会获得公司好感。获得的好感数量取决于你在该公司拥有的声望。
                      </>
                    }
                  >
                    <Typography>公司好感：</Typography>
                  </Tooltip>,
                  <Favor key="favor" favor={company.favor} />,
                ],
              ]}
            />
          </Paper>
        )}

        {isEmployedHere && (
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <Button onClick={work}>工作</Button>
            <Button onClick={() => setQuitOpen(true)}>离职</Button>
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

        {location.infiltrationData != null && <Button onClick={startInfiltration}>潜入公司</Button>}
      </Box>
    </>
  );
}
