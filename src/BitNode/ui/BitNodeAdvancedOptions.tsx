import { type BitNodeBooleanOptions } from "@nsdefs";
import React from "react";
import {
  Box,
  Button,
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
  sfNumber: number;
  sfLevel: number;
  sfActiveLevel: number;
  callbacks: BitNodeAdvancedOptionsProps["callbacks"];
}

function SourceFileButtonRow({
  sfNumber,
  sfLevel,
  sfActiveLevel,
  callbacks,
}: SourceFileButtonRowProps): React.ReactElement {
  const title = `SF-${sfNumber}`;
  const sourceFileLevelTool =
    sfNumber !== 12 ? (
      [...Array(sfLevel + 1).keys()].map((level) => (
        <Button
          key={level}
          onClick={() => {
            callbacks.setSfActiveLevel(sfNumber, level);
          }}
          sx={{
            marginRight: "0.5rem !important",
            border: level === sfActiveLevel ? `1px solid ${Settings.theme.info}` : "",
            minWidth: "40px",
          }}
        >
          {level}
        </Button>
      ))
    ) : (
      // The usage of TextField instead of NumberInput is intentional.
      <TextField
        sx={{ maxWidth: "185px" }}
        value={sfActiveLevel}
        onChange={(event) => {
          // Empty string will be automatically changed to "0".
          if (event.target.value === "") {
            callbacks.setSfActiveLevel(sfNumber, 0);
            return;
          }
          const level = Number.parseInt(event.target.value);
          if (!Number.isFinite(level) || level < 0 || level > sfLevel) {
            return;
          }
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
      <td>{sourceFileLevelTool}</td>
      {extraInfo}
    </tr>
  );
}

function SourceFileOverrides({
  currentSourceFiles,
  sourceFileOverrides,
  callbacks,
  getSfLevel,
}: {
  currentSourceFiles: BitNodeAdvancedOptionsProps["currentSourceFiles"];
  sourceFileOverrides: BitNodeAdvancedOptionsProps["sourceFileOverrides"];
  callbacks: BitNodeAdvancedOptionsProps["callbacks"];
  getSfLevel: (sfNumber: number) => number;
}): React.ReactElement {
  const firstSourceFile = React.useMemo(
    () => (currentSourceFiles.size > 0 ? [...currentSourceFiles.keys()][0] : null),
    [currentSourceFiles],
  );
  const [selectElementValue, setSelectElementValue] = React.useState<number | null>(firstSourceFile);
  const getMenuItemList = (data: typeof sourceFileOverrides): number[] => {
    return [...currentSourceFiles.keys()].filter((sfNumber) => ![...data.keys()].includes(sfNumber));
  };
  const menuItemList = getMenuItemList(sourceFileOverrides);

  React.useEffect(() => {
    if (sourceFileOverrides.size === 0) {
      setSelectElementValue(firstSourceFile);
    }
  }, [sourceFileOverrides, firstSourceFile]);

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
            const newSfOverrides = new JSONMap(sourceFileOverrides);
            newSfOverrides.set(selectElementValue, getSfLevel(selectElementValue));
            const newMenuItemList = getMenuItemList(newSfOverrides);
            if (newMenuItemList.length > 0) {
              setSelectElementValue(newMenuItemList[0]);
            } else {
              setSelectElementValue(null);
            }
            callbacks.setSfOverrides(newSfOverrides);
          }}
          sx={{ marginLeft: "1rem" }}
        >
          Add
        </Button>
        <ButtonWithTooltip
          normalTooltip="Remove all overridden SF"
          disabledTooltip={sourceFileOverrides.size === 0 ? "No overridden SF" : ""}
          onClick={() => {
            callbacks.setSfOverrides(new JSONMap());
          }}
          buttonProps={{ sx: { marginLeft: "1rem" } }}
        >
          Remove all
        </ButtonWithTooltip>
      </div>
      <br />
      {sourceFileOverrides.size > 0 && (
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
                  {[0, 1, 2, 3].map((level) => (
                    <ButtonWithTooltip
                      key={level}
                      onClick={() => {
                        const newSfOverrides = new JSONMap(sourceFileOverrides);
                        for (const [sfNumber] of newSfOverrides) {
                          newSfOverrides.set(sfNumber, Math.min(level, getSfLevel(sfNumber)));
                        }
                        callbacks.setSfOverrides(newSfOverrides);
                      }}
                      buttonProps={{ sx: { marginRight: "0.5rem", minWidth: "40px" } }}
                    >
                      {level}
                    </ButtonWithTooltip>
                  ))}
                </td>
              </tr>
              {[...sourceFileOverrides.keys()].map((sfNumber) => (
                <SourceFileButtonRow
                  key={sfNumber}
                  sfNumber={sfNumber}
                  sfLevel={getSfLevel(sfNumber)}
                  sfActiveLevel={sourceFileOverrides.get(sfNumber) ?? 0}
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

function IntelligenceOverride({
  intelligenceOverride,
  callbacks,
}: {
  intelligenceOverride: BitNodeAdvancedOptionsProps["intelligenceOverride"];
  callbacks: BitNodeAdvancedOptionsProps["callbacks"];
}): React.ReactElement {
  const [enabled, setEnabled] = React.useState<boolean>(false);
  const [lastValueOfIntelligenceOverride, setLastValueOfIntelligenceOverride] = React.useState<number | undefined>(
    Player.skills.intelligence,
  );
  return (
    <OptionSwitch
      disabled={Player.skills.intelligence <= 0}
      checked={false}
      onChange={(value) => {
        setEnabled(value);
        if (!value) {
          // If this option is disabled, save last value and reset data.
          setLastValueOfIntelligenceOverride(intelligenceOverride);
          callbacks.setIntelligenceOverride(undefined);
          return;
        } else {
          // If this option is enabled, load last value.
          callbacks.setIntelligenceOverride(lastValueOfIntelligenceOverride);
        }
      }}
      text={
        <>
          <Typography component="div" display="flex" gap="1rem">
            <Typography display="flex" alignItems="center">
              Override Intelligence:
            </Typography>
            <TextField
              sx={{ maxWidth: "4rem" }}
              disabled={!enabled}
              value={intelligenceOverride !== undefined ? intelligenceOverride : ""}
              onChange={(event) => {
                // Empty string will be automatically changed to "0".
                if (event.target.value === "") {
                  callbacks.setIntelligenceOverride(0);
                  return;
                }
                const value = Number.parseInt(event.target.value);
                if (!Number.isInteger(value) || value < 0) {
                  return;
                }
                callbacks.setIntelligenceOverride(value);
              }}
            ></TextField>
          </Typography>
        </>
      }
      tooltip={
        <>
          <Typography component="div">
            The Intelligence bonuses for you and your Sleeves will be limited by this value. For example:
            <ul>
              <li>
                If your Intelligence is 1000 and you set this value to 500, the "effective" Intelligence, which is used
                for bonus calculation, is only 500.
              </li>
              <li>
                If a Sleeve's Intelligence is 200 and you set this value to 500, the "effective" Intelligence, which is
                used for bonus calculation, is still 200.
              </li>
            </ul>
          </Typography>
          <Typography>
            You will still gain Intelligence experience as normal. Intelligence Override only affects the Intelligence
            bonus.
          </Typography>
          <br />
          <Typography>
            The "effective" Intelligence will be shown in the character overview. If the effective value is different
            from the original value, you can hover your mouse over it to see the original value.
          </Typography>
        </>
      }
    />
  );
}

interface BitNodeAdvancedOptionsProps {
  targetBitNode: number;
  currentSourceFiles: Map<number, number>;
  sourceFileOverrides: JSONMap<number, number>;
  intelligenceOverride: number | undefined;
  bitNodeBooleanOptions: BitNodeBooleanOptions;
  callbacks: {
    setSfOverrides: (value: JSONMap<number, number>) => void;
    setSfActiveLevel: (sfNumber: number, sfLevel: number) => void;
    setIntelligenceOverride: (value: number | undefined) => void;
    setBooleanOption: (key: keyof BitNodeBooleanOptions, value: boolean) => void;
  };
}

export function BitNodeAdvancedOptions({
  targetBitNode,
  currentSourceFiles,
  sourceFileOverrides,
  intelligenceOverride,
  bitNodeBooleanOptions,
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
      <ListItemButton disableGutters onClick={() => setOpen((old) => !old)} sx={{ padding: "4px 8px" }}>
        <ListItemText primary={<Typography variant="h6">Advanced options</Typography>} />
        {open ? <ExpandLess color="primary" /> : <ExpandMore color="primary" />}
      </ListItemButton>
      <Collapse in={open}>
        <Box sx={{ padding: "0 1rem" }}>
          <Typography>
            These options enable unique gameplay that is intended for experienced players. If you are a new player, you
            can safely ignore these options and come back to try them later.
          </Typography>
          <br />
          <OptionSwitch
            checked={bitNodeBooleanOptions.restrictHomePCUpgrade}
            onChange={(value) => {
              callbacks.setBooleanOption("restrictHomePCUpgrade", value);
            }}
            text="Restrict max RAM and core of Home PC"
            tooltip="The home computer's maximum RAM and number of cores are lower than normal. Max RAM: 128GB. Max core: 1."
          />
          <OptionSwitch
            disabled={getSfLevel(2) === 0 && targetBitNode !== 2}
            checked={bitNodeBooleanOptions.disableGang}
            onChange={(value) => {
              callbacks.setBooleanOption("disableGang", value);
            }}
            text="Disable Gang"
            tooltip="Disable Gang, regardless of BitNode and SF level"
          />
          <OptionSwitch
            disabled={getSfLevel(3) === 0 && targetBitNode !== 3}
            checked={bitNodeBooleanOptions.disableCorporation}
            onChange={(value) => {
              callbacks.setBooleanOption("disableCorporation", value);
            }}
            text="Disable Corporation"
            tooltip="Disable Corporation, regardless of BitNode and SF level"
          />
          <OptionSwitch
            disabled={getSfLevel(6) === 0 && getSfLevel(7) === 0 && targetBitNode !== 6 && targetBitNode !== 7}
            checked={bitNodeBooleanOptions.disableBladeburner}
            onChange={(value) => {
              callbacks.setBooleanOption("disableBladeburner", value);
            }}
            text="Disable Bladeburner"
            tooltip="Disable Bladeburner, regardless of BitNode and SF level"
          />
          <OptionSwitch
            checked={bitNodeBooleanOptions.disable4SData}
            onChange={(value) => {
              callbacks.setBooleanOption("disable4SData", value);
            }}
            text="Disable 4S Market Data"
            tooltip="Disable 4S Market Data, regardless of BitNode and SF level"
          />
          <OptionSwitch
            disabled={getSfLevel(9) === 0 && targetBitNode !== 9}
            checked={bitNodeBooleanOptions.disableHacknetServer}
            onChange={(value) => {
              callbacks.setBooleanOption("disableHacknetServer", value);
            }}
            text="Disable Hacknet Server"
            tooltip="Disable Hacknet Server, regardless of BitNode and SF level. Hacknet Node is re-enabled in place of Hacknet Server."
          />
          <OptionSwitch
            disabled={getSfLevel(10) === 0 && targetBitNode !== 10}
            checked={bitNodeBooleanOptions.disableSleeveExpAndAugmentation}
            onChange={(value) => {
              callbacks.setBooleanOption("disableSleeveExpAndAugmentation", value);
            }}
            text="Disable Sleeves' experience and augmentation"
            tooltip="Sleeves cannot gain experience or install augmentations"
          />
          <IntelligenceOverride
            intelligenceOverride={intelligenceOverride}
            callbacks={callbacks}
          ></IntelligenceOverride>
          <br />
          <SourceFileOverrides
            currentSourceFiles={currentSourceFiles}
            sourceFileOverrides={sourceFileOverrides}
            callbacks={callbacks}
            getSfLevel={getSfLevel}
          ></SourceFileOverrides>
        </Box>
      </Collapse>
    </Box>
  );
}
