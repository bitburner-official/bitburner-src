import React, { useMemo, useState } from "react";
import { Modal } from "../../ui/React/Modal";
import { WormBonusSelector } from "./WormBonusSelector";
import { Worm } from "../Worm";
import { Button, Divider, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { bonuses } from "../BonusType";
import { WormBonusEffect } from "./WormBonusEffect";

interface IProps {
  worm: Worm;
  open: boolean;
  onClose: () => void;
}

const modalStyles = makeStyles({
  segment: {
    width: "calc(50% - 25px)",
    height: "100%",
  },
  stack: {
    maxWidth: "1200px",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  chosen: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  text: {
    height: "100px",
  },
  buttons: {
    minHeight: "300px",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "end",
  },
});

export function WormBonusModal({ worm, open, onClose }: IProps) {
  const [currentBonus, setCurrentBonus] = useState(worm.bonus.name);
  const bonusType = useMemo(() => {
    const found = bonuses.find((bonus) => bonus.name === currentBonus);
    if (found === undefined) throw new Error(`Couldn't find bonus type called '${currentBonus}'. This is a bug.`);
    return found;
  }, [currentBonus]);

  const classes = modalStyles();

  return (
    <Modal open={open} onClose={onClose} sx={{ margin: "10px" }}>
      <div className={classes.stack}>
        <div className={classes.segment}>
          <Typography variant="h5">Bonuses</Typography>
          <WormBonusSelector currentBonus={currentBonus} setCurrentBonus={setCurrentBonus} />
        </div>
        <Divider orientation="vertical" flexItem />
        <div className={`${classes.segment} ${classes.chosen}`}>
          <div className={classes.text}>
            <Typography variant="h5">Chosen bonus</Typography>
            <Typography>
              Name: {currentBonus} (#{bonusType.id})
            </Typography>
            <WormBonusEffect worm={worm} bonus={bonusType} />
            {bonusType.infoText !== null && <Typography>{bonusType.infoText}</Typography>}
          </div>
          <div className={classes.buttons}>
            <div>
              <Button disabled={worm.bonus.name === currentBonus} onClick={() => (worm.bonus = bonusType)}>
                Apply Changes
              </Button>
              <Button disabled={worm.bonus.name === currentBonus} onClick={() => setCurrentBonus(worm.bonus.name)}>
                Reset
              </Button>
            </div>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
