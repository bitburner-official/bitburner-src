import React, { useState } from "react";
import { BBCabinetRoot } from "./BBCabinet";

import Button from "@mui/material/Button";
import { Player } from "@player";
import { AlertEvents } from "../../ui/React/AlertManager";
import { ZorkRoot } from "../Zork/ZorkRoot";
import { ZorkGames, ZorkGame } from "../Zork/metadata";

enum Page {
  None,
  Megabyteburner2000,
  Zork,
}

export function ArcadeRoot(): React.ReactElement {
  const [page, setPage] = useState(Page.None);
  const [zorkGame, setZorkGame] = useState<ZorkGame | null>(null);

  function mbBurner2000(): void {
    if (Player.activeSourceFileLvl(1) === 0) {
      AlertEvents.emit("This machine is broken.");
    } else {
      setPage(Page.Megabyteburner2000);
    }
  }

  function playZork(game: ZorkGame): void {
    setZorkGame(game);
    setPage(Page.Zork);
  }

  if (page === Page.None) {
    return (
      <>
        <Button onClick={mbBurner2000}>Megabyte burner 2000</Button>
        <br />
        {ZorkGames.map((game) => (
          <React.Fragment key={game.key}>
            <Button onClick={() => playZork(game)}>{game.title}</Button>
            <br />
          </React.Fragment>
        ))}
      </>
    );
  }
  let currentGame = <></>;
  switch (page) {
    case Page.Megabyteburner2000:
      currentGame = <BBCabinetRoot />;
      break;
    case Page.Zork:
      if (zorkGame) currentGame = <ZorkRoot game={zorkGame} />;
      break;
  }
  return (
    <>
      <Button onClick={() => setPage(Page.None)}>Back</Button>
      {currentGame}
    </>
  );
}
