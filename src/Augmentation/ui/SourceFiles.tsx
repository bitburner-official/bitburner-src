import { ListItemButton, ListItemText, Paper } from "@mui/material";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import React, { useState } from "react";
import { Exploit, ExploitDescription } from "../../Exploits/Exploit";
import { Player } from "@player";
import { OwnedAugmentationsOrderSetting } from "../../Settings/SettingEnums";
import { Settings } from "../../Settings/Settings";
import { SourceFiles } from "../../SourceFile/SourceFiles";

interface SourceFileData {
  n: number;
  level: number;
  maxLevel: number;
  activeLevel: number;
  name: string;
  info: JSX.Element;
}

const getSourceFileData = (sfNumber: number): SourceFileData | null => {
  let maxLevel: number;
  switch (sfNumber) {
    case -1:
      maxLevel = Object.keys(Exploit).length;
      break;
    case 12:
      maxLevel = Infinity;
      break;
    default:
      maxLevel = 3;
  }

  const sourceFile = SourceFiles["SourceFile" + sfNumber];
  if (sourceFile === undefined) {
    console.error(`Invalid source file number: ${sfNumber}`);
    return null;
  }
  return {
    n: sfNumber,
    level: Player.sourceFileLvl(sfNumber),
    maxLevel: maxLevel,
    activeLevel: Player.activeSourceFileLvl(sfNumber),
    name: sourceFile.name,
    info: sourceFile.info,
  };
};

export function SourceFilesElement(): React.ReactElement {
  const sourceFileList: SourceFileData[] = [];

  const exploits = Player.exploits;
  // Create a fake SF for -1, if "owned"
  if (exploits.length > 0) {
    sourceFileList.push({
      n: -1,
      level: Player.exploits.length,
      maxLevel: Object.keys(Exploit).length,
      activeLevel: Player.exploits.length,
      name: "Source-File -1: Exploits in the BitNodes",
      info: (
        <>
          This Source-File can only be acquired with obscure knowledge of the game, Javascript, and the web ecosystem.
          <br />
          <br />
          It increases all of the player's multipliers by 0.1%
          <br />
          <br />
          You have found the following exploits:
          <ul>
            {Player.exploits.map((c) => (
              <li key={c}>
                {c}: {ExploitDescription[c]}
              </li>
            ))}
          </ul>
        </>
      ),
    });
  }
  for (const sfNumber of Player.sourceFiles.keys()) {
    const sourceFileData = getSourceFileData(sfNumber);
    if (!sourceFileData) {
      continue;
    }
    sourceFileList.push(sourceFileData);
  }

  if (Settings.OwnedAugmentationsOrder === OwnedAugmentationsOrderSetting.Alphabetically) {
    sourceFileList.sort((a, b) => a.n - b.n);
  }

  const [selectedSfData, setSelectedSfData] = useState<SourceFileData | null>(() => {
    if (sourceFileList.length === 0) {
      return null;
    }
    return sourceFileList[0];
  });

  if (!selectedSfData) {
    return <></>;
  }

  return (
    <Box sx={{ width: "100%", mt: 1 }}>
      <Paper sx={{ p: 1 }}>
        <Typography variant="h5">Source Files</Typography>
      </Paper>
      <Paper sx={{ display: "grid", gridTemplateColumns: "1fr 3fr" }}>
        <Box>
          <List
            sx={{ height: 400, overflowY: "scroll", borderRight: `1px solid ${Settings.theme.welllight}` }}
            disablePadding
          >
            {sourceFileList.map((sourceFileData, i) => {
              return (
                <ListItemButton
                  key={i + 1}
                  onClick={() => setSelectedSfData(sourceFileData)}
                  selected={selectedSfData.n === sourceFileData.n}
                  sx={{ py: 0 }}
                >
                  <ListItemText
                    disableTypography
                    primary={<Typography>{sourceFileData.name}</Typography>}
                    secondary={
                      <>
                        <Typography>
                          Level: {sourceFileData.level} / {sourceFileData.maxLevel}
                        </Typography>
                        {sourceFileData.activeLevel < sourceFileData.level && (
                          <Typography>Active level: {sourceFileData.activeLevel}</Typography>
                        )}
                      </>
                    }
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Box>
        {selectedSfData !== null && (
          <Box sx={{ m: 1 }}>
            <Typography variant="h6" sx={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
              {selectedSfData.name}
            </Typography>
            <Typography component="div" sx={{ maxHeight: 350, overflowY: "scroll" }}>
              Level: {selectedSfData.level} / {selectedSfData.maxLevel}
              <br />
              {selectedSfData.activeLevel < selectedSfData.level && (
                <>
                  Active level: {selectedSfData.activeLevel}
                  <br />
                </>
              )}
              <br />
              {selectedSfData.info}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
