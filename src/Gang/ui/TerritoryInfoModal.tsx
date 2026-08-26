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
        <Typography variant="h4">冲突</Typography>
        <Typography>
          每约 20 秒，你的帮派就有一次与其他帮派“冲突”的机会。你赢得冲突的概率取决于你帮派的势力，势力值可在地盘面板中查看，或通过
          Gang API 的方法获取。你的帮派势力会随时间缓慢积累，其数值由所有被分配到“Territory Warfare”任务的帮派成员的属性决定。未被分配到该任务的成员不会为你帮派的势力做出贡献。此外，每当你在冲突中落败，帮派都会损失少量势力。
          <br />
          <br />
          注意：被分配到“Territory Warfare”任务的帮派成员可能会在冲突中死亡。无论冲突胜负如何，这种情况都可能发生。帮派成员死亡会导致你的帮派损失尊重和势力。
        </Typography>
        <br />
        <Typography variant="h4">地盘</Typography>
        <Typography>
          你拥有的地盘数量会影响帮派成员产出的一切方面，包括资金、尊重和通缉等级。控制大量地盘非常有利。
          <br />
          <br />
          要提高赢得地盘的几率，可将帮派成员分配到"Territory Warfare"任务。这会提升你的帮派势力。然后，启用“参与地盘冲突”即可开始争夺地盘。
        </Typography>
        <br />
        <Typography variant="h4">地盘冲突概率</Typography>
        <Typography>
          此百分比表示你与其他帮派发生“冲突”的概率。如果你不想获得或失去地盘，就不要参与地盘冲突，让此百分比保持在 0%。
        </Typography>
      </>
    </Modal>
  );
};
