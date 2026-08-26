import React from "react";
import { Typography } from "@mui/material";

import { Modal } from "../../ui/React/Modal";
import { boardStyles } from "../boardState/goStyles";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const GoScoreExplanation = ({ open, onClose }: Props): React.ReactElement => {
  const { classes } = boardStyles({});

  return (
    <Modal open={open} onClose={onClose}>
      <>
        <div className={classes.scoreExplanationModal}>
          <Typography component="div">
            <h2>IPvGO 得分说明</h2>
            IPvGO 采用围棋中最古老的计分方式之一——"数子法"（area scoring），而非后来由日本推广的"数目法"（territory
            scoring）。所有棋子除非被提走都算活棋，可能已死的棋链不会在对局结束后被自动提掉，也不计算俘子。所显示的得分始终是双方都停一手时的终局得分。
            <br /> <br />
            选择这套规则是因为它易于教学、便于计算，而不是采用那些为加快实体对局而设计的数目法捷径。
            <br /> <br />
            数目法高度依赖所有玩家都能清楚判断：在双方后续完美应对的情况下，盘上哪些棋链算"活"、哪些算"死"。它的实现要复杂得多，
            无论是对新手玩家还是对他们的 IPvGO 自动化脚本，都需要深入得多的围棋知识。
            <br /> <br />
            在大多数情况下，两种记分法得出的胜负与玩家间的分差是相同的，但数子法要求你"展示过程"，实际证明哪些棋是活是死，
            这也给了玩家利用电脑失误的机会（反之亦然）。
          </Typography>
        </div>
      </>
    </Modal>
  );
};
