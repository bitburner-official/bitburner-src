import React from "react";
import { Button, Typography } from "@mui/material";
import { CityName } from "@enums";
import { Sleeve } from "../Sleeve";
import { CONSTANTS } from "../../../Constants";
import { Money } from "../../../ui/React/Money";
import { WorldMap } from "../../../ui/React/WorldMap";
import { Settings } from "../../../Settings/Settings";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import { Modal } from "../../../ui/React/Modal";

interface TravelModalProps {
  open: boolean;
  onClose: () => void;
  sleeve: Sleeve;
  rerender: () => void;
}

export function TravelModal(props: TravelModalProps): React.ReactElement {
  function travel(city: CityName): void {
    if (!props.sleeve.travel(city)) {
      dialogBoxCreate("You cannot afford to have this sleeve travel to another city");
      return;
    }
    props.sleeve.stopWork();
    props.rerender();
    props.onClose();
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <>
        <Typography>
          Have this sleeve travel to a different city. This affects the gyms and universities at which this sleeve can
          study. Traveling to a different city costs <Money money={CONSTANTS.TravelCost} forPurchase={true} />. It will
          also set your current sleeve task to idle.
        </Typography>
        {Settings.DisableASCIIArt ? (
          Object.values(CityName).map((city) => (
            <Button key={city} onClick={() => travel(city)}>
              {city}
            </Button>
          ))
        ) : (
          <WorldMap currentCity={props.sleeve.city} onTravel={travel} />
        )}
      </>
    </Modal>
  );
}
