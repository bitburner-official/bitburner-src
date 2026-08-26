import type { Augmentation } from "../../../Augmentation/Augmentation";

import { Player } from "@player";
import { AugmentationName, CityName } from "@enums";

import React, { useState } from "react";
import { CheckBox, CheckBoxOutlineBlank, Construction, Search } from "@mui/icons-material";
import { Box, Button, Container, List, ListItemButton, Paper, TextField, Typography } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";

import { GraftingWork } from "../../../Work/GraftingWork";
import { Augmentations } from "../../../Augmentation/Augmentations";
import { CONSTANTS } from "../../../Constants";
import { hasAugmentationPrereqs } from "../../../Faction/FactionHelpers";
import { PurchaseAugmentationsOrderSetting } from "../../../Settings/SettingEnums";
import { Settings } from "../../../Settings/Settings";
import { Router } from "../../../ui/GameRoot";
import { Page } from "../../../ui/Router";
import { ConfirmationModal } from "../../../ui/React/ConfirmationModal";
import { Money } from "../../../ui/React/Money";
import { formatNumberNoSuffix } from "../../../ui/formatNumber";
import { convertTimeMsToTimeElapsedString } from "../../../utils/StringHelperFunctions";
import { GraftableAugmentation } from "../GraftableAugmentation";
import { calculateGraftingTimeWithBonus, getGraftingAvailableAugs } from "../GraftingHelpers";
import { useCycleRerender } from "../../../ui/React/hooks";
import type { Result } from "@nsdefs";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";

export const GraftableAugmentations = (): Record<string, GraftableAugmentation> => {
  const gAugs: Record<string, GraftableAugmentation> = {};
  for (const aug of Object.values(Augmentations)) {
    const name = aug.name;
    const graftableAug = new GraftableAugmentation(aug);
    gAugs[name] = graftableAug;
  }
  return gAugs;
};

const canGraft = (aug: GraftableAugmentation): Result => {
  if (Player.city !== CityName.NewTokyo) {
    return { success: false, message: "你必须在新东京才能开始移植强化。" };
  }
  if (Player.money < aug.cost) {
    return { success: false, message: "你没有足够的资金。" };
  }
  if (!hasAugmentationPrereqs(aug.augmentation)) {
    return { success: false, message: "你不满足前置强化要求。" };
  }
  return { success: true };
};

interface IProps {
  aug: Augmentation;
}

const AugPreReqsChecklist = (props: IProps): React.ReactElement => {
  const aug = props.aug;

  return (
    <Typography color={Settings.theme.money}>
      <b>前置条件：</b>
      <br />
      {aug.prereqs.map((preAug) => (
        <span key={preAug} style={{ display: "flex", alignItems: "center" }}>
          {Player.hasAugmentation(preAug) ? <CheckBox sx={{ mr: 1 }} /> : <CheckBoxOutlineBlank sx={{ mr: 1 }} />}
          {preAug}
        </span>
      ))}
    </Typography>
  );
};

