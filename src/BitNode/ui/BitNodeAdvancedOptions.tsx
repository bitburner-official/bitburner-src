import { type BitNodeBooleanOptions } from "@nsdefs";
import React from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Collapse,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { OptionSwitch } from "../../ui/React/OptionSwitch";
import { ButtonWithTooltip } from "../../ui/Components/ButtonWithTooltip";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { JSONMap } from "../../Types/Jsonable";

interface SourceFileButtonRowProps {
  sfOverrides: JSONMap<number, number>;
  sfNumber: number;
  sfLevel: number;
  callbacks: BitNodeAdvancedOptionsProps["callbacks"];
}

function SourceFileButtonRow({
  sfOverrides,
  sfNumber,
  sfLevel,
  callbacks,
}: SourceFileButtonRowProps): React.ReactElement {
  const [activeLevel, setActiveLevel] = React.useState<number>(sfLevel);
  const [inputValue, setInputValue] = React.useState<string>(sfLevel.toString());

  React.useEffect(() => {
    const sfActiveLevel = sfOverrides.get(sfNumber) ?? 0;
    setInputValue(sfActiveLevel.toString());
    setActiveLevel(sfActiveLevel);
    callbacks.setSfActiveLevel(sfNumber, sfActiveLevel);
  }, [sfOverrides, sfNumber, callbacks]);

  const title = `SF-${sfNumber}`;
  const sourceFileLevelTool =
    sfNumber !== 12 ? (
      Array.from([0, 1, 2, 3]).map((level) => (
        <ButtonWithTooltip
          key={level}
          onClick={() => {
            setActiveLevel(level);
            callbacks.setSfActiveLevel(sfNumber, level);
          }}
          disabledTooltip={sfLevel < level ? "You have not unlocked this Source-File level" : ""}
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
            setActiveLevel(0);
            callbacks.setSfActiveLevel(sfNumber, 0);
            return;
          }
          const level = Number.parseInt(event.target.value);
          if (!Number.isFinite(level) || level < 0 || level > sfLevel) {
            return;
          }
          setInputValue(level.toString());
          setActiveLevel(level);
          callbacks.setSfActiveLevel(sfNumber, level);
        }}
      ></TextField>
    );

  return (
    <tr>
      <td>
        <Typography>{title}</Typography>
      </td>
      <td>
        <ButtonGroup>{sourceFileLevelTool}</ButtonGroup>
      </td>
      <td>
        <Typography marginLeft="1rem">Level: {sfLevel}</Typography>
      </td>
      <td>
        <Typography marginLeft="1rem">Active level: {activeLevel}</Typography>
      </td>
    </tr>
  );
}

