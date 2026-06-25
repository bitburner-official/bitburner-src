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
        `Only created ${successCount} ${selectedServerType.label} darknet servers at depth ${depth}. Not enough open positions available`,
        ToastVariant.ERROR,
        4000,
      );
    } else {
      SnackbarEvents.emit(
        `Created ${count} new ${selectedServerType.label} darknet servers at depth ${depth}`,
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
          <Typography variant="h4">Add Darknet Server</Typography>
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
            label="Server difficulty"
            inputProps={{ min: 1, step: 1, max: maxDepth }}
            sx={{ minWidth: `200px` }}
            id="darknet-dev-server-depth-input"
          />
          <br />
          <TextField
            value={depth}
            onChange={updateDepth}
            type="number"
            label="Server starting depth"
            inputProps={{ min: 1, step: 1, max: maxDepth }}
            sx={{ minWidth: `200px` }}
            id="darknet-dev-server-depth-input"
          />
          <br />
          <TextField
            value={count}
            onChange={updateCount}
            type="number"
            label="Number of copies"
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
          <Typography>Darknet</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <OptionSwitch
            disabled={!hasDarknetAccess()}
            checked={DarknetState.showFullNetwork}
            onChange={(newValue) => toggleShowFullNetwork(newValue)}
            text="Show Full Network"
            tooltip={<>If this is set, the full depth of the dark network will be displayed.</>}
          />
          <Tooltip title={<Typography>Gain access to the darkweb network.</Typography>}>
            <Button
              onClick={() => {
                getDarkscapeNavigator();
              }}
            >
              Get {CompletedProgramName.darkscape}
            </Button>
          </Tooltip>
          <br />
          <br />
          <Tooltip title={<Typography>Create a new darkweb network.</Typography>}>
            <span>
              <Button
                disabled={!hasDarknetAccess()}
                onClick={() => {
                  clearDarknet();
                  populateDarknet();
                  SnackbarEvents.emit("New dark network generated", ToastVariant.SUCCESS, 2000);
                }}
              >
                Generate New Dark Network
              </Button>
            </span>
          </Tooltip>
          <br />
          <br />
          <Tooltip title={<Typography>Reposition the majority of servers in the darknet.</Typography>}>
            <span>
              <Button
                disabled={!hasDarknetAccess()}
                onClick={() => {
                  moveRandomDarknetServers(Math.floor(getAllDarknetServers().length / 2));
                  SnackbarEvents.emit("Darknet servers shuffled", ToastVariant.SUCCESS, 2000);
                }}
              >
                Shuffle Server Locations
              </Button>
            </span>
          </Tooltip>
          <br />
          <br />
          <Tooltip title={<Typography>Adds a new server of a specific variety.</Typography>}>
            <span>
              <Button disabled={!hasDarknetAccess()} onClick={() => setOpen(true)}>
                Add Darknet Servers...
              </Button>
            </span>
          </Tooltip>
          <br />
          <br />
          <Tooltip title={<Typography>Root all standard darknet servers.</Typography>}>
            <span>
              <Button
                disabled={!hasDarknetAccess()}
                onClick={() => {
                  getAllMovableDarknetServers().forEach((server) => {
                    if (!isLabyrinthServer(server.hostname)) {
                      handleSuccessfulAuth(server, 1, -1);
                    }
                  });
                  SnackbarEvents.emit("Gained darknet server admin rights", ToastVariant.SUCCESS, 2000);
                }}
              >
                Gain admin access to all darknet servers
              </Button>
            </span>
          </Tooltip>
          <br />
          <br />
          <Tooltip title={<Typography>Root all darknet labyrinth servers.</Typography>}>
            <span>
              <Button
                disabled={!hasDarknetAccess()}
                onClick={() => {
                  getAllDarknetServers().forEach((server) => {
                    if (isLabyrinthServer(server.hostname)) {
                      server.hasAdminRights = true;
                    }
                  });
                  SnackbarEvents.emit("Gained lab admin rights", ToastVariant.SUCCESS, 2000);
                }}
              >
                Gain admin access to labyrinth server
              </Button>
            </span>
          </Tooltip>
          <br />
          <br />
          <Tooltip
            title={
              <Typography>
                Start a violent "webstorm," which will wipe out much of the dark net and replace it.
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
                START WEBSTORM
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
