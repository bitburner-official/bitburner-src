import React, { useState } from "react";
import { purchaseServer } from "../../Server/ServerPurchases";
import { formatRam } from "../../ui/formatNumber";
import { Money } from "../../ui/React/Money";
import { Modal } from "../../ui/React/Modal";
import { Player } from "@player";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { KEY } from "../../utils/helpers/keyCodes";

interface IProps {
  open: boolean;
  onClose: () => void;
  ram: number;
  cost: number;
}

/** React Component for the popup used to purchase a new server. */
export function PurchaseServerModal(props: IProps): React.ReactElement {
  const [hostname, setHostname] = useState("");

  function tryToPurchaseServer(): void {
    purchaseServer(hostname, props.ram, props.cost);
    props.onClose();
  }

  function onKeyUp(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === KEY.ENTER) tryToPurchaseServer();
  }

  function onChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setHostname(event.target.value);
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        Would you like to purchase a new server with {formatRam(props.ram)} of RAM for{" "}
        <Money money={props.cost} forPurchase={true} />?
      </Typography>
      <br />
      <br />
      <Typography> Please enter the server hostname below:</Typography>
      <br />

      <TextField
        autoFocus
        onKeyUp={onKeyUp}
        onChange={onChange}
        type="text"
        placeholder="Unique Hostname"
        InputProps={{
          endAdornment: (
            <Button onClick={tryToPurchaseServer} disabled={!Player.canAfford(props.cost) || hostname === ""}>
              Buy
            </Button>
          ),
        }}
      />
    </Modal>
  );
}
