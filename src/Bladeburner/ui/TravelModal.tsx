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
          前往其他城市开展Bladeburner活动。这不花费任何资金。Bladeburner活动所在的城市不影响你在游戏中的其他位置状态。
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
