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
        <Typography marginLeft="1rem">最大等级：{sfLevel}</Typography>
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

  const basicNote = `更改源文件的生效等级只是暂时的；你仍然永久拥有该源文件等级。例如，如果你拥有源文件
  1.2 并以生效等级 0 进入 BN 1.3，你将不会获得源文件 1.1 或源文件 1.2 的加成，但在摧毁该 BN 时仍然会获得源文件
  1.3。`;
  const note = currentSourceFiles.has(10) ? (
    <>
      <Typography>注意：</Typography>
      <ul style={{ marginTop: 0 }}>
        <li>{basicNote}</li>
        <li>
          更改源文件 10 的生效等级不会影响你当前的分身或分身的数量上限。
        </li>
      </ul>
    </>
  ) : (
    <>
      <Typography>注意：{basicNote}</Typography>
      <br />
    </>
  );

  return (
    <>
      <Typography>覆盖源文件的生效等级：</Typography>
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
          添加
        </Button>
        <ButtonWithTooltip
          normalTooltip="移除所有被覆盖的源文件"
          disabledTooltip={sourceFileOverrides.size === 0 ? "没有被覆盖的源文件" : ""}
          onClick={() => {
            callbacks.setSfOverrides(new JSONMap());
          }}
          buttonProps={{ sx: { marginLeft: "1rem" } }}
        >
          全部移除
        </ButtonWithTooltip>
      </div>
      <br />
      {sourceFileOverrides.size > 0 && (
        <>
          <table>
            <tbody>
              <tr>
                <td>
                  <Tooltip title="为所有选中的源文件设置生效等级">
                    <Typography minWidth="7rem">设置全部源文件</Typography>
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
              覆盖智力：
            </Typography>
            <TextField
              sx={{ maxWidth: "4rem" }}
              disabled={!enabled}
              value={intelligenceOverride !== undefined ? intelligenceOverride : ""}
              onChange={(event) => {
                // Empty string will be automatically changed to "1".
                if (event.target.value === "") {
                  callbacks.setIntelligenceOverride(1);
                  return;
                }
                const value = Number.parseInt(event.target.value);
                if (!Number.isInteger(value) || value < 1) {
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
            如果该值低于你的智力和分身智力的当前值，它们将被临时设置为该值。例如：
            <ul>
              <li>如果你的智力是 1000，而你把这个值设为 500，那么你的智力将被临时设置为 500。</li>
              <li>如果某个分身的智力是 200，而你把这个值设为 500，那么该分身的智力仍为 200。</li>
            </ul>
          </Typography>
          <Typography>
            注意你仍然会照常获得智力经验。
            <br />
            例如，假设你拥有 1e6 智力经验（智力技能 = 242），并将智力覆盖值设为
            100。在 BitNode 开始时，你的智力技能将被设为 100（约等于 11255.318 智力经验）。
            <br />
            如果你在这个 BitNode 中获得了 500e3 智力经验，你的智力技能将提升到 220（总智力经验 =
            11255 + 500e3 = 511255）。在执行 bitflume 之后，该 BitNode 中获得的经验会被加到你原本的经验上，你的智力技能将变为
            255（总智力经验 = 1e6 + 500e3 = 1.5e6）。
          </Typography>
          <br />
          <Typography>
            被覆盖的智力会显示在角色概览中。你可以将鼠标悬停在上面查看原始数值。
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
        <ListItemText primary={<Typography variant="h6">高级选项</Typography>} />
        {open ? <ExpandLess color="primary" /> : <ExpandMore color="primary" />}
      </ListItemButton>
      <Collapse in={open}>
        <Box sx={{ padding: "0 1rem" }}>
          <Typography>
            这些选项为经验丰富的玩家提供了独特的玩法。如果你是新手，可以放心忽略这些选项，以后再来尝试。
          </Typography>
          <br />
          <OptionSwitch
            checked={bitNodeBooleanOptions.restrictHomePCUpgrade}
            onChange={(value) => {
              callbacks.setBooleanOption("restrictHomePCUpgrade", value);
            }}
            text="限制家用电脑的最大 RAM 与核心数"
            tooltip="家用电脑的最大 RAM 和核心数将低于正常值。最大 RAM：128GB。最大核心数：1。"
          />
          <OptionSwitch
            disabled={getSfLevel(2) === 0 && targetBitNode !== 2}
            checked={bitNodeBooleanOptions.disableGang}
            onChange={(value) => {
              callbacks.setBooleanOption("disableGang", value);
            }}
            text="禁用帮派"
            tooltip="无论 BitNode 与源文件等级如何，均禁用帮派"
          />
          <OptionSwitch
            disabled={getSfLevel(3) === 0 && targetBitNode !== 3}
            checked={bitNodeBooleanOptions.disableCorporation}
            onChange={(value) => {
              callbacks.setBooleanOption("disableCorporation", value);
            }}
            text="禁用企业"
            tooltip="无论 BitNode 与源文件等级如何，均禁用企业"
          />
          <OptionSwitch
            disabled={getSfLevel(6) === 0 && getSfLevel(7) === 0 && targetBitNode !== 6 && targetBitNode !== 7}
            checked={bitNodeBooleanOptions.disableBladeburner}
            onChange={(value) => {
              callbacks.setBooleanOption("disableBladeburner", value);
            }}
            text="禁用 Bladeburner"
            tooltip="无论 BitNode 与源文件等级如何，均禁用 Bladeburner"
          />
          <OptionSwitch
            checked={bitNodeBooleanOptions.disable4SData}
            onChange={(value) => {
              callbacks.setBooleanOption("disable4SData", value);
            }}
            text="禁用 4S 市场数据"
            tooltip="无论 BitNode 与源文件等级如何，均禁用 4S 市场数据"
          />
          <OptionSwitch
            disabled={getSfLevel(9) === 0 && targetBitNode !== 9}
            checked={bitNodeBooleanOptions.disableHacknetServer}
            onChange={(value) => {
              callbacks.setBooleanOption("disableHacknetServer", value);
            }}
            text="禁用 Hacknet Server"
            tooltip="无论 BitNode 与源文件等级如何，均禁用 Hacknet Server。将以 Hacknet Node 取代 Hacknet Server。"
          />
          <OptionSwitch
            disabled={getSfLevel(10) === 0 && targetBitNode !== 10}
            checked={bitNodeBooleanOptions.disableSleeveExpAndAugmentation}
            onChange={(value) => {
              callbacks.setBooleanOption("disableSleeveExpAndAugmentation", value);
            }}
            text="禁用分身的经验与强化"
            tooltip="分身无法获得经验或安装强化"
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
