import React from "react";
import { Context } from "./Context";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Player } from "@player";
import { TextField } from "@mui/material";
import { formatNumber } from "../../ui/formatNumber";
import { saveObject } from "../../SaveObject";
import { Engine } from "../../engine";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { convertTimeMsToTimeElapsedString } from "../../utils/StringHelperFunctions";
import { KarmaAvailable } from "./KarmaAvailable";

/** React Component for the popup that manages Karma spending */
export function KarmaTimeGateSubpage(): React.ReactElement {
  const charityORG = (function () {
    if (Player.charityORG === null) throw new Error("Charity should not be null");
    return Player.charityORG;
  })();
  const [spend, setSpend] = React.useState(0);

  const sleeves: string[] = [];
  for (let slv = 0; slv < Player.sleeves.length; slv++) {
    sleeves.push(Player.sleeves[slv].whoAmI());
  }
  sleeves.push("All");

  function updateSpend(e: React.ChangeEvent<HTMLInputElement>): void {
    const spendVal = Number.parseInt(e.currentTarget.value);
    if (spendVal > Player.karma || spendVal < 0) {
      setSpend(0);
      e.currentTarget.value = "";
      return;
    }
    setSpend(spendVal);
  }
  function purchaseTimeGate(): void {
    if (spend > Player.karma) return;
    const timeskip = Math.floor((spend / 20) * 1000 - (spend / 20) * 1000 * ((Math.random() * 30) / 100));
    dialogBoxCreate(
      "Spent " +
        spend +
        "Karma for " +
        convertTimeMsToTimeElapsedString((spend / 20) * 1000, true) +
        "Seconds\n" +
        "Received: " +
        convertTimeMsToTimeElapsedString(timeskip, true) +
        " After Drain\n\n" +
        "Hold on for the reboot!",
    );
    Player.karma -= spend;
    charityORG.addKarmaMessage(
      "Spent " +
        formatNumber(spend, 0) +
        " on Time Gate resulting in " +
        convertTimeMsToTimeElapsedString(timeskip, true) +
        " time after drain.",
    );
    Player.lastUpdate -= timeskip;
    Engine._lastUpdate -= timeskip;
    saveObject.saveGame();
    setTimeout(() => location.reload(), 1000);
  }

  return (
    <Context.CharityORG.Provider value={charityORG}>
      <Box display="grid" sx={{ gridTemplateColumns: "1fr 3fr", lineHeight: "1em", whiteSpace: "pre" }}>
        <span>
          <Typography>
            The time gate is the most advanced tech that<br></br>
            charities have to offer. While it is not perfect,<br></br>
            it is far more accurate than it's counterpart.<br></br>
            The only downside is the karma conversion rate.<br></br>
            <br></br>
          </Typography>
          <Typography>Karma:</Typography>
          <Box display="grid" alignItems="center">
            <TextField
              type="number"
              style={{
                width: "100px",
              }}
              onChange={updateSpend}
              placeholder={String(spend)}
            />
            <Typography>
              Every 20 karma gives up to 1 second of time warp. <br></br>
              Effect Drain Off will be between 0-30%<br></br>
              <KarmaAvailable />
            </Typography>
          </Box>
          <Button onClick={() => purchaseTimeGate()}>Purchase Time Gate</Button>
        </span>
        <Typography>
          <br></br>
          {"                                _______"}
          <br></br>
          {"                        _,.--==###\\_/=###=-.._"}
          <br></br>
          {"                    ..-'     _.--\\\\_//---.    `-.."}
          <br></br>
          {"                 ./'    ,--''     \\_/     `---.   `\\."}
          <br></br>
          {"               ./ \\ .,-'      _,,......__      `-. / \\."}
          <br></br>
          {"             /`. ./\\'    _,.--'':_:'\"`:'` -..._    /\\. .'\\"}
          <br></br>
          {"            /  .'`./   ,-':\":._.:\":._.:\"+._.:`:.  \\.'`.  `."}
          <br></br>
          {"          ,'  //    .-''\"`:_:'\"`:_:'\"`:_:'\"`:_:'`.     \\   \\"}
          <br></br>
          {'         /   ,\'    /\'":._.:":._.:":._.:":._.:":._.`.    `.  \\'}
          <br></br>
          {"        /   /    ,'`:_:'\"`:_:'\"`:_:'\"`:_:'\"`:_:'\"`:_\\     \\  \\"}
          <br></br>
          {'       ,\\\\ ;     /_.:":._.:":._.:":._.:":._.:":._.:":\\     ://,'}
          <br></br>
          {"       / \\\\     /'\"`:_:'\"`:_:'\"`:_:'\"`:_:'\"`:_:'\"`:_:'\\    // \\."}
          <br></br>
          {'      |//_ \\   \':._.:":._.+":._.:":._.:":._.:":._.:":._\\  / _\\\\ \\'}
          <br></br>
          {"     /___../  /_:'\"`:_:'\"`:_:'\"`:_:'\"`:_:'\"`:_:'\"`:_:'\"'. \\..__ |"}
          <br></br>
          {'      |  |    \'":._.:":._.:":._.:":._.:":._.:":._.:":._.|    |  |'}
          <br></br>
          {"      |  |    |-:'\"`:_:'\"`:_:'\"`:_:'\"`:_:'\"`:_:'\"`:_:'\"`|    |  |"}
          <br></br>
          {'      |  |    |":._.:":._.:":._.:":._.:":._.+":._.:":._.|    |  |'}
          <br></br>
          {"      |  :    |_:'\"`:_:'\"`:_+'\"`:_:'\"`:_:'\"`:_:'\"`:_:'\"`|    ; |"}
          <br></br>
          {'      |   \\   \\.:._.:":._.:":._.:":._.:":._.:":._.:":._|    /  |'}
          <br></br>
          {"       \\   :   \\:'\"`:_:'\"`:_:'\"`:_:'\"`:_:'\"`:_:'\"`:_:'.'   ;  |"}
          <br></br>
          {'        \\  :    \\._.:":._.:":._.:":._.:":._.:":._.:":,\'    ;  /'}
          <br></br>
          {"        `.  \\    \\..--:'\"`:_:'\"`:_:'\"`:_:'\"`:_:'\"`-../    /  /"}
          <br></br>
          {'         `__.`.\'\' _..+\'._.:":._.:":._.:":._.:":.`+._  `-,:__`'}
          <br></br>
          {"      .-''    _ -' .'| _________________________ |`.`-.     `-.._"}
          <br></br>
          {"_____'   _..-|| :.' .+/;;';`;`;;:`)+(':;;';',`\\;\\|. `,'|`-.      `_____"}
          <br></br>
          {"      .-'   .'.'  :- ,'/,',','/ /./|\\.\\ \\`,`,-,`.`. : `||-.`-._"}
          <br></br>
          {"          .' ||.-' ,','/,' / / / + : + \\ \\ \\ `,\\ \\ `.`-||  `.  `-."}
          <br></br>
          {"       .-'   |'  _','<', ,' / / // | \\\\ \\ \\ `, ,`.`. `. `.   `-."}
          <br></br>
          {"                                   :              - `. `."}
        </Typography>
      </Box>
    </Context.CharityORG.Provider>
  );
}