export const GraftingRoot = (): React.ReactElement => {
  const graftableAugmentations = useState(GraftableAugmentations())[0];

  const [selectedAug, setSelectedAug] = useState(getGraftingAvailableAugs()[0]);
  const [graftOpen, setGraftOpen] = useState(false);
  const [filterText, setFilterText] = useState("");
  const selectedAugmentation = Augmentations[selectedAug];
  const rerender = useCycleRerender();

  const matches = (s1: string, s2: string) => s1.toLowerCase().includes(s2.toLowerCase());
  const getAugsSorted = (): AugmentationName[] => {
    const augs = getGraftingAvailableAugs();
    if (Settings.PurchaseAugmentationsOrder === PurchaseAugmentationsOrderSetting.Cost) {
      augs.sort((a, b) => graftableAugmentations[a].cost - graftableAugmentations[b].cost);
    }
    if (filterText !== "") {
      return augs.filter(
        (aug: AugmentationName) =>
          matches(Augmentations[aug].name, filterText) ||
          matches(Augmentations[aug].info, filterText) ||
          matches(Augmentations[aug].stats, filterText),
      );
    }
    return augs;
  };

  const switchSortOrder = (newOrder: PurchaseAugmentationsOrderSetting): void => {
    Settings.PurchaseAugmentationsOrder = newOrder;
    rerender();
  };

  const checkResult = canGraft(graftableAugmentations[selectedAug]);

  return (
    <Container disableGutters maxWidth="lg" sx={{ mx: 0 }}>
      <Button onClick={() => Router.back()}>返回</Button>
      <Typography variant="h4">移植实验室</Typography>
      <Typography>
        你发现自己身处一间秘密实验室，它属于一位神秘的研究员。
        <br />
        <br />
        这位科学家解释说，他们一直在研究强化移植技术——一种无需重置身体即可应用强化的方法。
        <br />
        <br />
        通过一些游走在法律边缘的关系，这位科学家能接触到大量强化蓝图，甚至包括私藏设计。他们提出可以为你构建并移植这些强化，作为交换，你需要支付一笔不菲的资金，并充当他们的实验小白鼠。
        <br />
        <br />
        移植强化时，前置条件的规则与往常相同。如果某个强化有前置条件，你必须先购买、安装或移植这些前置强化，才能移植该强化。
      </Typography>

      <Box sx={{ my: 3 }}>
        <Paper sx={{ p: 1 }}>
          <Typography variant="h5">移植强化</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <Button sx={{ width: "100%" }} onClick={() => switchSortOrder(PurchaseAugmentationsOrderSetting.Cost)}>
              按费用排序
            </Button>
            <Button sx={{ width: "100%" }} onClick={() => switchSortOrder(PurchaseAugmentationsOrderSetting.Default)}>
              按默认顺序排序
            </Button>
          </Box>
        </Paper>
        {getGraftingAvailableAugs().length > 0 ? (
          <Paper sx={{ mb: 1, width: "fit-content", display: "grid", gridTemplateColumns: "1fr 3fr" }}>
            <Box>
              <TextField
                style={{ width: "100%" }}
                value={filterText}
                onChange={(e) => {
                  setFilterText(e.target.value);
                }}
                InputProps={{ startAdornment: <Search /> }}
              />
              <List sx={{ height: 400, overflowY: "scroll", borderRight: `1px solid ${Settings.theme.welllight}` }}>
                {getAugsSorted().map((k, i) => (
                  <ListItemButton key={i + 1} onClick={() => setSelectedAug(k)} selected={selectedAug === k}>
                    <Typography
                      sx={{
                        color: canGraft(graftableAugmentations[k]).success
                          ? Settings.theme.primary
                          : Settings.theme.disabled,
                      }}
                    >
                      {k}
                    </Typography>
                  </ListItemButton>
                ))}
              </List>
            </Box>
            <Box sx={{ m: 1 }}>
              <Typography variant="h6" sx={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                <Construction sx={{ mr: 1 }} /> {selectedAug}
              </Typography>
              <Tooltip title={checkResult.message}>
                <span>
                  <Button onClick={() => setGraftOpen(true)} sx={{ width: "100%" }} disabled={!checkResult.success}>
                    移植强化（
                    <Typography>
                      <Money money={graftableAugmentations[selectedAug].cost} forPurchase={true} />
                    </Typography>
                    ）
                  </Button>
                </span>
              </Tooltip>
              <ConfirmationModal
                open={graftOpen}
                onClose={() => setGraftOpen(false)}
                onConfirm={() => {
                  const checkResult = canGraft(graftableAugmentations[selectedAug]);
                  if (!checkResult.success) {
                    setGraftOpen(false);
                    dialogBoxCreate(checkResult.message);
                    return;
                  }
                  Player.startWork(
                    new GraftingWork({
                      augmentation: selectedAug,
                      singularity: false,
                    }),
                  );
                  Player.startFocusing();
                  Router.toPage(Page.Work);
                }}
                confirmationText={
                  <Typography component="div" paddingBottom="1rem">
                    取消移植将<b>不会</b>保存移植进度，且你已支付的资金将<b>不会</b>被退还。
                    {!Player.hasAugmentation(AugmentationName.CongruityImplant) &&
                      selectedAug !== AugmentationName.CongruityImplant && (
                        <>
                          <br />
                          <br />
                          此外，移植强化会增加熵病毒的强度。
                        </>
                      )}
                  </Typography>
                }
              />
              <Box sx={{ maxHeight: 330, overflowY: "scroll" }}>
                <Typography color={Settings.theme.info}>
                  <b>移植时间：</b>{" "}
                  {convertTimeMsToTimeElapsedString(
                    calculateGraftingTimeWithBonus(graftableAugmentations[selectedAug]),
                  )}
                  {/* Use formula so the displayed creation time is accurate to player bonus */}
                </Typography>

                {selectedAugmentation.prereqs.length > 0 && <AugPreReqsChecklist aug={selectedAugmentation} />}

                <br />

                <Typography whiteSpace={"pre-wrap"}>
                  {(() => {
                    const info =
                      typeof selectedAugmentation.info === "string" ? (
                        <span>{selectedAugmentation.info}</span>
                      ) : (
                        selectedAugmentation.info
                      );
                    const tooltip = (
                      <>
                        {info}
                        <br />
                        <br />
                        {selectedAugmentation.stats}
                      </>
                    );
                    return tooltip;
                  })()}
                </Typography>
              </Box>
            </Box>
          </Paper>
        ) : (
          <Typography>所有强化均已拥有</Typography>
        )}
      </Box>

      <Box sx={{ my: 3 }}>
        <Typography variant="h5">熵病毒</Typography>

        <Paper sx={{ my: 1, p: 1, width: "fit-content" }}>
          <Typography>
            <b>熵强度：</b> {Player.entropy}
            <br />
            <b>所有乘数降低：</b>{" "}
            {formatNumberNoSuffix((1 - CONSTANTS.EntropyEffect ** Player.entropy) * 100, 3)}%（乘法叠加）
          </Typography>
        </Paper>

        <Typography>
          当强化安装在失去意识的人身上时，身体会在苏醒时扫描这些强化，清除隐藏的恶意软件。然而，移植的强化并不提供这种安全保障。
          <br />
          <br />
          测试过强化移植的人报告出现了某种未知病毒的症状，即使重置身体后症状依然存在。他们将其命名为"熵"。这种病毒似乎会随着每次强化的移植而变得更强……
        </Typography>
      </Box>
    </Container>
  );
};
