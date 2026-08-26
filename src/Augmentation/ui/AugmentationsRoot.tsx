/**
 * Root React component for the Augmentations UI page that display all of your
 * owned and purchased Augmentations and Source-Files.
 */
import React, { useState } from "react";

import { InstalledAugmentations } from "./InstalledAugmentations";
import { PlayerMultipliers } from "./PlayerMultipliers";
import { PurchasedAugmentations } from "./PurchasedAugmentations";
import { SourceFilesElement } from "./SourceFiles";

import { canGetBonus } from "../../ExportBonus";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import { Settings } from "../../Settings/Settings";
import { ConfirmationModal } from "../../ui/React/ConfirmationModal";
import { Player } from "@player";
import { AugmentationName } from "@enums";
import { Augmentations } from "../Augmentations";
import { CONSTANTS } from "../../Constants";
import { formatNumberNoSuffix } from "../../ui/formatNumber";
import { Info } from "@mui/icons-material";
import { Link } from "@mui/material";
import { AlertEvents } from "../../ui/React/AlertManager";
import { useCycleRerender } from "../../ui/React/hooks";

const NeuroFluxDisplay = (): React.ReactElement => {
  const level = Player.augmentations.find((e) => e.name === AugmentationName.NeuroFluxGovernor)?.level ?? 0;

  const openBloodDonation = () => {
    AlertEvents.emit(
      <>
        <Typography variant="h5">Bitburner 献血社区计划</Typography>
        <Typography>
          献血计划是一项始于 2022-04-01 的持续进行的现实活动。参与方式很简单：前往本地机构献血、血浆或血小板，并拍照作为证明（隐藏你的个人信息）。然后，把证明发送到
          reddit 或 discord 上的 hydroflame。
        </Typography>
        <Typography>目前已累计 {CONSTANTS.Donations} 次捐赠。</Typography>
      </>,
    );
  };
  return level > 0 ? (
    <Paper sx={{ p: 1 }}>
      <Typography variant="h5" color={Settings.theme.info}>
        NeuroFlux Governor - {level} 级
      </Typography>
      <Typography color={Settings.theme.info} whiteSpace={"pre-wrap"}>
        {Augmentations[AugmentationName.NeuroFluxGovernor].stats}
      </Typography>
      <Typography color={Settings.theme.info}>
        {AugmentationName.NeuroFluxGovernor} 的威力会随着玩家在现实中的献血而增强。在
        <Link onClick={openBloodDonation}>这里</Link>了解更多
      </Typography>
    </Paper>
  ) : (
    <></>
  );
};

const EntropyDisplay = (): React.ReactElement => {
  return Player.entropy > 0 ? (
    <Paper sx={{ p: 1 }}>
      <Typography variant="h5" color={Settings.theme.error}>
        熵病毒 - {Player.entropy} 级
      </Typography>
      <Typography color={Settings.theme.error}>
        <b>所有乘数降低：</b>{" "}
        {formatNumberNoSuffix((1 - CONSTANTS.EntropyEffect ** Player.entropy) * 100, 3)}%（乘法叠加）
      </Typography>
    </Paper>
  ) : (
    <></>
  );
};

interface IProps {
  exportGameFn: () => void;
  installAugmentationsFn: () => void;
}

export function AugmentationsRoot(props: IProps): React.ReactElement {
  const [installOpen, setInstallOpen] = useState(false);
  const rerender = useCycleRerender();

  function doExport(): void {
    props.exportGameFn();
    rerender();
  }

  function exportBonusStr(): string {
    if (canGetBonus()) return "（所有派系好感 +1）";
    return "";
  }

  function doInstall(): void {
    if (!Settings.SuppressBuyAugmentationConfirmation) {
      setInstallOpen(true);
    } else {
      props.installAugmentationsFn();
    }
  }

  return (
    <Container disableGutters maxWidth="lg" sx={{ mx: 0 }}>
      <Typography variant="h4">强化</Typography>
      <Box sx={{ mb: 1 }}>
        <Paper sx={{ p: 1 }}>
          <Typography variant="h5" color="primary" sx={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
            已购买的强化
            <Tooltip
              title={
                <>
                  <Typography>
                    下面是你已购买但尚未安装的所有强化的列表。点击下方的按钮安装它们。
                  </Typography>
                  <Typography>
                    警告：安装强化会重置你的大部分进度，包括：
                  </Typography>
                  <br />
                  <Typography>- 属性/技能等级与经验</Typography>
                  <Typography>- 资金</Typography>
                  <Typography>- 除家用电脑外所有电脑上的脚本</Typography>
                  <Typography>- 云服务器</Typography>
                  <Typography>- Hacknet</Typography>
                  <Typography>- 派系/公司声望</Typography>
                  <Typography>- 股票</Typography>
                  <br />
                  <Typography>
                    安装强化让你可以重新开始，并保留你曾经安装过的所有强化所赋予的特权与好处。此外，你在家用电脑上的脚本和 RAM/核心升级都会保留（但除
                    NUKE.exe 外的所有程序都会丢失）
                  </Typography>
                </>
              }
            >
              <Info sx={{ ml: 1, mb: 0.5 }} color="info" />
            </Tooltip>
          </Typography>
          <ConfirmationModal
            open={installOpen}
            onClose={() => setInstallOpen(false)}
            onConfirm={props.installAugmentationsFn}
            confirmationText={
              <>
                安装将重置：
                <br />
                <br />- 资金
                <br />- 技能 / 经验
                <br />- 除家用电脑外的所有服务器
                <br />- 派系和声望
                <br />- 当前工作活动
                <br />
                <br />
                你将保留：
                <br />
                <br />- 家用电脑上的所有脚本
                <br />- 家用电脑的 RAM 和核心数
                <br />
                <br />
                建议一次性安装多个强化。
              </>
            }
          />
          <Box sx={{ display: "grid", width: "100%", gridTemplateColumns: "1fr 1fr" }}>
            <Tooltip title={<Typography>'我从未要求过这些'</Typography>}>
              <span>
                <Button sx={{ width: "100%" }} disabled={Player.queuedAugmentations.length === 0} onClick={doInstall}>
                  安装强化
                </Button>
              </span>
            </Tooltip>
            <Tooltip title={<Typography>备份/导出存档永远是个好主意！</Typography>}>
              <Button sx={{ width: "100%", color: Settings.theme.successlight }} onClick={doExport}>
                备份存档 {exportBonusStr()}
              </Button>
            </Tooltip>
          </Box>
        </Paper>
        {Player.queuedAugmentations.length > 0 ? (
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 3fr" }}>
            <PurchasedAugmentations />
            <PlayerMultipliers />
          </Box>
        ) : (
          <Paper sx={{ p: 1 }}>
            <Typography>尚未购买任何强化</Typography>
          </Paper>
        )}
      </Box>

      <Box
        sx={{
          my: 1,
          display: "grid",
          gridTemplateColumns: `repeat(${
            +!!((Player.augmentations.find((e) => e.name === AugmentationName.NeuroFluxGovernor)?.level ?? 0) > 0) +
            +!!(Player.entropy > 0)
          }, 1fr)`,
          gap: 1,
        }}
      >
        <NeuroFluxDisplay />
        <EntropyDisplay />
      </Box>

      <Box>
        <InstalledAugmentations />
      </Box>
      <SourceFilesElement />
    </Container>
  );
}
