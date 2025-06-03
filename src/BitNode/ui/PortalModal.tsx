import React from "react";

import { Player } from "@player";
import { type BitNodeBooleanOptions } from "@nsdefs";
import { enterBitNode } from "../../RedPill";
import { BitNodes } from "../BitNode";
import { Modal } from "../../ui/React/Modal";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { BitNodeMultiplierDescription } from "./BitnodeMultipliersDescription";
import { BitNodeAdvancedOptions } from "./BitNodeAdvancedOptions";
import { JSONMap } from "../../Types/Jsonable";

interface IProps {
  open: boolean;
  onClose: () => void;
  n: number;
  level: number;
  destroyedBitNode: number;
  flume: boolean;
}

export function PortalModal(props: IProps): React.ReactElement {
  const [sourceFileOverrides, setSourceFileOverrides] = React.useState<JSONMap<number, number>>(new JSONMap());
  const [intelligenceOverride, setIntelligenceOverride] = React.useState<number | undefined>();
  const [bitNodeBooleanOptions, setBitNodeBooleanOptions] = React.useState<BitNodeBooleanOptions>({
    restrictHomePCUpgrade: false,
    disableGang: false,
    disableCorporation: false,
    disableBladeburner: false,
    disable4SData: false,
    disableHacknetServer: false,
    disableSleeveExpAndAugmentation: false,
  });

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

  const callbacks = {
    setSfOverrides: (value: JSONMap<number, number>) => {
      setSourceFileOverrides(value);
    },
    setSfActiveLevel: (sfNumber: number, sfLevel: number) => {
      setSourceFileOverrides((old) => {
        const newValue = new JSONMap(old);
        newValue.set(sfNumber, sfLevel);
        return newValue;
      });
    },
    setIntelligenceOverride: (value: number | undefined) => {
      setIntelligenceOverride(value);
    },
    setBooleanOption: (key: keyof BitNodeBooleanOptions, value: boolean) => {
      if (!(key in bitNodeBooleanOptions)) {
        throw new Error(`Invalid key of booleanOptions: ${key}`);
      }
      setBitNodeBooleanOptions((old) => {
        return {
          ...old,
          [key]: value,
        };
      });
    },
  };

  function onClose() {
    setSourceFileOverrides(new JSONMap());
    setIntelligenceOverride(undefined);
    setBitNodeBooleanOptions({
      restrictHomePCUpgrade: false,
      disableGang: false,
      disableCorporation: false,
      disableBladeburner: false,
      disable4SData: false,
      disableHacknetServer: false,
      disableSleeveExpAndAugmentation: false,
    });
    props.onClose();
  }

  return (
    <Modal open={props.open} onClose={onClose}>
      <Typography variant="h4">
        BitNode-{props.n}: {bitNode.name}
      </Typography>
      <Typography variant="h5">{bitNode.tagline}</Typography>
      <br />
      <Typography>
        Source-File Level: {props.level} / {maxSourceFileLevel}
      </Typography>
      <br />
      <Typography> Difficulty: {["easy", "normal", "hard"][bitNode.difficulty]}</Typography>
      <br />
      <br />
      <Typography component="div">{bitNode.info}</Typography>
      <BitNodeMultiplierDescription n={props.n} level={newLevel} hideMultsIfCannotAccessFeature={false} />
      <BitNodeAdvancedOptions
        targetBitNode={props.n}
        currentSourceFiles={currentSourceFiles}
        sourceFileOverrides={sourceFileOverrides}
        intelligenceOverride={intelligenceOverride}
        bitNodeBooleanOptions={bitNodeBooleanOptions}
        callbacks={callbacks}
      ></BitNodeAdvancedOptions>
      <br />
      <Button
        aria-label={`enter-bitnode-${bitNode.number.toString()}`}
        autoFocus={true}
        onClick={() => {
          const bitNodeOptions = {
            sourceFileOverrides,
            intelligenceOverride,
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
