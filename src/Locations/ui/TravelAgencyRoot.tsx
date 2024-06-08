/**
 * React Subcomponent for displaying a location's UI, when that location is a Travel Agency
 *
 * TThis subcomponent renders all of the buttons for traveling to different cities
 */
import React, { useState } from "react";

import { CityName } from "@enums";
import { TravelConfirmationModal } from "./TravelConfirmationModal";

import { CONSTANTS } from "../../Constants";
import { Player } from "@player";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { Settings } from "../../Settings/Settings";

import { Money } from "../../ui/React/Money";
import { WorldMap } from "../../ui/React/WorldMap";
import { dialogBoxCreate } from "../../ui/React/DialogBox";

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useRerender } from "../../ui/React/hooks";

function travel(to: CityName): void {
  if (!Player.travel(to)) {
    return;
  }
  if (!Settings.SuppressTravelConfirmation) {
    dialogBoxCreate(`You are now in ${to}!`);
  }
  Router.toPage(Page.City);
}

export function TravelAgencyRoot(): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [destination, setDestination] = useState(CityName.Sector12);
  useRerender(1000);

  function startTravel(city: CityName): void {
    if (!Player.canAfford(CONSTANTS.TravelCost)) {
      return;
    }
    if (Settings.SuppressTravelConfirmation) {
      travel(city);
      return;
    }
    setOpen(true);
    setDestination(city);
  }

  return (
    <>
      <Typography variant="h4">Travel Agency</Typography>
      <Box mx={2}>
        <Typography>
          From {Player.city}, you can travel to any other city! A ticket costs{" "}
          <Money money={CONSTANTS.TravelCost} forPurchase={true} />.
        </Typography>
        {Settings.DisableASCIIArt ? (
          <>
            {Object.values(CityName)
              .filter((city: string) => city != Player.city)
              .map((city: string) => {
                const match = Object.entries(CityName).find((entry) => entry[1] === city);
                if (match === undefined) throw new Error(`could not find key for city '${city}'`);
                return (
                  <React.Fragment key={city}>
                    <Button onClick={() => startTravel(city as CityName)} sx={{ m: 2 }}>
                      <Typography>Travel to {city}</Typography>
                    </Button>
                    <br />
                  </React.Fragment>
                );
              })}
          </>
        ) : (
          <WorldMap currentCity={Player.city} onTravel={(city: CityName) => startTravel(city)} />
        )}
      </Box>
      <TravelConfirmationModal
        city={destination}
        travel={() => travel(destination)}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
