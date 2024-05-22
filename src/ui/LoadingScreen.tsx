import React, { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";

import { load } from "../db";
import { Engine } from "../engine";
import { GameRoot } from "./GameRoot";

import { CONSTANTS } from "../Constants";
import { ActivateRecoveryMode } from "./React/RecoveryRoot";
import { hash } from "../hash/hash";
import { pushGameReady } from "../Electron";

export function LoadingScreen(): React.ReactElement {
  const [show, setShow] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const version = `v${CONSTANTS.VersionString} (${hash()})`;
  if (process.env.NODE_ENV === "development") {
    document.title = `[dev] Bitburner ${version}`;
  } else {
    document.title = `Bitburner ${version}`;
  }

  useEffect(() => {
    const id = setTimeout(() => {
      if (!loaded) setShow(true);
    }, 2000);
    return () => clearTimeout(id);
  });

  useEffect(() => {
    load().then(async (saveData) => {
      try {
        await Engine.load(saveData);
      } catch (error) {
        console.error(error);
        ActivateRecoveryMode(error);
        await Engine.load("");
        setLoaded(true);
        return;
      }

      pushGameReady();
      setLoaded(true);
    });
  }, []);

  return loaded ? (
    <GameRoot />
  ) : (
    <Grid container direction="column" justifyContent="center" alignItems="center" style={{ minHeight: "100vh" }}>
      <Grid item>
        <CircularProgress size={150} color="primary" />
      </Grid>
      <Grid item>
        <Typography variant="h3">Loading Bitburner {version}</Typography>
      </Grid>
      {show && (
        <Grid item>
          <Typography>
            If the game fails to load, consider <a href="?noScripts">killing all scripts</a>
          </Typography>
        </Grid>
      )}
    </Grid>
  );
}
