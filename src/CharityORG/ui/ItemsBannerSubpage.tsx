import React, { useState } from "react";
import { useRerender } from "../../ui/React/hooks";
import Typography from "@mui/material/Typography";
import { MenuItem } from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Box from "@mui/material/Box";
import { Player } from "@player";
import { BannerCard } from "./BannerCard";
import Button from "@mui/material/Button";
import { CharityORGConstants } from "../data/Constants";
import { formatPercent, formatNumber } from "../../ui/formatNumber";

/** React Component for the popup that manages Karma spending */
export function ItemsBannerSubpage(): React.ReactElement {
  const charityORG = (function () {
    if (Player.charityORG === null) throw new Error("Charity should not be null");
    return Player.charityORG;
  })();
  const f = (x: number) => formatPercent(x, x - 1 < 0.1 ? 2 : 1);
  const rerender = useRerender();
  const [currentBanner, setCurrentBanner] = useState("");
  const onCurrentChange = (event: SelectChangeEvent): void => {
    setCurrentBanner(event.target.value);
    rerender();
  };
  const [pendingBanner, setPendingBanner] = useState("");
  const onPendingChange = (event: SelectChangeEvent): void => {
    setPendingBanner(event.target.value);
    rerender();
  };

  if (currentBanner !== "" && !charityORG.bannerPieces.find((f) => f.name === currentBanner)) setCurrentBanner("");
  if (pendingBanner !== "" && !charityORG.bannerPiecesStore.find((f) => f.name === pendingBanner)) setPendingBanner("");

  function destroyPiece(): void {
    const piece = charityORG.bannerPieces.find((f) => f.name === currentBanner);
    if (piece === undefined) return;
    const index = charityORG.bannerPieces.indexOf(piece);
    charityORG.bannerPieces.splice(index, 1);
    charityORG.addItemUseMessage("Destroyed banner piece: " + piece.short_name);
    setCurrentBanner("");
    charityORG.resetBanner();
  }
  function destroyAllPieces(): void {
    charityORG.bannerPieces.length = 0;
    charityORG.addItemUseMessage("Destroyed all current banner pieces!");
    setCurrentBanner("");
    charityORG.resetBanner();
  }
  function destroyStoredPiece(): void {
    const piece = charityORG.bannerPiecesStore.find((f) => f.name === pendingBanner);
    if (piece === undefined) return;
    const index = charityORG.bannerPiecesStore.indexOf(piece);
    charityORG.bannerPiecesStore.splice(index, 1);
    charityORG.addItemUseMessage("Destroyed stored banner piece: " + piece.short_name);
    setPendingBanner("");
  }
  function destroyAllStoredPieces(): void {
    charityORG.bannerPiecesStore.length = 0;
    charityORG.addItemUseMessage("Destroyed all stored banner pieces!");
    setPendingBanner("");
  }
  function luckyRemove(): void {
    if (charityORG.luckyCoin < 1) return;
    const piece = charityORG.bannerPieces.find((f) => f.name === currentBanner);
    if (piece === undefined) return;
    const index = charityORG.bannerPieces.indexOf(piece);
    charityORG.bannerPieces.splice(index, 1);
    charityORG.bannerPiecesStore.push(piece);
    charityORG.addItemUseMessage("Lucky removed banner piece: " + piece.short_name);
    charityORG.luckyCoin--;
    setCurrentBanner("");
    charityORG.resetBanner();
  }
  function activatePiece(): void {
    if (charityORG.bannerPieces.length >= CharityORGConstants.CharityMaxActivePieces) return;
    const piece = charityORG.bannerPiecesStore.find((f) => f.name === pendingBanner);
    if (piece === undefined) return;
    const index = charityORG.bannerPiecesStore.indexOf(piece);
    charityORG.bannerPiecesStore.splice(index, 1);
    charityORG.bannerPieces.push(piece);
    charityORG.addItemUseMessage("Activated banner piece: " + piece.short_name);
    charityORG.luckyCoin--;
    setPendingBanner("");
    charityORG.resetBanner();
  }

  return (
    <span>
      <Box display="flex">
        <Typography>
          The Charity Banner has been helping charities around the world to do their work. Created from the combined
          donations of bits and pieces of augmentations, they have turned these left over pieces into something truely
          amazing.<br></br>
          <br></br>
        </Typography>
      </Box>
      <Box display="grid" width="100%" sx={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
        <span>
          <Typography>
            Current Active Banner Pieces ({charityORG.bannerPieces.length}/{CharityORGConstants.CharityMaxActivePieces}
            ):
          </Typography>
          <Box sx={{ height: 240, width: "99%", overflow: "scroll", border: "1px solid", borderBlockColor: "yellow" }}>
            {charityORG.bannerPieces.map((n, i) => (
              <Typography key={i}>{n.short_name}</Typography>
            ))}
          </Box>
          <br></br>
          <Select onChange={onCurrentChange} value={currentBanner} sx={{ width: "99%", mb: 1 }}>
            {charityORG.bannerPieces.map((k, i) => (
              <MenuItem key={i + 1} value={k.name}>
                <Typography variant="h6" height="min-content">
                  {k.short_name}
                </Typography>
              </MenuItem>
            ))}
          </Select>
          <Button title="Permanently removes the banner piece" onClick={() => destroyPiece()}>
            Destroy Piece
          </Button>{" "}
          <Button title="Uses a lucky coin.  Places the piece back in the Stored bin" onClick={() => luckyRemove()}>
            Lucky Remove
          </Button>{" "}
          <Button title="Permanently removes all banner pieces" onClick={() => destroyAllPieces()}>
            Destroy All Pieces
          </Button>
          {BannerCard(charityORG.bannerPieces.find((f) => f.name === currentBanner))}
        </span>
        <span>
          <Typography>
            Stored Pieces ({charityORG.bannerPiecesStore.length}/{CharityORGConstants.CharityMaxBannerPieces}):
          </Typography>
          <Box sx={{ height: 240, width: "99%", overflow: "scroll", border: "1px solid", borderBlockColor: "yellow" }}>
            {charityORG.bannerPiecesStore.map((n, i) => (
              <Typography key={i}>{n.short_name}</Typography>
            ))}
          </Box>
          <br></br>
          <Select onChange={onPendingChange} value={pendingBanner} sx={{ width: "99%", mb: 1 }}>
            {charityORG.bannerPiecesStore.map((k, i) => (
              <MenuItem key={i + 1} value={k.name}>
                <Typography variant="h6" height="min-content">
                  {k.short_name}
                </Typography>
              </MenuItem>
            ))}
          </Select>
          <Button title="Activates the banner piece and moves it into the Current bin." onClick={() => activatePiece()}>
            Activate Piece
          </Button>{" "}
          <Button title="Permanently removes the banner piece" onClick={() => destroyStoredPiece()}>
            Destroy Piece
          </Button>{" "}
          <Button title="Permanently removes all stored banner pieces" onClick={() => destroyAllStoredPieces()}>
            Destroy All Pieces
          </Button>
          {BannerCard(charityORG.bannerPiecesStore.find((f) => f.name === pendingBanner))}
        </span>
        <span>
          <Typography variant="h6">Current Banner Configuration</Typography>
          <Typography variant="body1">Total Power: {formatNumber(charityORG.bannerPower)}</Typography>

          <br></br>
          {charityORG.luck !== 0 && <Typography variant="body1">lucky: {formatNumber(charityORG.luck)}</Typography>}
          {Object.entries(charityORG.charityAugment.mults)
            .filter((fl) => fl[1] !== 1)
            .map((k, i) => (
              <Typography variant="body1" key={i + 1}>
                {k[0].replaceAll("_", " ") + ": " + f(k[1] - 1)}
              </Typography>
            ))}
        </span>
      </Box>
    </span>
  );
}
//    </Context.CharityORG.Provider>
// {value === 0 && <EventStatusSubpage />}

//<Box sx={{ height: 220, overflow: "scroll", border: "1px solid", borderBlockColor: "yellow" }}>
//  {forEach(charityORG.messages).map((n) => (
//    <Typography>{n.message}</Typography>
//  ))}
//</Box>
