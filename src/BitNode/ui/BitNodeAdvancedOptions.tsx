import { type BitNodeBooleanOptions } from "@nsdefs";
import React from "react";
import { Box, ButtonGroup, Collapse, Paper, TextField, Typography } from "@mui/material";
import { OptionSwitch } from "../../ui/React/OptionSwitch";
import { ButtonWithTooltip } from "../../ui/Components/ButtonWithTooltip";

interface SourceFileButtonRowProps {
  sourceFileNumber: number;
  sourceFileLevel: number;
  callbacks: BitNodeAdvancedOptionsProps["callbacks"];
}

function SourceFileButtonRow({
  sourceFileNumber,
  sourceFileLevel,
  callbacks,
}: SourceFileButtonRowProps): React.ReactElement {
  const [sfLevel, setSfLevel] = React.useState<number>(sourceFileLevel);
  const [inputValue, setInputValue] = React.useState<string>(sourceFileLevel.toString());

  const title = `SF-${sourceFileNumber}`;
  const sourceFileLevelTool =
    sourceFileNumber !== 12 ? (
      Array.from([0, 1, 2, 3]).map((level) => (
        <ButtonWithTooltip
          key={level}
          onClick={() => {
            setSfLevel(level);
            callbacks.setSourceFileLevel(sourceFileNumber, level);
          }}
          disabledTooltip={sourceFileLevel < level ? "You have not unlocked this Source-File level" : ""}
          buttonProps={{ sx: { marginRight: "0.5rem" } }}
        >
          {level}
        </ButtonWithTooltip>
      ))
    ) : (
      // The usage of TextField instead of NumberInput is intentional.
      <TextField
        sx={{ maxWidth: "11.5rem" }}
        value={inputValue}
        onChange={(event) => {
          if (event.target.value === "") {
            setInputValue("");
            return;
          }
          const level = Number.parseInt(event.target.value);
          if (!Number.isFinite(level) || level < 0 || level > sourceFileLevel) {
            return;
          }
          setSfLevel(level);
          setInputValue(level.toString());
          callbacks.setSourceFileLevel(sourceFileNumber, level);
        }}
      ></TextField>
    );
  let extraInfo = `Level: ${sfLevel}`;
  if (sourceFileNumber === 10) {
    extraInfo += ` (Changing the active level of SF10 does not affect your current sleeves or the maximum number of sleeves)`;
  }
  if (sourceFileNumber === 12) {
    extraInfo += ` (Max: ${sourceFileLevel})`;
  }

  return (
    <tr>
      <td>
        <Typography minWidth="5rem">{title}</Typography>
      </td>
      <td>
        <ButtonGroup>{sourceFileLevelTool}</ButtonGroup>
      </td>
      <td>
        <Typography marginLeft="1rem">{extraInfo}</Typography>
      </td>
    </tr>
  );
}

interface BitNodeAdvancedOptionsProps {
  targetBitNode: number;
  currentSourceFiles: Map<number, number>;
  callbacks: {
    setSourceFileLevel: (sfNumber: number, sfLevel: number) => void;
    setBooleanOption: (key: keyof BitNodeBooleanOptions, value: boolean) => void;
    resetAll: () => void;
  };
}

export function BitNodeAdvancedOptions({
  targetBitNode,
  currentSourceFiles,
  callbacks,
}: BitNodeAdvancedOptionsProps): React.ReactElement {
  const [checked, setChecked] = React.useState(false);
  const [key, setKey] = React.useState(Date.now());
  const getSourceFileLevel = (sfNumber: number) => {
    return currentSourceFiles.get(sfNumber) ?? 0;
  };
  return (
    <>
      <OptionSwitch
        checked={checked}
        onChange={(value) => {
          setChecked(value);
          if (!value) {
            callbacks.resetAll();
            setKey(Date.now());
          }
        }}
        text="Use advanced options"
        tooltip={<>Use advanced options</>}
      />
      <br />
      <Collapse in={checked}>
        <Box component={Paper} sx={{ padding: "1rem" }} key={key}>
          <Typography>Set active level of Source-File:</Typography>
          <br />
          <Typography>
            Note: If you change the active level of SF, the SF's effects are affected, but you still have that SF level.
            For example, if you have SF 1.2 and enter BN 1.3 with the active level set to 0, the effects of SF 1.1 and
            1.2 are disabled, but you still have SF 1.2. When you destroy BN 1.3, your SF 1.2 will be upgraded to SF
            1.3.
          </Typography>
          <br />
          <table>
            <tbody>
              {[...currentSourceFiles].map(([sourceFileNumber]) => (
                <SourceFileButtonRow
                  key={sourceFileNumber}
                  sourceFileNumber={sourceFileNumber}
                  sourceFileLevel={getSourceFileLevel(sourceFileNumber)}
                  callbacks={callbacks}
                ></SourceFileButtonRow>
              ))}
            </tbody>
          </table>
          <br />
          <Typography>Set other options:</Typography>
          <br />
          <OptionSwitch
            checked={false}
            onChange={(value) => {
              callbacks.setBooleanOption("restrictHomePCUpgrade", value);
            }}
            text="Restrict Home PC upgrade"
            tooltip={<>Max RAM: 128GB. Max core: 1.</>}
          />
          {(getSourceFileLevel(2) > 0 || targetBitNode === 2) && (
            <OptionSwitch
              checked={false}
              onChange={(value) => {
                callbacks.setBooleanOption("disableGang", value);
              }}
              text="Disable Gang"
              tooltip={<>Disable Gang</>}
            />
          )}
          {(getSourceFileLevel(3) > 0 || targetBitNode === 3) && (
            <OptionSwitch
              checked={false}
              onChange={(value) => {
                callbacks.setBooleanOption("disableCorporation", value);
              }}
              text="Disable Corporation"
              tooltip={<>Disable Corporation</>}
            />
          )}
          {(getSourceFileLevel(6) > 0 || getSourceFileLevel(7) > 0 || targetBitNode === 6 || targetBitNode === 7) && (
            <OptionSwitch
              checked={false}
              onChange={(value) => {
                callbacks.setBooleanOption("disableBladeburner", value);
              }}
              text="Disable Bladeburner"
              tooltip={<>Disable Bladeburner</>}
            />
          )}
          <OptionSwitch
            checked={false}
            onChange={(value) => {
              callbacks.setBooleanOption("disable4SData", value);
            }}
            text="Disable 4S Market Data"
            tooltip={<>Disable 4S Market Data</>}
          />
          {(getSourceFileLevel(9) > 0 || targetBitNode === 9) && (
            <OptionSwitch
              checked={false}
              onChange={(value) => {
                callbacks.setBooleanOption("disableHacknetServer", value);
              }}
              text="Disable Hacknet Server"
              tooltip={<>Disable Hacknet Server</>}
            />
          )}
          {(getSourceFileLevel(10) > 0 || targetBitNode === 10) && (
            <>
              <OptionSwitch
                checked={false}
                onChange={(value) => {
                  callbacks.setBooleanOption("disableSleeveExpAndAugmentation", value);
                }}
                text="Disable Sleeves' experience and augmentation"
                tooltip={<>Sleeves cannot gain experience or install augmentations</>}
              />
            </>
          )}
        </Box>
      </Collapse>
    </>
  );
}
