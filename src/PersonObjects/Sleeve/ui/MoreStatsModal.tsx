import { Sleeve } from "../Sleeve";
import { formatExp } from "../../../ui/formatNumber";
import { convertTimeMsToTimeElapsedString } from "../../../utils/StringHelperFunctions";
import { CONSTANTS } from "../../../Constants";
import { Typography } from "@mui/material";
import { StatsTable } from "../../../ui/React/StatsTable";
import { Modal } from "../../../ui/React/Modal";
import React from "react";
import { canAccessBitNodeFeature } from "../../../BitNode/BitNodeUtils";

interface IProps {
  open: boolean;
  onClose: () => void;
  sleeve: Sleeve;
}

export function MoreStatsModal(props: IProps): React.ReactElement {
  return (
    <Modal open={props.open} onClose={props.onClose}>
      <StatsTable
        rows={[
          [<>Hacking:&nbsp;</>, props.sleeve.skills.hacking, <>&nbsp;({formatExp(props.sleeve.exp.hacking)} exp)</>],
          [<>Strength:&nbsp;</>, props.sleeve.skills.strength, <>&nbsp;({formatExp(props.sleeve.exp.strength)} exp)</>],
          [<>Defense:&nbsp;</>, props.sleeve.skills.defense, <>&nbsp;({formatExp(props.sleeve.exp.defense)} exp)</>],
          [
            <>Dexterity:&nbsp;</>,
            props.sleeve.skills.dexterity,
            <>&nbsp;({formatExp(props.sleeve.exp.dexterity)} exp)</>,
          ],
          [<>Agility:&nbsp;</>, props.sleeve.skills.agility, <>&nbsp;({formatExp(props.sleeve.exp.agility)} exp)</>],
          [<>Charisma:&nbsp;</>, props.sleeve.skills.charisma, <>&nbsp;({formatExp(props.sleeve.exp.charisma)} exp)</>],
          [
            ...(canAccessBitNodeFeature(5)
              ? [
                  <>Intelligence:&nbsp;</>,
                  props.sleeve.skills.intelligence,
                  <>&nbsp;({formatExp(props.sleeve.exp.intelligence)} exp)</>,
                ]
              : [<></>]),
          ],
          [<></>],
        ]}
        title="Stats:"
      />
      <br />

      {/* Check for storedCycles to be a bit over 0 to prevent jittering */}
      {props.sleeve.storedCycles > 10 && (
        <Typography sx={{ py: 2 }}>
          Bonus Time: {convertTimeMsToTimeElapsedString(props.sleeve.storedCycles * CONSTANTS.MilliPerCycle)}
        </Typography>
      )}
    </Modal>
  );
}
