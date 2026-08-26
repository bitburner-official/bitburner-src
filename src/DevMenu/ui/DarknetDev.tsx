import React from "react";

import {
  AccordionSummary,
  AccordionDetails,
  Select,
  Typography,
  Tooltip,
  TextField,
  MenuItem,
  Button,
  type SelectChangeEvent,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { clearDarknet, populateDarknet } from "../../DarkNet/controllers/NetworkGenerator";
import { DarknetEvents, DarknetState } from "../../DarkNet/models/DarknetState";
import { launchWebstorm } from "../../DarkNet/effects/webstorm";
import { OptionSwitch } from "../../ui/React/OptionSwitch";
import { Router } from "../../ui/GameRoot";
import { CompletedProgramName, SimplePage, ToastVariant } from "@enums";
import { getDarkscapeNavigator, handleSuccessfulAuth } from "../../DarkNet/effects/effects";
import { isLabyrinthServer } from "../../DarkNet/effects/labyrinth";
import { SnackbarEvents } from "../../ui/React/Snackbar";
import { AutoExpandAccordion } from "../../ui/AutoExpand/AutoExpandAccordion";
import { getAllDarknetServers, getAllMovableDarknetServers } from "../../DarkNet/utils/darknetNetworkUtils";
import { moveDarknetServer, moveRandomDarknetServers } from "../../DarkNet/controllers/NetworkMovement";
import { Modal } from "../../ui/React/Modal";
import { ModelIds } from "../../DarkNet/Enums";
import {
  createDarknetServer,
  getBinaryEncodedConfig,
  getBufferOverflowConfig,
  getCaptchaConfig,
  getConvertToBase10Config,
  getDefaultPasswordConfig,
  getDivisibilityTestConfig,
  getDogNameConfig,
  getEchoVulnConfig,
  getEuCountryDictionaryConfig,
  getGuessNumberConfig,
  getKingOfTheHillConfig,
  getLargeDictionaryConfig,
  getLargestPrimeFactorConfig,
  getMastermindHintConfig,
  getNoPasswordConfig,
  getPacketSnifferConfig,
  getParseArithmeticExpressionConfig,
  getRomanNumeralConfig,
  getSortedEchoVulnConfig,
  getSpiceLevelConfig,
  getTimingAttackConfig,
  getTripleModuloConfig,
  getYesn_tConfig,
  ServerConfig,
  serverFactory,
} from "../../DarkNet/controllers/ServerGenerator";
import { hasDarknetAccess } from "../../DarkNet/utils/darknetAuthUtils";

export function DarknetDev(): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [difficulty, setDifficulty] = React.useState(1);
  const [depth, setDepth] = React.useState(1);
  const [count, setCount] = React.useState(1);
  const [selectedServerType, setSelectedServerType] = React.useState<ServerTypeOption>(serverTypeOptions[0]);
  const cancel = (): void => {
    setOpen(false);
  };

  const maxDepth = Math.max(...getAllDarknetServers().map((s) => s.depth));

  const toggleShowFullNetwork = (newValue: boolean): void => {
    DarknetState.showFullNetwork = newValue;
    DarknetEvents.emit();
  };

  const changeSelectedServerType = (event: SelectChangeEvent<string>): void => {
    const option = serverTypeOptions.find((opt) => opt.label === event.target.value);
    if (!option) return;
    setSelectedServerType(option);
  };

  const updateDifficulty = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setDifficulty(Number(event.target.value));
  };
  const updateDepth = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setDepth(Math.max(1, Math.min(maxDepth, Number(event.target.value))));
  };
  const updateCount = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setCount(Number(event.target.value));
  };

  const createServer = (): void => {
    const range = Math.max(3, Math.ceil(count / 4));
    let successCount = 0;
    for (let i = 0; i < count; i++) {
      const newServer =
        selectedServerType.label === "Random"
          ? createDarknetServer(difficulty, depth, -1)
          : serverFactory(selectedServerType.constructor, difficulty, depth, -1);
      successCount += +moveDarknetServer(newServer, range, range, depth);
    }
    if (successCount !== count) {
      SnackbarEvents.emit(
        `在深度 ${depth} 处仅创建了 ${successCount} 个 ${selectedServerType.label} 暗网服务器。可用位置不足`,
        ToastVariant.ERROR,
        4000,
      );
    } else {
      SnackbarEvents.emit(
        `已在深度 ${depth} 处创建 ${count} 个新的 ${selectedServerType.label} 暗网服务器`,
        ToastVariant.SUCCESS,
        2000,
      );
    }
    setOpen(false);
  };

  return (
    <>
      <Modal open={open} onClose={cancel}>
        <div>
          <Typography variant="h4">添加暗网服务器</Typography>
          <br />
          <Select
            value={selectedServerType.label}
            onChange={changeSelectedServerType}
            sx={{ mr: 1, minWidth: `200px` }}
          >
            {serverTypeOptions.map((option) => (
              <MenuItem key={option.label} value={option.label}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          <br />
          <TextField
            value={difficulty}
            onChange={updateDifficulty}
            type="number"
            label="服务器难度"
            inputProps={{ min: 1, step: 1, max: maxDepth }}
            sx={{ minWidth: `200px` }}
            id="darknet-dev-server-depth-input"
          />
          <br />
          <TextField
            value={depth}
            onChange={updateDepth}
            type="number"
            label="服务器起始深度"
            inputProps={{ min: 1, step: 1, max: maxDepth }}
            sx={{ minWidth: `200px` }}
            id="darknet-dev-server-depth-input"
          />
          <br />
          <TextField
            value={count}
            onChange={updateCount}
            type="number"
            label="副本数量"
            inputProps={{ min: 1, step: 1, max: maxDepth * 2 }}
            sx={{ minWidth: `200px` }}
            id="darknet-dev-server-depth-input"
          />
          <br />
          <br />
          <Button onClick={createServer}>Create!</Button>
        </div>
      </Modal>
      <AutoExpandAccordion cacheKey="DEVMENU_DarknetDev" unmountOnExit={true}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>暗网</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <OptionSwitch
            disabled={!hasDarknetAccess()}
            checked={DarknetState.showFullNetwork}
            onChange={(newValue) => toggleShowFullNetwork(newValue)}
            text="显示完整网络"
            tooltip={<>设置后，将显示暗网的完整深度。</>}
          />
          <Tooltip title={<Typography>获得进入暗网网络的权限。</Typography>}>
            <Button
              onClick={() => {
                getDarkscapeNavigator();
              }}
            >
              获取 {CompletedProgramName.darkscape}
            </Button>
          </Tooltip>
          <br />
          <br />
          <Tooltip title={<Typography>生成一个新的暗网网络。</Typography>}>
            <span>
              <Button
                disabled={!hasDarknetAccess()}
                onClick={() => {
                  clearDarknet();
                  populateDarknet();
                  SnackbarEvents.emit("已生成新的暗网网络", ToastVariant.SUCCESS, 2000);
                }}
              >
                生成新暗网网络
              </Button>
            </span>
          </Tooltip>
          <br />
          <br />
          <Tooltip title={<Typography>重新布置暗网中大部分服务器的位置。</Typography>}>
            <span>
              <Button
                disabled={!hasDarknetAccess()}
                onClick={() => {
                  moveRandomDarknetServers(Math.floor(getAllDarknetServers().length / 2));
                  SnackbarEvents.emit("暗网服务器位置已打乱", ToastVariant.SUCCESS, 2000);
                }}
              >
                打乱服务器位置
              </Button>
            </span>
          </Tooltip>
          <br />
          <br />
          <Tooltip title={<Typography>添加一个特定类型的新服务器。</Typography>}>
            <span>
              <Button disabled={!hasDarknetAccess()} onClick={() => setOpen(true)}>
                添加暗网服务器…
              </Button>
            </span>
          </Tooltip>
          <br />
          <br />
          <Tooltip title={<Typography>对所有标准暗网服务器提权。</Typography>}>
            <span>
              <Button
                disabled={!hasDarknetAccess()}
                onClick={() => {
                  getAllMovableDarknetServers().forEach((server) => {
                    if (!isLabyrinthServer(server.hostname)) {
                      handleSuccessfulAuth(server, 1, -1);
                    }
                  });
                  SnackbarEvents.emit("已获得暗网服务器管理员权限", ToastVariant.SUCCESS, 2000);
                }}
              >
                获得所有暗网服务器的管理员权限
              </Button>
            </span>
          </Tooltip>
          <br />
          <br />
          <Tooltip title={<Typography>对所有暗网迷宫（Labyrinth）服务器提权。</Typography>}>
            <span>
              <Button
                disabled={!hasDarknetAccess()}
                onClick={() => {
                  getAllDarknetServers().forEach((server) => {
                    if (isLabyrinthServer(server.hostname)) {
                      server.hasAdminRights = true;
                    }
                  });
                  SnackbarEvents.emit("已获得迷宫管理员权限", ToastVariant.SUCCESS, 2000);
                }}
              >
                获得迷宫服务器的管理员权限
              </Button>
            </span>
          </Tooltip>
          <br />
          <br />
          <Tooltip
            title={
              <Typography>
                启动一场猛烈的“webstorm”，它将摧毁大部分暗网并将其重建。
              </Typography>
            }
          >
            <span>
              <Button
                disabled={!hasDarknetAccess()}
                onClick={() => {
                  void launchWebstorm();
                  Router.toPage(SimplePage.DarkNet);
                }}
              >
                启动 WEBSTORM
              </Button>
            </span>
          </Tooltip>
        </AccordionDetails>
      </AutoExpandAccordion>
    </>
  );
}

type ServerTypeOption = { label: string; constructor: (d: number) => ServerConfig };

const serverTypeOptions: ServerTypeOption[] = [
  { label: "Random", constructor: getNoPasswordConfig },
  { label: ModelIds.NoPassword, constructor: getNoPasswordConfig },
  { label: ModelIds.DefaultPassword, constructor: getDefaultPasswordConfig },
  { label: ModelIds.EchoVuln, constructor: getEchoVulnConfig },
  { label: ModelIds.SortedEchoVuln, constructor: getSortedEchoVulnConfig },
  { label: ModelIds.Captcha, constructor: getCaptchaConfig },
  { label: ModelIds.DogNames, constructor: getDogNameConfig },
  { label: ModelIds.GuessNumber, constructor: getGuessNumberConfig },
  { label: ModelIds.CommonPasswordDictionary, constructor: getLargeDictionaryConfig },
  { label: ModelIds.EUCountryDictionary, constructor: getEuCountryDictionaryConfig },
  { label: ModelIds.Yesn_t, constructor: getYesn_tConfig },
  { label: ModelIds.RomanNumeral, constructor: getRomanNumeralConfig },
  { label: ModelIds.BufferOverflow, constructor: getBufferOverflowConfig },
  { label: ModelIds.MastermindHint, constructor: getMastermindHintConfig },
  { label: ModelIds.TimingAttack, constructor: getTimingAttackConfig },
  { label: ModelIds.LargestPrimeFactor, constructor: getLargestPrimeFactorConfig },
  { label: ModelIds.BinaryEncodedFeedback, constructor: getBinaryEncodedConfig },
  { label: ModelIds.SpiceLevel, constructor: getSpiceLevelConfig },
  { label: ModelIds.ConvertToBase10, constructor: getConvertToBase10Config },
  { label: ModelIds.parsedExpression, constructor: getParseArithmeticExpressionConfig },
  { label: ModelIds.divisibilityTest, constructor: getDivisibilityTestConfig },
  { label: ModelIds.tripleModulo, constructor: getTripleModuloConfig },
  { label: ModelIds.globalMaxima, constructor: getKingOfTheHillConfig },
  { label: ModelIds.packetSniffer, constructor: getPacketSnifferConfig },
  { label: ModelIds.encryptedPassword, constructor: getBinaryEncodedConfig },
];
