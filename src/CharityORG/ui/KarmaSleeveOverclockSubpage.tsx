import React, { useState } from "react";
import { Context } from "./Context";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Player } from "@player";
import { MenuItem, TextField } from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { useRerender } from "../../ui/React/hooks";
import { formatNumber } from "../../ui/formatNumber";
//import { KarmaCharityBankSubpage } from "./KarmaCharityBankSubpage";

let spend = 0;

//interface ISleeveSelectProps {
//  sleeve: number;
// rerender: () => void;
//}

//interface IPanelProps {
//  sleeve: Sleeve;
//}

/** React Component for the popup that manages Karma spending */
export function KarmaSleeveOverclockSubpage(): React.ReactElement {
  const charityORG = (function () {
    if (Player.charityORG === null) throw new Error("Charity should not be null");
    return Player.charityORG;
  })();
  const rerender = useRerender();
  const [, setValue] = React.useState(0);
  const [currentCategory, setCurrentCategory] = useState("0");
  const onChange = (event: SelectChangeEvent): void => {
    setCurrentCategory(event.target.value);
    rerender();
  };
  const sleeves: string[] = [];
  for (let slv = 0; slv < Player.sleeves.length; slv++) {
    sleeves.push(Player.sleeves[slv].whoAmI());
  }
  sleeves.push("All");

  function updateSpend(e: React.ChangeEvent<HTMLInputElement>): void {
    spend = parseInt(e.currentTarget.value);
    if (isNaN(spend)) {
      spend = 0;
    }
    if (spend > Player.karma) {
      spend = 0;
    }
    if (spend < 0) {
      spend = 0;
    }
    setValue(spend);
    e.currentTarget.value = spend > 0 ? spend.toString() : "";
  }
  function purchaseOverclock(): void {
    if (currentCategory === String(Player.sleeves.length)) {
      // All is triggered
      const divided = (spend * 2.5) / Player.sleeves.length;
      for (let slv = 0; slv < Player.sleeves.length; slv++) {
        Player.sleeves[slv].storedCycles += divided;
      }
    } else {
      Player.sleeves[Number(currentCategory)].storedCycles += spend * 2.5;
    }
    Player.karma -= spend;
  }

  const categories: Record<string, string[][]> = {
    Sleeves: [sleeves],
  };

  return (
    <Context.CharityORG.Provider value={charityORG}>
      <Box display="flex">
        <Typography>
          <br></br>Choose your Sleeve:
        </Typography>
      </Box>
      <span>
        <Select onChange={onChange} value={currentCategory} sx={{ width: "25%", mb: 1 }}>
          {Object.keys(categories.Sleeves[0]).map((k, i) => (
            <MenuItem key={i + 1} value={k}>
              <Typography variant="h6">{Player.sleeves.length === i ? "All" : k}</Typography>
            </MenuItem>
          ))}
        </Select>
      </span>
      <br></br>
      <Typography>Karma:</Typography>
      <Box display="flex" alignItems="center">
        <TextField
          type="number"
          style={{
            width: "100px",
          }}
          onChange={updateSpend}
          placeholder={String(spend)}
        />
        <Typography>
          Every 1 karma gives .5 seconds of overclock to a sleeve. If all is selected, will divide it evenly<br></br>
          Available:{formatNumber(Player.karma)}
        </Typography>
      </Box>
      <Button onClick={() => purchaseOverclock()}>Purchase Sleeve Overclock</Button>
    </Context.CharityORG.Provider>
  );

  //<>
  //  <Box display="flex">
  //    <Typography>Charties have the ability to spend their Karma on various things.  This is your entry point into that realm.  Purchases are not cheap, but they can be powerful.<br></br>
  //    Select what you would like to spend your Karma on:</Typography>
  // </Box>
  // {value === 0 && <ManagementSubpage />}
  // {value === 1 && <EquipmentsSubpage />}
  // {value === 2 && <KarmaSubpage />}
  //</>
  //);
}
