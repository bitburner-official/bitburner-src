import React, { useState, useEffect } from "react";
import { ActiveFragment } from "../ActiveFragment";
import { StaneksGift } from "../StaneksGift";
import { FragmentTypeEnum, Effect } from "../FragmentType";
import { formatPercent, formatStaneksGiftCharge, formatStaneksGiftPower } from "../../ui/formatNumber";

import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

interface IProps {
  gift: StaneksGift;
  fragment: ActiveFragment | undefined;
  x: number;
  y: number;
}

export function FragmentInspector(props: IProps): React.ReactElement {
  const [, setC] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setC(new Date()), 250);

    return () => clearInterval(id);
  }, []);

  if (props.fragment === undefined) {
    return (
      <Paper sx={{ flexGrow: 1 }}>
        <Typography>
          [X, Y] {props.x}, {props.y}
          <br />
          <br />
          ID：N/A
          <br />
          效果：N/A
          <br />
          基础威力：N/A
          <br />
          充能：N/A
          <br />
          最高充能：N/A
          <br />
          根位置 [X, Y] N/A
          <br />
        </Typography>
      </Paper>
    );
  }
  const f = props.fragment.fragment();

  let charge = formatStaneksGiftCharge(props.fragment.highestCharge * props.fragment.numCharge);
  let highestCharge = formatStaneksGiftCharge(props.fragment.highestCharge);
  let effect = "N/A";
  // Boosters cannot be charged.
  if (f.type === FragmentTypeEnum.Booster) {
    charge = "N/A";
    highestCharge = "N/A";
    effect = `为相邻碎片提供 ${f.power}x 威力加成`;
  } else if (Effect(f.type).includes("+x%")) {
    effect = Effect(f.type).replace(/-*x%/, formatPercent(props.gift.effect(props.fragment) - 1));
  } else if (Effect(f.type).includes("-x%")) {
    const effectAmt = props.gift.effect(props.fragment);
    const perc = formatPercent(1 - 1 / effectAmt);
    effect = Effect(f.type).replace(/-x%/, perc);
  }

  return (
    <Paper sx={{ flexGrow: 1 }}>
      <Typography>
        [X, Y] {props.x}, {props.y}
        <br />
        <br />
        ID：{props.fragment.id}
        <br />
        效果：{effect}
        <br />
        基础威力：{formatStaneksGiftPower(f.power)}
        <br />
        充能：{charge}
        <br />
        最高充能：{highestCharge}
        <br />
        根位置 [X, Y] {props.fragment.x}, {props.fragment.y}
        <br />
      </Typography>
    </Paper>
  );
}
