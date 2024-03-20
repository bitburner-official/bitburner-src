import React from "react";
import { formatMoney } from "../../../ui/formatNumber";
import * as corpConstants from "../../data/Constants";
import { OfficeSpace } from "../../OfficeSpace";
import { Corporation } from "../../Corporation";
import { UpgradeOfficeSize } from "../../Actions";
import { Modal } from "../../../ui/React/Modal";
import { useCorporation } from "../Context";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import { calculateOfficeSizeUpgradeCost } from "../../helpers";

interface IUpgradeButton {
  cost: number;
  size: number;
  corp: Corporation;
  office: OfficeSpace;
  onClose: () => void;
  rerender: () => void;
}

function UpgradeSizeButton(props: IUpgradeButton): React.ReactElement {
  const corp = useCorporation();
  function upgradeSize(cost: number, size: number): void {
    if (corp.funds < cost) {
      return;
    }

    UpgradeOfficeSize(corp, props.office, size);
    props.rerender();
    props.onClose();
  }
  return (
    <Tooltip title={formatMoney(props.cost)}>
      <span>
        <Button disabled={corp.funds < props.cost} onClick={() => upgradeSize(props.cost, props.size)}>
          +{props.size}
        </Button>
      </span>
    </Tooltip>
  );
}

interface IProps {
  open: boolean;
  onClose: () => void;
  office: OfficeSpace;
  rerender: () => void;
}

export function UpgradeOfficeSizeModal(props: IProps): React.ReactElement {
  const corp = useCorporation();

  // appears as +3 office size upgrade
  const upgradeSizeBase = corpConstants.officeInitialSize;
  const upgradeCostBase = calculateOfficeSizeUpgradeCost(props.office.size, upgradeSizeBase);

  // appears as +15 office size upgrade
  const upgradeSize5x = 5 * corpConstants.officeInitialSize;
  const upgradeCost5x = calculateOfficeSizeUpgradeCost(props.office.size, 5 * corpConstants.officeInitialSize);

  // optionally appears as largest affordable office size upgrade (up to +150)
  let upgradeSizeMax = 150;
  let upgradeCostMax = Infinity;
  while (upgradeSizeMax > props.office.size) {
    upgradeCostMax = calculateOfficeSizeUpgradeCost(props.office.size, upgradeSizeMax - props.office.size);
    if (corp.funds > upgradeCostMax) break;
    upgradeSizeMax -= corpConstants.officeInitialSize;
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>Increase the size of your office space to fit additional employees!</Typography>
      <Box display="flex" alignItems="center">
        <Typography>Upgrade size: </Typography>
        <UpgradeSizeButton
          onClose={props.onClose}
          rerender={props.rerender}
          office={props.office}
          corp={corp}
          cost={upgradeCostBase}
          size={upgradeSizeBase}
        />
        <UpgradeSizeButton
          onClose={props.onClose}
          rerender={props.rerender}
          office={props.office}
          corp={corp}
          cost={upgradeCost5x}
          size={upgradeSize5x}
        />
        {upgradeSizeMax > 0 &&
          upgradeCostMax < Infinity &&
          upgradeSizeMax !== upgradeSizeBase &&
          upgradeSizeMax !== upgradeSize5x && (
            <UpgradeSizeButton
              onClose={props.onClose}
              rerender={props.rerender}
              office={props.office}
              corp={corp}
              cost={upgradeCostMax}
              size={upgradeSizeMax}
            />
          )}
      </Box>
    </Modal>
  );
}
