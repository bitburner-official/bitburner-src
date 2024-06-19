import React from "react";

import { Player } from "@player";
import { type BitNodeBooleanOptions } from "@nsdefs";
import { enterBitNode } from "../../RedPill";
import { BitNodes } from "../BitNode";
import { Modal } from "../../ui/React/Modal";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { BitnodeMultiplierDescription } from "./BitnodeMultipliersDescription";
import { BitNodeAdvancedOptions } from "./BitNodeAdvancedOptions";

interface IProps {
  open: boolean;
  onClose: () => void;
  n: number;
  level: number;
  destroyedBitNode: number;
  flume: boolean;
}

export function PortalModal(props: IProps): React.ReactElement {
  const bitNodeKey = "BitNode" + props.n;
  const bitNode = BitNodes[bitNodeKey];
  if (bitNode == null) throw new Error(`Could not find BitNode object for number: ${props.n}`);
  const maxSourceFileLevel = props.n === 12 ? "∞" : "3";
  const newLevel = Math.min(props.level + 1, props.n === 12 ? Number.MAX_VALUE : 3);

  let currentSourceFiles = new Map(Player.sourceFiles);
  if (!props.flume) {
    const currentSourceFileLevel = Player.sourceFileLvl(props.destroyedBitNode);
    if (currentSourceFileLevel < 3 || props.destroyedBitNode === 12) {
      currentSourceFiles.set(props.destroyedBitNode, currentSourceFileLevel + 1);
    }
  }
  currentSourceFiles = new Map([...currentSourceFiles].sort((a, b) => a[0] - b[0]));

  let activeSourceFiles = new Map(currentSourceFiles);
  let bitNodeBooleanOptions = {
    restrictHomePCUpgrade: false,
    disableGang: false,
    disableCorporation: false,
    disableBladeburner: false,
    disable4SData: false,
    disableHacknetServer: false,
    disableSleeveExpAndAugmentation: false,
  };
  const callbacks = {
    setSourceFileLevel: (sfNumber: number, sfLevel: number) => {
      if (sfLevel > 0) {
        activeSourceFiles.set(sfNumber, sfLevel);
      } else {
        activeSourceFiles.delete(sfNumber);
      }
    },
    setBooleanOption: (key: keyof BitNodeBooleanOptions, value: boolean) => {
      if (!(key in bitNodeBooleanOptions)) {
        throw new Error(`Invalid key of booleanOptions: ${key}`);
      }
      bitNodeBooleanOptions[key] = value;
    },
    resetAll: () => {
      activeSourceFiles = new Map(currentSourceFiles);
      bitNodeBooleanOptions = {
        restrictHomePCUpgrade: false,
        disableGang: false,
        disableCorporation: false,
        disableBladeburner: false,
        disable4SData: false,
        disableHacknetServer: false,
        disableSleeveExpAndAugmentation: false,
      };
    },
  };

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography variant="h4">
        BitNode-{props.n}: {bitNode.name}
      </Typography>
      <br />
      <Typography>
        Source-File Level: {props.level} / {maxSourceFileLevel}
      </Typography>
      <br />
      <br />
      <Typography> Difficulty: {["easy", "normal", "hard"][bitNode.difficulty]}</Typography>
      <br />
      <br />
      <Typography>{bitNode.info}</Typography>
      <BitnodeMultiplierDescription n={props.n} level={newLevel} />
      <br />
      <BitNodeAdvancedOptions
        targetBitNode={props.n}
        currentSourceFiles={currentSourceFiles}
        callbacks={callbacks}
      ></BitNodeAdvancedOptions>
      <br />
      <Button
        aria-label={`enter-bitnode-${bitNode.number.toString()}`}
        autoFocus={true}
        onClick={() => {
          const bitNodeOptions = {
            activeSourceFiles: activeSourceFiles,
            ...bitNodeBooleanOptions,
          };
          enterBitNode(props.flume, props.destroyedBitNode, props.n, bitNodeOptions);
          props.onClose();
        }}
      >
        Enter BN{props.n}.{newLevel}
      </Button>
    </Modal>
  );
}
