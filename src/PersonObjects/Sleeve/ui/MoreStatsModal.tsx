import { Sleeve } from "../Sleeve";
import { Player } from "@player";
import { formatExp, formatPercent } from "../../../ui/formatNumber";
import { convertTimeMsToTimeElapsedString } from "../../../utils/StringHelperFunctions";
import { CONSTANTS } from "../../../Constants";
import { Typography } from "@mui/material";
import { StatsTable } from "../../../ui/React/StatsTable";
import { Modal } from "../../../ui/React/Modal";
import React from "react";

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
            ...(Player.sourceFileLvl(5) > 0 || Player.bitNodeN === 5
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
      <StatsTable
        rows={[
          [<>Hacking Level multiplier:&nbsp;</>, formatPercent(props.sleeve.mults.hacking)],
          [<>Hacking Experience multiplier:&nbsp;</>, formatPercent(props.sleeve.mults.hacking_exp)],
          [<>Strength Level multiplier:&nbsp;</>, formatPercent(props.sleeve.mults.strength)],
          [<>Strength Experience multiplier:&nbsp;</>, formatPercent(props.sleeve.mults.strength_exp)],
          [<>Defense Level multiplier:&nbsp;</>, formatPercent(props.sleeve.mults.defense)],
          [<>Defense Experience multiplier:&nbsp;</>, formatPercent(props.sleeve.mults.defense_exp)],
          [<>Dexterity Level multiplier:&nbsp;</>, formatPercent(props.sleeve.mults.dexterity)],
          [<>Dexterity Experience multiplier:&nbsp;</>, formatPercent(props.sleeve.mults.dexterity_exp)],
          [<>Agility Level multiplier:&nbsp;</>, formatPercent(props.sleeve.mults.agility)],
          [<>Agility Experience multiplier:&nbsp;</>, formatPercent(props.sleeve.mults.agility_exp)],
          [<>Charisma Level multiplier:&nbsp;</>, formatPercent(props.sleeve.mults.charisma)],
          [<>Charisma Experience multiplier:&nbsp;</>, formatPercent(props.sleeve.mults.charisma_exp)],
          [<>Faction Reputation Gain multiplier:&nbsp;</>, formatPercent(props.sleeve.mults.faction_rep)],
          [<>Company Reputation Gain multiplier:&nbsp;</>, formatPercent(props.sleeve.mults.company_rep)],
          [<>Salary multiplier:&nbsp;</>, formatPercent(props.sleeve.mults.work_money)],
          [<>Crime Money multiplier:&nbsp;</>, formatPercent(props.sleeve.mults.crime_money)],
          [<>Crime Success multiplier:&nbsp;</>, formatPercent(props.sleeve.mults.crime_success)],
        ]}
        title="Multipliers:"
      />

      {/* Check for storedCycles to be a bit over 0 to prevent jittering */}
      {props.sleeve.storedCycles > 10 && (
        <Typography sx={{ py: 2 }}>
          Bonus Time: {convertTimeMsToTimeElapsedString(props.sleeve.storedCycles * CONSTANTS.MilliPerCycle)}
        </Typography>
      )}
    </Modal>
  );
}
