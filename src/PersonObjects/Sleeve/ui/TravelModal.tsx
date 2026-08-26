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
      dialogBoxCreate("你负担不起让该分身前往另一座城市的费用");
      return;
    }
    props.rerender();
    props.onClose();
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <>
        <Typography>
          让该分身前往另一座城市。这会影响该分身可以使用的健身房和大学。前往另一座城市需要花费{" "}
          <Money money={CONSTANTS.TravelCost} forPurchase={true} />，同时你当前分身的任务会被设为空闲。
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
