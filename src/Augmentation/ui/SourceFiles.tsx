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
      name: "源文件 -1：BitNode 中的漏洞利用",
      info: (
        <>
          该源文件只能通过对游戏、Javascript 和 Web 生态的冷门知识来获取。
          <br />
          <br />
          它会将玩家的所有乘数提高 0.1%
          <br />
          <br />
          你已发现以下漏洞利用：
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
        <Typography variant="h5">源文件</Typography>
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
                           等级：{sourceFileData.level} / {sourceFileData.maxLevel}
                         </Typography>
                         {sourceFileData.activeLevel < sourceFileData.level && (
                           <Typography>生效等级：{sourceFileData.activeLevel}</Typography>
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
              等级：{selectedSfData.level} / {selectedSfData.maxLevel}
              <br />
              {selectedSfData.activeLevel < selectedSfData.level && (
                <>
                  生效等级：{selectedSfData.activeLevel}
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
