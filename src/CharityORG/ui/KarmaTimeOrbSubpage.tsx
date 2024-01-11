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

/** React Component for the popup that manages Karma spending */
export function KarmaTimeOrbSubpage(): React.ReactElement {
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
  function purchaseTimeOrb(): void {
    if (spend > Player.karma) return;
    const timeskip = Math.floor((spend / 10) * 1000 - (spend / 10) * 1000 * ((Math.random() * 90) / 100));
    dialogBoxCreate(
      "Spent " +
        spend +
        "Karma for " +
        convertTimeMsToTimeElapsedString((spend / 10) * 1000, true) +
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
        " on Time Orb resulting in " +
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
            The time orb is the first steping stone<br></br>
            of time travel that various Charities have developed.<br></br>
            Far from perfect, these require an enormous amount of<br></br>
            Karma to power and comes with a large amount of uncertainty.<br></br>
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
              Every 10 karma gives up to 1 second of time warp. <br></br>
              Effect Drain Off will be between 0-90%<br></br>
              Available:{formatNumber(Player.karma)}
            </Typography>
          </Box>
          <Button onClick={() => purchaseTimeOrb()}>Purchase Time Orb</Button>
        </span>
        <Typography>
          <br></br>
          {"                __gggrgM**M#mggg__"}
          <br></br>
          {'           __wgNN@"B*P""mp""@d#"@N#Nw__'}
          <br></br>
          {"         _g#@0F_a*F#  _*F9m_ ,F9*__9NG#g_"}
          <br></br>
          {'      _mN#F  aM"    #p"    !q@    9NL "9#Qu_'}
          <br></br>
          {'     g#MF _pP"L  _g@"9L_  _g""#__  g"9w_ 0N#p'}
          <br></br>
          {'   _0F jL*"   7_wF     #_gF     9gjF   "bJ  9h_'}
          <br></br>
          {"  j#  gAF    _@NL     _g@#_      J@u_    2#_  #_"}
          <br></br>
          {' ,FF_#" 9_ _#"  "b_  g@   "hg  _#"  !q_ jF "*_09_'}
          <br></br>
          {' F N"    #p"      Ng@       `#g"      "w@    "# t'}
          <br></br>
          {'j p#    g"9_     g@"9_      gP"#_     gF"q    Pb L'}
          <br></br>
          {'0J  k _@   9g_ j#"   "b_  j#"   "b_ _d"   q_ g  ##'}
          <br></br>
          {'#F  `NF     "#g"       "Md"       5N#      9W"  j#'}
          <br></br>
          {'#k  jFb_    g@"q_     _*"9m_     _*"R_    _#Np  J#'}
          <br></br>
          {'tApjF  9g  J"   9M_ _m"    9%_ _*"   "#  gF  9_jNF'}
          <br></br>
          {' k`N    "q#       9g@        #gF       ##"    #"j'}
          <br></br>
          {' `_0q_   #"q_    _&"9p_    _g"`L_    _*"#   jAF,\''}
          <br></br>
          {'  9# "b_j   "b_ g"    *g _gF    9_ g#"  "L_*"qNF'}
          <br></br>
          {'   "b_ "#_    "NL      _B#      _I@     j#" _#"'}
          <br></br>
          {'     NM_0" * g_ j""9u_  gP  q_  _w@ ]_ _g*"F_g@'}
          <br></br>
          {'      "NNh_ !w#_   9#g"    "m*"   _#*" _dN@"'}
          <br></br>
          {'         9##g_0@q__ #"4_  j*"k __*NF_g#@P"'}
          <br></br>
          {'           "9NN#gIPNL_ "b@" _2M"Lg#N@F"'}
          <br></br>
          {'               ""P@*NN#gEZgNN@#@P""'}
        </Typography>
      </Box>
    </Context.CharityORG.Provider>
  );
}
