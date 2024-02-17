import React from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { formatNumber, formatMoney } from "../../ui/formatNumber";
import Box from "@mui/material/Box";
import { MenuItem, TextField } from "@mui/material";
import { Player } from "@player";
import { useRerender } from "../../ui/React/hooks";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { Factions } from "../../Faction/Factions";

/** React Component for the popup that manages Karma spending */
export function KarmaCharityGeneralSubpage(): React.ReactElement {
  const charityORG = (function () {
    if (Player.charityORG === null) throw new Error("Charity should not be null");
    return Player.charityORG;
  })();
  const [spend, setSpend] = React.useState(0);
  const [boost, setBoost] = React.useState("");
  const [boostDesc, setBoostDesc] = React.useState("Please select a boost from the drop down menu");
  const [boostDescBuy, setBoostDescBuy] = React.useState("You will see how much karma it takes to do what here.");
  const [boostButton, setBoostButton] = React.useState("None Selected");
  const rerender = useRerender();

  const list = ["Bank", "Debt Relief", "Prestige", "Reputation"];
  const bank = "Increases the money in your bank.  $100,000 per karma spent.  Goes to debt first.";
  const debt =
    "Reduces your debt load.  Has no effect if you are not in debt.  Minimum spend of 101 karma.  Formula for debt reduction is: debt /= spend / 100.";
  const prestige = "Increases your prestige.  This increase will be spread evenly among all your volunteers.";
  const reputation = "Increases your reputation with the charity.";

  const bankBuy = "Every 1 Karma gives you $100,000 in the bank.";
  const debtBuy = "Every 1 Karma recudes your debt load.  Min spend is 101";
  const prestigeBuy = "Every 1 Karma gives you 5 prestige";
  const reputationBuy = "Every 1 Karma gives you 10 reputation";

  const bankBuyButton = "Purchase Bank";
  const debtBuyButton = "Purchase Debt Relief";
  const prestigeBuyButton = "Purchase Prestige";
  const reputationBuyButton = "Purchase Reputation";

  function onBoostChange(event: SelectChangeEvent): void {
    setBoost(event.target.value);
    switch (event.target.value) {
      case "Bank":
        setBoostDesc(bank);
        setBoostDescBuy(bankBuy);
        setBoostButton(bankBuyButton);
        break;
      case "Debt Relief":
        setBoostDesc(debt);
        setBoostDescBuy(debtBuy);
        setBoostButton(debtBuyButton);
        break;
      case "Prestige":
        setBoostDesc(prestige);
        setBoostDescBuy(prestigeBuy);
        setBoostButton(prestigeBuyButton);
        break;
      case "Reputation":
        setBoostDesc(reputation);
        setBoostDescBuy(reputationBuy);
        setBoostButton(reputationBuyButton);
        break;
      default:
        break;
    }
    rerender();
  }

  function updateSpend(e: React.ChangeEvent<HTMLInputElement>): void {
    const spendVal = Number.parseInt(e.currentTarget.value);
    if (spendVal > Player.karma || spendVal < 0) {
      setSpend(0);
      e.currentTarget.value = "";
      return;
    }
    setSpend(spendVal);
  }

  function purchaseBoost(): void {
    if (spend > Player.karma || spend === 0) return;

    //const list = ["Bank", "Debt Relief", "Prestige", "Reputation"];

    switch (boost) {
      case "Bank": {
        const bankPoints = spend * 100000;
        charityORG.bank += bankPoints;
        charityORG.addKarmaMessage(
          "Spent " + formatNumber(spend, 0) + " on " + formatMoney(spend * 100000) + " for the bank",
        );
        Player.karma -= spend;
        break;
      }
      case "Debt Relief": {
        if (spend < 101) return;
        const startMoney = charityORG.bank;
        charityORG.bank /= spend / 100;
        charityORG.addKarmaMessage(
          "Spent " +
            formatNumber(spend, 0) +
            " on " +
            formatMoney((charityORG.bank - startMoney) * -1) +
            " dedt relief",
        );
        Player.karma -= spend;
        break;
      }
      case "Prestige": {
        const prestige = (spend * 5) / charityORG.volunteers.length;
        for (const volunteer of charityORG.volunteers) {
          volunteer.earnedPrestige += prestige;
        }
        charityORG.prestige += spend * 5;
        charityORG.addKarmaMessage(
          "Spent " + formatNumber(spend, 0) + " on " + formatNumber(spend * 5, 0) + " prestige",
        );
        Player.karma -= spend;
        break;
      }
      case "Reputation": {
        Factions.Charity.playerReputation += spend * 500;
        charityORG.addKarmaMessage(
          "Spent " + formatNumber(spend, 0) + " on " + formatNumber(spend * 10, 0) + " reputation",
        );
        Player.karma -= spend;
        break;
      }
      default:
        return;
    }

    setSpend(0);
    rerender();
  }
  return (
    <>
      <span>
        <Typography>Select your boost:</Typography>
        <Box display="grid" sx={{ gridTemplateColumns: "1fr 3fr" }}>
          <Select onChange={onBoostChange} value={boost} sx={{ width: "80%", mb: 1 }}>
            {list.map((k, i) => (
              <MenuItem key={i + 1} value={k}>
                <Typography variant="h6">{k}</Typography>
              </MenuItem>
            ))}
          </Select>
          <Typography>{boostDesc}</Typography>
        </Box>
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
            {boostDescBuy}
            <br></br>
            Available: {formatNumber(Player.karma)}
          </Typography>
        </Box>
        <Button onClick={() => purchaseBoost()}>{boostButton}</Button>
      </span>
    </>
  );
}
