import React from "react";

import Typography from "@mui/material/Typography";

import { Modal } from "../../ui/React/Modal";

interface IProps {
  open: boolean;
  onClose: () => void;
}

export const TerritoryInfoModal = ({ open, onClose }: IProps): React.ReactElement => {
  return (
    <Modal open={open} onClose={onClose}>
      <>
        <Typography variant="h4">Clashing</Typography>
        <Typography>
          Every ~20 seconds, gangs clash with each other over Territory. Your chance to win a clash depends on your
          gang's power and enemy gang's power, found in the Territory display or with methods from the Gang API. Power
          can be increased by assigning your gang members to Territory Warfare task. The gang that wins the clash takes
          a small amount of territory from the loser. A gang also loses a small amount of power whenever it loses a
          clash.
          <br />
          <br />
          Each gang that still controls some territory attacks one other random gang during a clash. Thus, the more
          gangs are participating, the more clashes happen, and the faster the territory changes hands.
        </Typography>
        <br />
        <Typography variant="h4">Gang Power</Typography>
        <Typography>
          To increase your Gang Power, assign gang members to "Territory Warfare". Power increase is applied at the same
          time the clashes happen. Gang members don't contribute to win chance directly and don't need to be set to
          Territory Warfare to clash. Clash results depend solely on Gang Power.
          <br />
          <br />
          Gang members assigned to Territory Warfare during clashes can be killed. This can happen regardless of whether
          you win or lose the clash, but it's more likely when you lose. Gang members with high defense are less likely
          to die. A gang member being killed results in loss of both respect and power for your gang. Gang members
          assigned to Delegate Territory Warfare are safe.
        </Typography>
        <br />
        <Typography variant="h4">Territory effects</Typography>
        <Typography>
          The amount of territory you have affects all aspects of your Gang members' production, including money,
          respect, and wanted level. It is very beneficial to have high territory control. Enforcer tasks benefit in
          particular.
        </Typography>
        <br />
        <Typography variant="h4">Territory Clash Chance</Typography>
        <Typography>
          This percentage represents the chance you have of 'clashing' with another gang. Enabling the Territory Clashes
          sets it to 100%, while disabling it makes it slowly fall to 0%, so it takes some time to disengage from
          clashes. You can completely ignore Clashes and Territory Warfare by keeping them disabled.
        </Typography>
        <br />
        <Typography variant="h4">Enemy Gangs</Typography>
        <Typography>
          Enemy gangs slowly increase in power at a rate that depends on the gang. Stronger gangs will eventually defeat
          weaker gangs without your involvment.
          <br />
          <br />A gang with 0% Territory is defeated and is effectively out of the competition. If you defeat all other
          gangs and acquire 100% Territory, you don't need to participate in Territory Warfare anymore.
        </Typography>
      </>
    </Modal>
  );
};