export function SourceFileOverrides({
  currentSourceFiles,
  callbacks,
  getSfLevel,
}: {
  currentSourceFiles: BitNodeAdvancedOptionsProps["currentSourceFiles"];
  callbacks: BitNodeAdvancedOptionsProps["callbacks"];
  getSfLevel: (sfNumber: number) => number;
}): React.ReactElement {
  const [sfOverrides, setSfOverrides] = React.useState<JSONMap<number, number>>(new JSONMap());
  const [selectElementValue, setSelectElementValue] = React.useState<number | null>(
    currentSourceFiles.size > 0 ? [...currentSourceFiles.keys()][0] : null,
  );
  const getMenuItemList = (data: typeof sfOverrides): number[] => {
    return [...currentSourceFiles.keys()].filter((sfNumber) => ![...data.keys()].includes(sfNumber));
  };
  const menuItemList = getMenuItemList(sfOverrides);

  const basicNote = `Changing the active level of a SF is temporary; you still permanently own that SF level. For example, if
  you enter BN 1.3 while having SF 1.2 but with the active level set to 0, you will not get the bonuses from SF
  1.1 or SF 1.2, but you will still earn SF 1.3 when destroying the BN.`;
  const note = currentSourceFiles.has(10) ? (
    <>
      <Typography>Note:</Typography>
      <ul style={{ marginTop: 0 }}>
        <li>{basicNote}</li>
        <li>
          Changing the active level of SF 10 does not affect your current sleeves or the maximum number of sleeves
        </li>
      </ul>
    </>
  ) : (
    <>
      <Typography>Note: {basicNote}</Typography>
      <br />
    </>
  );

  return (
    <>
      <Typography>Override active level of Source-File:</Typography>
      <br />
      <Typography component="div">{note}</Typography>
      <div>
        <Select
          disabled={menuItemList.length === 0}
          value={selectElementValue ?? ""}
          onChange={(event) => {
            setSelectElementValue(Number(event.target.value));
          }}
          sx={{ minWidth: "80px" }}
        >
          {menuItemList.map((sfNumber) => (
            <MenuItem key={sfNumber} value={sfNumber}>
              SF-{sfNumber}
            </MenuItem>
          ))}
        </Select>
        <Button
          disabled={menuItemList.length === 0}
          onClick={() => {
            if (!selectElementValue) {
              return;
            }
            setSfOverrides((old) => {
              const newSfOverrides = new JSONMap(old);
              newSfOverrides.set(selectElementValue, getSfLevel(selectElementValue));
              const newMenuItemList = getMenuItemList(newSfOverrides);
              if (newMenuItemList.length > 0) {
                setSelectElementValue(newMenuItemList[0]);
              } else {
                setSelectElementValue(null);
              }
              return newSfOverrides;
            });
          }}
          sx={{ marginLeft: "1rem" }}
        >
          Add
        </Button>
      </div>
      {sfOverrides.size > 0 && (
        <>
          <br />
          <table>
            <tbody>
              <tr>
                <td>
                  <Typography minWidth="7rem">Set all SF</Typography>
                </td>
                <td>
                  <ButtonGroup>
                    {Array.from([0, 1, 2, 3]).map((level) => (
                      <ButtonWithTooltip
                        key={level}
                        onClick={() => {
                          setSfOverrides((old) => {
                            const newSfOverrides = new JSONMap(old);
                            for (const [sfNumber] of newSfOverrides) {
                              newSfOverrides.set(sfNumber, Math.min(level, getSfLevel(sfNumber)));
                            }
                            return newSfOverrides;
                          });
                        }}
                        buttonProps={{ sx: { marginRight: "0.5rem" } }}
                      >
                        {level}
                      </ButtonWithTooltip>
                    ))}
                  </ButtonGroup>
                </td>
              </tr>
              {[...sfOverrides.keys()].map((sfNumber) => (
                <SourceFileButtonRow
                  key={sfNumber}
                  sfOverrides={sfOverrides}
                  sfNumber={sfNumber}
                  sfLevel={getSfLevel(sfNumber)}
                  callbacks={callbacks}
                ></SourceFileButtonRow>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  );
}

interface BitNodeAdvancedOptionsProps {
  targetBitNode: number;
  currentSourceFiles: Map<number, number>;
  callbacks: {
    setSfActiveLevel: (sfNumber: number, sfLevel: number) => void;
    setBooleanOption: (key: keyof BitNodeBooleanOptions, value: boolean) => void;
    resetAll: () => void;
  };
}

export function BitNodeAdvancedOptions({
  targetBitNode,
  currentSourceFiles,
  callbacks,
}: BitNodeAdvancedOptionsProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const getSfLevel = React.useCallback(
    (sfNumber: number): number => {
      return currentSourceFiles.get(sfNumber) ?? 0;
    },
    [currentSourceFiles],
  );

  return (
    <Box component={Paper} sx={{ mt: 1, p: 1 }}>
      <ListItemButton disableGutters onClick={() => setOpen((old) => !old)}>
        <ListItemText primary={<Typography variant="h6">Advanced options</Typography>} />
        {open ? <ExpandLess color="primary" /> : <ExpandMore color="primary" />}
      </ListItemButton>
      <Collapse in={open}>
        <Box sx={{ padding: "0 1rem" }}>
          <OptionSwitch
            checked={false}
            onChange={(value) => {
              callbacks.setBooleanOption("restrictHomePCUpgrade", value);
            }}
            text="Restrict Home PC upgrade"
            tooltip={<>Max RAM: 128GB. Max core: 1.</>}
          />
          <OptionSwitch
            disabled={getSfLevel(2) === 0 && targetBitNode !== 2}
            checked={false}
            onChange={(value) => {
              callbacks.setBooleanOption("disableGang", value);
            }}
            text="Disable Gang"
            tooltip={<>Disable Gang</>}
          />
          <OptionSwitch
            disabled={getSfLevel(3) === 0 && targetBitNode !== 3}
            checked={false}
            onChange={(value) => {
              callbacks.setBooleanOption("disableCorporation", value);
            }}
            text="Disable Corporation"
            tooltip={<>Disable Corporation</>}
          />
          <OptionSwitch
            disabled={getSfLevel(6) === 0 && getSfLevel(7) === 0 && targetBitNode !== 6 && targetBitNode !== 7}
            checked={false}
            onChange={(value) => {
              callbacks.setBooleanOption("disableBladeburner", value);
            }}
            text="Disable Bladeburner"
            tooltip={<>Disable Bladeburner</>}
          />
          <OptionSwitch
            checked={false}
            onChange={(value) => {
              callbacks.setBooleanOption("disable4SData", value);
            }}
            text="Disable 4S Market Data"
            tooltip={<>Disable 4S Market Data</>}
          />
          <OptionSwitch
            disabled={getSfLevel(9) === 0 && targetBitNode !== 9}
            checked={false}
            onChange={(value) => {
              callbacks.setBooleanOption("disableHacknetServer", value);
            }}
            text="Disable Hacknet Server"
            tooltip={<>Disable Hacknet Server</>}
          />
          <OptionSwitch
            disabled={getSfLevel(10) === 0 && targetBitNode !== 10}
            checked={false}
            onChange={(value) => {
              callbacks.setBooleanOption("disableSleeveExpAndAugmentation", value);
            }}
            text="Disable Sleeves' experience and augmentation"
            tooltip={<>Sleeves cannot gain experience or install augmentations</>}
          />
          <br />
          <SourceFileOverrides
            currentSourceFiles={currentSourceFiles}
            callbacks={callbacks}
            getSfLevel={getSfLevel}
          ></SourceFileOverrides>
        </Box>
      </Collapse>
    </Box>
  );
}
