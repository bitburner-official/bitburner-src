import React from "react";

import { HashUpgrades } from "../HashUpgrades";

import { Hashes } from "../../ui/React/Hashes";
import { HacknetUpgradeElem } from "./HacknetUpgradeElem";
import { Modal } from "../../ui/React/Modal";
import { Player } from "@player";
import Typography from "@mui/material/Typography";
import { useRerender } from "../../ui/React/hooks";

interface IProps {
  open: boolean;
  onClose: () => void;
}

/** Create the pop-up for purchasing upgrades with hashes */
export function HashUpgradeModal(props: IProps): React.ReactElement {
  const rerender = useRerender(200);

  const hashManager = Player.hashManager;
  if (!hashManager) {
    throw new Error(`Player does not have a HashManager)`);
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <>
        <Typography>Spend your hashes on a variety of different upgrades</Typography>
        <Typography>
          Hashes: <Hashes hashes={Player.hashManager.hashes} />
        </Typography>
        {Object.keys(HashUpgrades).map((upgName) => {
          const upg = HashUpgrades[upgName];
          return <HacknetUpgradeElem upg={upg} hashManager={hashManager} key={upg.name} rerender={rerender} />;
        })}
      </>
    </Modal>
  );
}
