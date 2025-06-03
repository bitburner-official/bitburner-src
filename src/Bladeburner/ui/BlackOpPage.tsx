import type { Bladeburner } from "../Bladeburner";

import React from "react";
import { Button, Typography } from "@mui/material";
import { FactionName } from "@enums";
import { BlackOpElem } from "./BlackOpElem";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { CorruptibleText } from "../../ui/React/CorruptibleText";
import { blackOpsArray } from "../data/BlackOperations";
import { finishBitNode } from "../../BitNode/BitNodeUtils";

interface BlackOpPageProps {
  bladeburner: Bladeburner;
}

export function BlackOpPage({ bladeburner }: BlackOpPageProps): React.ReactElement {
  const blackOperations = blackOpsArray.slice(0, bladeburner.numBlackOpsComplete + 1).reverse();

  return (
    <>
      <Typography>
        Black Operations (Black Ops) are special, one-time covert operations. Each Black Op must be unlocked
        successively by completing the one before it.
        <br />
        <br />
        <b>
          Your ultimate goal to climb through the ranks of {FactionName.Bladeburners} is to complete all of the Black
          Ops.
        </b>
        <br />
        <br />
        Like normal operations, you may use a team for Black Ops. Failing a black op will incur heavy HP and rank
        losses. Black Ops success significantly affected by combat stats. Many Ops benefit from Hacking skill.
        Unaffected by Charisma.
      </Typography>
      {bladeburner.numBlackOpsComplete >= blackOpsArray.length ? (
        <Button
          sx={{ my: 1, p: 1 }}
          onClick={() => {
            finishBitNode();
            Router.toPage(Page.BitVerse, { flume: false, quick: false });
          }}
        >
          <CorruptibleText content="Destroy w0r1d_d43m0n" spoiler={false}></CorruptibleText>
        </Button>
      ) : (
        <>
          {blackOperations.map((blackOperation) => (
            <BlackOpElem key={blackOperation.name} bladeburner={bladeburner} action={blackOperation} />
          ))}
        </>
      )}
    </>
  );
}
