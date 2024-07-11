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
  Tooltip,
  Typography,
} from "@mui/material";
import { OptionSwitch } from "../../ui/React/OptionSwitch";
import { ButtonWithTooltip } from "../../ui/Components/ButtonWithTooltip";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { JSONMap } from "../../Types/Jsonable";
import { Settings } from "../../Settings/Settings";
import { Player } from "@player";

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
      [...Array(sfLevel + 1).keys()].map((level) => (
        <Button
          key={level}
          onClick={() => {
            setActiveLevel(level);
            callbacks.setSfActiveLevel(sfNumber, level);
          }}
          sx={{
            marginRight: "0.5rem !important",
            border: level === activeLevel ? `1px solid ${Settings.theme.info}` : "",
          }}
        >
          {level}
        </Button>
      ))
    ) : (
      // The usage of TextField instead of NumberInput is intentional.
      <TextField
        sx={{ maxWidth: "12rem" }}
        value={inputValue}
        onChange={(event) => {
          if (event.target.value === "") {
            setInputValue("0");
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
  const extraInfo =
    sfNumber === 12 ? (
      <td>
        <Typography marginLeft="1rem">Max level: {sfLevel}</Typography>
      </td>
    ) : null;

  return (
    <tr>
      <td>
        <Typography>{title}</Typography>
      </td>
      <td>
        <ButtonGroup>{sourceFileLevelTool}</ButtonGroup>
      </td>
      {extraInfo}
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
  const firstSourceFile = React.useMemo(
    () => (currentSourceFiles.size > 0 ? [...currentSourceFiles.keys()][0] : null),
    [currentSourceFiles],
  );
  const [selectElementValue, setSelectElementValue] = React.useState<number | null>(firstSourceFile);
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
          Changing the active level of SF 10 does not affect your current sleeves or the maximum number of sleeves.
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
        <ButtonWithTooltip
          normalTooltip="Remove all overridden SF"
          disabledTooltip={sfOverrides.size === 0 ? "No overridden SF" : ""}
          onClick={() => {
            setSfOverrides(new JSONMap());
            setSelectElementValue(firstSourceFile);
            callbacks.resetSourceFileOverrides();
          }}
          buttonProps={{ sx: { marginLeft: "1rem" } }}
        >
          Remove all
        </ButtonWithTooltip>
      </div>
      <br />
      {sfOverrides.size > 0 && (
        <>
          <table>
            <tbody>
              <tr>
                <td>
                  <Tooltip title="Set active level for all chosen SF">
                    <Typography minWidth="7rem">Set all SF</Typography>
                  </Tooltip>
                </td>
                <td>
                  <ButtonGroup>
                    {[0, 1, 2, 3].map((level) => (
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
          <br />
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
    setIntelligenceOverride: (value: number | undefined) => void;
    setBooleanOption: (key: keyof BitNodeBooleanOptions, value: boolean) => void;
    resetSourceFileOverrides: () => void;
    resetAll: () => void;
  };
}

export function BitNodeAdvancedOptions({
  targetBitNode,
  currentSourceFiles,
  callbacks,
}: BitNodeAdvancedOptionsProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [intelligenceOverride, setIntelligenceOverride] = React.useState<string>("");
  const getSfLevel = React.useCallback(
    (sfNumber: number): number => {
      return currentSourceFiles.get(sfNumber) ?? 0;
    },
    [currentSourceFiles],
  );
  const intelligenceOverrideTool = (
    <>
      <Typography component="div" display="flex" gap="1rem">
        <Typography display="flex" alignItems="center">
          Override Intelligence:
        </Typography>
        <TextField
          sx={{ maxWidth: "4rem" }}
          disabled={intelligenceOverride === ""}
          value={intelligenceOverride}
          onChange={(event) => {
            if (event.target.value === "") {
              setIntelligenceOverride("0");
              callbacks.setIntelligenceOverride(0);
              return;
            }
            const value = Number.parseInt(event.target.value);
            if (!Number.isInteger(value) || value < 0) {
              return;
            }
            setIntelligenceOverride(value.toString());
            callbacks.setIntelligenceOverride(value);
          }}
        ></TextField>
      </Typography>
    </>
  );

  return (
    <Box component={Paper} sx={{ mt: 1, p: 1 }}>
      <ListItemButton disableGutters onClick={() => setOpen((old) => !old)} sx={{ padding: "4px 8px" }}>
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
            text="Restrict max RAM and core of Home PC"
            tooltip="The home computer's maximum RAM and number of cores are lower than normal. Max RAM: 128GB. Max core: 1."
          />
          <OptionSwitch
            disabled={getSfLevel(2) === 0 && targetBitNode !== 2}
            checked={false}
            onChange={(value) => {
              callbacks.setBooleanOption("disableGang", value);
            }}
            text="Disable Gang"
            tooltip="Disable Gang"
          />
          <OptionSwitch
            disabled={getSfLevel(3) === 0 && targetBitNode !== 3}
            checked={false}
            onChange={(value) => {
              callbacks.setBooleanOption("disableCorporation", value);
            }}
            text="Disable Corporation"
            tooltip="Disable Corporation"
          />
          <OptionSwitch
            disabled={getSfLevel(6) === 0 && getSfLevel(7) === 0 && targetBitNode !== 6 && targetBitNode !== 7}
            checked={false}
            onChange={(value) => {
              callbacks.setBooleanOption("disableBladeburner", value);
            }}
            text="Disable Bladeburner"
            tooltip="Disable Bladeburner"
          />
          <OptionSwitch
            checked={false}
            onChange={(value) => {
              callbacks.setBooleanOption("disable4SData", value);
            }}
            text="Disable 4S Market Data"
            tooltip="Disable 4S Market Data"
          />
          <OptionSwitch
            disabled={getSfLevel(9) === 0 && targetBitNode !== 9}
            checked={false}
            onChange={(value) => {
              callbacks.setBooleanOption("disableHacknetServer", value);
            }}
            text="Disable Hacknet Server"
            tooltip="Hacknet Node is re-enabled in place of Hacknet Server."
          />
          <OptionSwitch
            disabled={getSfLevel(10) === 0 && targetBitNode !== 10}
            checked={false}
            onChange={(value) => {
              callbacks.setBooleanOption("disableSleeveExpAndAugmentation", value);
            }}
            text="Disable Sleeves' experience and augmentation"
            tooltip="Sleeves cannot gain experience or install augmentations"
          />
          <OptionSwitch
            disabled={Player.skills.intelligence <= 0}
            checked={false}
            onChange={(value) => {
              if (!value) {
                setIntelligenceOverride("");
                callbacks.setIntelligenceOverride(undefined);
                return;
              }
              setIntelligenceOverride(Player.skills.intelligence.toString());
              callbacks.setIntelligenceOverride(Player.skills.intelligence);
            }}
            text={intelligenceOverrideTool}
            tooltip={
              <>
                <Typography component="div">
                  The Intelligence bonuses for you and your Sleeves will be limited by this value. For example:
                  <ul>
                    <li>
                      If your Intelligence is 1000 and you set this value to 500, the "effective" Intelligence, which is
                      used for bonus calculation, is only 500.
                    </li>
                    <li>
                      If a Sleeve's Intelligence is 200 and you set this value to 500, the "effective" Intelligence,
                      which is used for bonus calculation, is still 200.
                    </li>
                  </ul>
                </Typography>
                <Typography>
                  You will still gain Intelligence experience as normal. Intelligence Override only affects the
                  Intelligence bonus. You can hover your mouse over the Intelligence stat in the character overview to
                  see the overridden value.
                </Typography>
                <br />
                <Typography>Intelligence Override must be a non-negative integer.</Typography>
              </>
            }
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
