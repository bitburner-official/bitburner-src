import type { Bladeburner } from "../Bladeburner";

import React from "react";
import { Button, Typography } from "@mui/material";
import { FactionName } from "@enums";
import { BlackOpElem } from "./BlackOpElem";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { CorruptibleText } from "../../ui/React/CorruptibleText";
import { numberOfBlackOperations } from "../data/BlackOperations";
import { finishBitNode } from "../../BitNode/BitNodeUtils";
import { Player } from "@player";

interface BlackOpPageProps {
  bladeburner: Bladeburner;
}

export function BlackOpPage({ bladeburner }: BlackOpPageProps): React.ReactElement {
  const blackOperations = bladeburner.blackOperationArray.slice(0, bladeburner.numBlackOpsComplete + 1).reverse();

  return (
    <>
      <Typography>
        黑色行动（Black Ops）是一次性的特殊秘密行动。每项黑色行动都需要完成前一项后才会解锁。
        <br />
        <br />
        <b>
          要在 {FactionName.Bladeburners} 中步步高升，你的最终目标就是完成所有黑色行动。
        </b>
        <br />
        <br />
        与普通行动一样，黑色行动也可以使用团队。黑色行动失败将损失大量生命值和声望。黑色行动的成功率显著受战斗属性影响，许多行动还能从黑客技能中获益，不受魅力影响。
      </Typography>

      {bladeburner.numBlackOpsComplete >= numberOfBlackOperations && (
        <Button
          sx={{ my: 1, p: 1 }}
          onClick={() => {
            if (!Player.bladeburner || Player.bladeburner.numBlackOpsComplete < numberOfBlackOperations) {
              return;
            }
            finishBitNode();
            Router.toPage(Page.BitVerse, { flume: false, quick: false });
          }}
        >
          <CorruptibleText content="Destroy w0r1d_d43m0n" spoiler={false}></CorruptibleText>
        </Button>
      )}

      {blackOperations.map((blackOperation) => (
        <BlackOpElem key={blackOperation.name} bladeburner={bladeburner} action={blackOperation} />
      ))}
    </>
  );
}
