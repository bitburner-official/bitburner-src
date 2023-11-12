import React, { useState } from "react";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { IceCream } from "../../Lottery/LotteryStoreLocationInside";
import { Player } from "@player";
//import { LotteryStoreLocationInside } from "../../Lottery/LotteryStoreLocationInside"

let girlwithicecream = false
function GiveIceCream(): void {
  dialogBoxCreate("You give the girl an Ice Cream cone");
  girlwithicecream = true;
  // Give achievement
}
export function LotteryStoreLocation(): React.ReactElement {
  const BuyTickets = <Button onClick={() => Router.toPage(Page.LotteryStoreLocationInside)}>Enter Store</Button>;
  const GiveIceCreamButton = IceCream() && Player.bitNodeN === 15 && girlwithicecream == false ? <Button onClick={() => GiveIceCream()}>Give Ice Cream</Button> : "";
  const IceCreamGirl = Player.bitNodeN === 15 && girlwithicecream === false ?
    <Typography>
      <i>
        A little girl is here, wishing she had some Ice Cream...
      </i>
    </Typography>
    : Player.bitNodeN === 15 && girlwithicecream ?
      <Typography>
        <i>
          A little girl is here, eating her Ice Cream cone
        </i>
      </Typography> : "";

  const WomanGreeting = <Typography>
    <i>
      A friendly woman beckons you through the door.  "Come on in!".
    </i>
  </Typography>

  const symbol = <Typography sx={{ lineHeight: '1em', whiteSpace: 'pre' }}>
    {"                                                     ___"}<br />
    {"                                             ___..--'  .`."}<br />
    {"                                    ___...--'     -  .` `.`."}<br />
    {"                           ___...--' _      -  _   .` -   `.`."}<br />
    {"                  ___...--'  -       _   -       .`  `. - _ `.`."}<br />
    {"           __..--'_______________ -         _  .`  _   `.   - `.`."}<br />
    {"        .`    _ /\    -        .`      _     .`__________`. _  -`.`."}<br />
    {"      .` -   _ /  \_     -   .`  _         .` |CONVENIENCE|`.   - `.`."}<br />
    {"    .`-    _  /   /\   -   .`        _   .`   |___________|  `. _   `.`."}<br />
    {"  .`________ /__ /_ \____.`____________.`     ___       ___  - `._____`|"}<br />
    {"    |   -  __  -|    | - |  ____  |   | | _  |   |  _  |   |  _ |"}<br />
    {"    | _   |  |  | -  |   | |.--.| |___| |    |___|     |___|    |"}<br />
    {"    |     |--|  |    | _ | |'--'| |---| |   _|---|     |---|_   |"}<br />
    {"    |   - |__| _|  - |   | |.--.| |   | |    |   |_  _ |   |    |"}<br />
    {" ---``--._      |    |   |=|'--'|=|___|=|====|___|=====|___|====|"}<br />
    {" -- . ''  ``--._| _  |  -|_|.--.|_______|_______________________|"}<br />
    {"`--._           '--- |_  |:|'--'|:::::::|:::::::::::::::::::::::|"}<br />
    {"_____`--._ ''      . '---'``--._|:::::::|:::::::::::::::::::::::|"}<br />
    {"----------`--._          ''      ``--.._|:::::::::::::::::::::::|"}<br />
    {"`--._ _________`--._'        --     .   ''-----.................'"}</Typography>

    return (
      <>
        {WomanGreeting}
        {IceCreamGirl}
        {BuyTickets}, {GiveIceCreamButton}
        {symbol}
      </>
    );
}
