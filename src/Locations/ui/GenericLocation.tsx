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
import { LocationType } from "@enums";

import { isBackdoorInstalled } from "../../Server/ServerHelpers";
import { GetServer } from "../../Server/AllServers";

import { CorruptibleText } from "../../ui/React/CorruptibleText";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { serverMetadata } from "../../Server/data/servers";
import { Tooltip } from "@mui/material";
import { getEnumHelper } from "../../utils/EnumHelper";
import { exceptionAlert } from "../../utils/helpers/exceptionAlert";

interface IProps {
  location: Location;
  showBackButton: boolean;
}

/**
 * Determine what needs to be rendered for this location based on the locations
 * type. Returns an array of React components that should be rendered
 */
function getLocationSpecificContent(location: Location): React.ReactNode[] {
  const content: React.ReactNode[] = [];

  if (location.types.includes(LocationType.Company)) {
    if (!getEnumHelper("CompanyName").isMember(location.name)) {
      throw new Error(`Location name ${location.name} is for a company but is not a company name.`);
    }
    content.push(<CompanyLocation key="CompanyLocation" companyName={location.name} />);
  }

  if (location.types.includes(LocationType.Gym)) {
    content.push(<GymLocation key="GymLocation" loc={location} />);
  }

  if (location.types.includes(LocationType.Hospital)) {
    content.push(<HospitalLocation key="HospitalLocation" />);
  }

  if (location.types.includes(LocationType.Slums)) {
    content.push(<SlumsLocation key="SlumsLocation" />);
  }

  if (location.types.includes(LocationType.Special)) {
    content.push(<SpecialLocation key="SpecialLocation" loc={location} />);
  }

  if (location.types.includes(LocationType.TechVendor)) {
    content.push(<TechVendorLocation key="TechVendorLocation" loc={location} />);
  }

  if (location.types.includes(LocationType.TravelAgency)) {
    content.push(<TravelAgencyRoot key="TravelAgencyRoot" />);
  }

  if (location.types.includes(LocationType.University)) {
    content.push(<UniversityLocation key="UniversityLocation" loc={location} />);
  }

  if (location.types.includes(LocationType.Casino)) {
    content.push(<CasinoLocation key="CasinoLocation" />);
  }

  return content;
}

export function GenericLocation({ location, showBackButton }: IProps): React.ReactElement {
  /**
   * location can be undefined if GenericLocation is used like this:
   *
   * <GenericLocation location={Locations["unknown"]} showBackButton={true} />
   *
   * We need to check it before using.
   */
  if (location == null) {
    exceptionAlert(new Error(`GenericLocation is used with invalid location.`), true);
    /**
     * Return to the Terminal tab. We put the call of Router.toPage() inside setTimeout to avoid updating GameRoot while
     * rendering this component.
     */
    setTimeout(() => {
      Router.toPage(Page.Terminal);
    }, 100);
    return <></>;
  }
  const locationContent: React.ReactNode[] = getLocationSpecificContent(location);
  const serverMeta = serverMetadata.find((s) => s.specialName === location.name);
  const server = GetServer(serverMeta ? serverMeta.hostname : "");

  const backdoorInstalled = server !== null && isBackdoorInstalled(server);

  return (
    <>
      {showBackButton && <Button onClick={() => Router.toPage(Page.City)}>Return to World</Button>}
      <Typography variant="h4" sx={{ mt: 1 }}>
        {backdoorInstalled && serverMeta ? (
          <Tooltip title={`Backdoor installed on ${serverMeta.hostname}.`}>
            <span>
              <CorruptibleText content={location.name} spoiler={false} />
            </span>
          </Tooltip>
        ) : (
          location.name
        )}
      </Typography>
      {locationContent}
    </>
  );
}
