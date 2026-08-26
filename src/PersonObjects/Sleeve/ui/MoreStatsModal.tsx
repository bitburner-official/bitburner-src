import { Sleeve } from "../Sleeve";
import { formatExp, formatPercent } from "../../../ui/formatNumber";
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
          [<>黑客：&nbsp;</>, props.sleeve.skills.hacking, <>&nbsp;（{formatExp(props.sleeve.exp.hacking)} 经验）</>],
          [<>力量：&nbsp;</>, props.sleeve.skills.strength, <>&nbsp;（{formatExp(props.sleeve.exp.strength)} 经验）</>],
          [<>防御：&nbsp;</>, props.sleeve.skills.defense, <>&nbsp;（{formatExp(props.sleeve.exp.defense)} 经验）</>],
          [
            <>灵巧：&nbsp;</>,
            props.sleeve.skills.dexterity,
            <>&nbsp;（{formatExp(props.sleeve.exp.dexterity)} 经验）</>,
          ],
          [<>敏捷：&nbsp;</>, props.sleeve.skills.agility, <>&nbsp;（{formatExp(props.sleeve.exp.agility)} 经验）</>],
          [<>魅力：&nbsp;</>, props.sleeve.skills.charisma, <>&nbsp;（{formatExp(props.sleeve.exp.charisma)} 经验）</>],
          [
            ...(canAccessBitNodeFeature(5)
              ? [
                  <>智力：&nbsp;</>,
                  props.sleeve.skills.intelligence,
                  <>&nbsp;（{formatExp(props.sleeve.exp.intelligence)} 经验）</>,
                ]
              : [<></>]),
          ],
          [<></>],
        ]}
        title="属性："
      />
      <br />
      <StatsTable
        rows={[
          [<>黑客等级乘数：&nbsp;</>, formatPercent(props.sleeve.mults.hacking)],
          [<>黑客经验乘数：&nbsp;</>, formatPercent(props.sleeve.mults.hacking_exp)],
          [<>力量等级乘数：&nbsp;</>, formatPercent(props.sleeve.mults.strength)],
          [<>力量经验乘数：&nbsp;</>, formatPercent(props.sleeve.mults.strength_exp)],
          [<>防御等级乘数：&nbsp;</>, formatPercent(props.sleeve.mults.defense)],
          [<>防御经验乘数：&nbsp;</>, formatPercent(props.sleeve.mults.defense_exp)],
          [<>灵巧等级乘数：&nbsp;</>, formatPercent(props.sleeve.mults.dexterity)],
          [<>灵巧经验乘数：&nbsp;</>, formatPercent(props.sleeve.mults.dexterity_exp)],
          [<>敏捷等级乘数：&nbsp;</>, formatPercent(props.sleeve.mults.agility)],
          [<>敏捷经验乘数：&nbsp;</>, formatPercent(props.sleeve.mults.agility_exp)],
          [<>魅力等级乘数：&nbsp;</>, formatPercent(props.sleeve.mults.charisma)],
          [<>魅力经验乘数：&nbsp;</>, formatPercent(props.sleeve.mults.charisma_exp)],
          [<>派系声望获取乘数：&nbsp;</>, formatPercent(props.sleeve.mults.faction_rep)],
          [<>公司声望获取乘数：&nbsp;</>, formatPercent(props.sleeve.mults.company_rep)],
          [<>薪资乘数：&nbsp;</>, formatPercent(props.sleeve.mults.work_money)],
          [<>犯罪资金乘数：&nbsp;</>, formatPercent(props.sleeve.mults.crime_money)],
          [<>犯罪成功率乘数：&nbsp;</>, formatPercent(props.sleeve.mults.crime_success)],
        ]}
        title="乘数："
      />

      {/* Check for storedCycles to be a bit over 0 to prevent jittering */}
      {props.sleeve.storedCycles > 10 && (
        <Typography sx={{ py: 2 }}>
          奖励时间：{convertTimeMsToTimeElapsedString(props.sleeve.storedCycles * CONSTANTS.MilliPerCycle)}
        </Typography>
      )}
    </Modal>
  );
}
