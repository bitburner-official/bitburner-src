import React, { useState } from "react";
import { Fragments, type Fragment } from "../Fragment";
import { FragmentTypeEnum, Effect } from "../FragmentType";
import { StaneksGift } from "../StaneksGift";
import { FragmentPreview } from "./FragmentPreview";
import { formatStaneksGiftPower } from "../../ui/formatNumber";

import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

interface IOptionProps {
  gift: StaneksGift;
  fragment: Fragment;
  selectFragment: (fragment: Fragment) => void;
}

function FragmentOption(props: IOptionProps): React.ReactElement {
  const left = props.fragment.limit - props.gift.count(props.fragment);
  const remaining = props.fragment.limit !== Infinity ? <>剩余 {left} 个</> : <></>;
  return (
    <Box display="flex">
      <Box sx={{ mx: 2 }}>
        <FragmentPreview
          width={props.fragment.width(0)}
          height={props.fragment.height(0)}
          colorAt={(x, y) => {
            if (!props.fragment.fullAt(x, y, 0)) return "";
            if (left === 0) return "grey";
            return props.fragment.type === FragmentTypeEnum.Booster ? "blue" : "green";
          }}
        />
      </Box>
      <Typography>
        {props.fragment.type === FragmentTypeEnum.Booster
          ? `为相邻碎片提供 ${props.fragment.power}x 威力加成`
          : Effect(props.fragment.type)}
        <br />
        威力：{formatStaneksGiftPower(props.fragment.power)}
        <br />
        {remaining}
      </Typography>
    </Box>
  );
}

export interface UIFragment {
  type: "None" | "Delete";
}

export function isUIFragment(fragment: object): fragment is UIFragment {
  return "type" in fragment && (fragment.type === "None" || fragment.type === "Delete");
}

interface IProps {
  gift: StaneksGift;
  selectFragment: (fragment: UIFragment | Fragment) => void;
}

export const NoneFragment: UIFragment = { type: "None" };
const DeleteFragment: UIFragment = { type: "Delete" };

export function FragmentSelector(props: IProps): React.ReactElement {
  const [value, setValue] = useState<string | number>("None");
  function onChange(event: SelectChangeEvent<string | number>): void {
    const v = event.target.value;
    setValue(v);
    if (v === "None") {
      props.selectFragment(NoneFragment);
      return;
    } else if (v === "Delete") {
      props.selectFragment(DeleteFragment);
      return;
    }
    const fragment = Fragments.find((f) => f.id === v);
    if (fragment === undefined) throw new Error("Fragment selector selected an undefined fragment with id " + v);
    if (typeof v === "number") props.selectFragment(fragment);
  }
  return (
    <Select sx={{ width: "100%" }} onChange={onChange} value={value}>
      <MenuItem value="None">
        <Typography>无</Typography>
      </MenuItem>
      <MenuItem value="Delete">
        <Typography>删除</Typography>
      </MenuItem>
      {Fragments.map((fragment) => (
        <MenuItem key={fragment.id} value={fragment.id}>
          <FragmentOption
            key={fragment.id}
            gift={props.gift}
            selectFragment={props.selectFragment}
            fragment={fragment}
          />
        </MenuItem>
      ))}
    </Select>
  );
}
