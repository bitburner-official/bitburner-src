/**
 * React Component for displaying a location's UI
 *
 * This is a "router" component of sorts, meaning it deduces the type of
 * location that is being rendered and then creates the proper component(s) for that.
 */
import * as React from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import { CompanyLocation } from "./CompanyLocation";
import { GymLocation } from "./GymLocation";
import { HospitalLocation } from "./HospitalLocation";
import { SlumsLocation } from "./SlumsLocation";
import { SpecialLocation } from "./SpecialLocation";
import { TechVendorLocation } from "./TechVendorLocation";
import { TravelAgencyRoot } from "./TravelAgencyRoot";
import { UniversityLocation } from "./UniversityLocation";
import { CasinoLocation } from "./CasinoLocation";

import { Location } from "../Location";
import { LocationType } from "../LocationTypeEnum";

import { Settings } from "../../Settings/Settings";

import { isBackdoorInstalled } from "../../Server/ServerHelpers";
import { GetServer } from "../../Server/AllServers";

import { CorruptableText } from "../../ui/React/CorruptableText";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { serverMetadata } from "../../Server/data/servers";
import { Tooltip } from "@mui/material";

type IProps = {
  loc: Location;
};

export function GenericLocation({ loc }: IProps): React.ReactElement {
  /**
   * Determine what needs to be rendered for this location based on the locations
   * type. Returns an array of React components that should be rendered
   */
  function getLocationSpecificContent(): React.ReactNode[] {
    const content: React.ReactNode[] = [];

    if (loc.types.includes(LocationType.Company)) {
      content.push(<CompanyLocation key="CompanyLocation" locName={loc.name} />);
    }

    if (loc.types.includes(LocationType.Gym)) {
      content.push(<GymLocation key="GymLocation" loc={loc} />);
    }

    if (loc.types.includes(LocationType.Hospital)) {
      content.push(<HospitalLocation key="HospitalLocation" />);
    }

    if (loc.types.includes(LocationType.Slums)) {
      content.push(<SlumsLocation key="SlumsLocation" />);
    }

    if (loc.types.includes(LocationType.Special)) {
      content.push(<SpecialLocation key="SpecialLocation" loc={loc} />);
    }

    if (loc.types.includes(LocationType.TechVendor)) {
      content.push(<TechVendorLocation key="TechVendorLocation" loc={loc} />);
    }

    if (loc.types.includes(LocationType.TravelAgency)) {
      content.push(<TravelAgencyRoot key="TravelAgencyRoot" />);
    }

    if (loc.types.includes(LocationType.University)) {
      content.push(<UniversityLocation key="UniversityLocation" loc={loc} />);
    }

    if (loc.types.includes(LocationType.Casino)) {
      content.push(<CasinoLocation key="CasinoLocation" />);
    }

    return content;
  }

  const locContent: React.ReactNode[] = getLocationSpecificContent();
  const serverMeta = serverMetadata.find((s) => s.specialName === loc.name);
  const server = GetServer(serverMeta ? serverMeta.hostname : "");

  const backdoorInstalled = server !== null && isBackdoorInstalled(server);

  return (
    <>
      <Button onClick={() => Router.toPage(Page.City)}>Return to World</Button>
      <Typography variant="h4" sx={{ mt: 1 }}>
        {backdoorInstalled && !Settings.DisableTextEffects ? (
          <Tooltip title={`Backdoor installed on ${loc.name}.`}>
            <span>
              <CorruptableText content={loc.name} />
            </span>
          </Tooltip>
        ) : (
          loc.name
        )}
      </Typography>
      {locContent}
    </>
  );
}
