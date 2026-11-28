import type { Bladeburner } from "../Bladeburner";

import React from "react";
import { Button, Typography } from "@mui/material";
import { CityName } from "@enums";
import { WorldMap } from "../../ui/React/WorldMap";
import { Modal } from "../../ui/React/Modal";
import { Settings } from "../../Settings/Settings";

interface TravelModalProps {
  bladeburner: Bladeburner;
  open: boolean;
  onClose: () => void;
}

export function TravelModal({ bladeburner, open, onClose }: TravelModalProps): React.ReactElement {
  function travel(city: CityName): void {
    bladeburner.city = city;
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose}>
      <>
        <Typography>
          Travel to a different city for your Bladeburner activities. This does not cost any money. The city you are in
          for your Bladeburner duties does not affect your location in the game otherwise.
        </Typography>
        {Settings.DisableASCIIArt ? (
          Object.values(CityName).map((city) => (
            <Button key={city} onClick={() => travel(city)}>
              {city}
            </Button>
          ))
        ) : (
          <WorldMap currentCity={bladeburner.city} onTravel={travel} />
        )}
      </>
    </Modal>
  );
}
