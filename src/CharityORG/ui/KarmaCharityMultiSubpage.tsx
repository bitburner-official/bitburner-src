import React from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { formatNumber } from "../../ui/formatNumber";
import Box from "@mui/material/Box";
import { MenuItem, TextField } from "@mui/material";
import { Player } from "@player";
import { useRerender } from "../../ui/React/hooks";
import Select, { SelectChangeEvent } from "@mui/material/Select";

/** React Component for the popup that manages Karma spending */
export function KarmaCharityMultiSubpage(): React.ReactElement {
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

  const list = ["Boost Visibility", "Reduce Terror", "Slow Attacks", "Fast Tasks", "Time Booster"];
  const boostVis =
    "Boost the gains of Visibility.  More effective at higher levels.  Will cancel out any Visibility Drain time before becoming active";
  const reduceTerror =
    "Reduce the effect of Terror gains.  More effective at higher levels.  Will cancel out any Terror Drain time before becoming active";
  const slowAtks = "Reduces the timer of Fast Attacks.";
  const fastTasks = "Increases the effectiveness of tasks.  Will cancel out any Slow Task time before becoming active";
  const timeBoost = "Add time to your charities reserves, allowing it to run much faster!";

  const boostVisBuy =
    "Every 1 Karma gives you 0.25 seconds of visibility boost.  Will cancel out visibility drain first.";
  const reduceTerrorBuy = "Every 1 Karma gives you 0.25 seconds of terror boost.  Will cancel out terror drain first.";
  const slowAtksBuy = "Every 1 Karma removes 0.25 seconds of fast attacks.";
  const fastTasksBuy = "Every 1 Karma gives you 0.25 seconds of fast tasks.  Will cancel out slow tasks first.";
  const timeBoostBuy = "Every 1 Karma gives you 0.25 seconds of time boost";

  const boostVisBuyButton = "Purchase Vis";
  const reduceTerrorBuyButton = "Purchase Terror";
  const slowAtksBuyButton = "Purchase Atk";
  const fastTasksBuyButton = "Purchase Task";
  const timeBoostBuyButton = "Purchase Time";

  function onBoostChange(event: SelectChangeEvent): void {
    setBoost(event.target.value);
    switch (event.target.value) {
      case "Boost Visibility":
        setBoostDesc(boostVis);
        setBoostDescBuy(boostVisBuy);
        setBoostButton(boostVisBuyButton);
        break;
      case "Reduce Terror":
        setBoostDesc(reduceTerror);
        setBoostDescBuy(reduceTerrorBuy);
        setBoostButton(reduceTerrorBuyButton);
        break;
      case "Slow Attacks":
        setBoostDesc(slowAtks);
        setBoostDescBuy(slowAtksBuy);
        setBoostButton(slowAtksBuyButton);
        break;
      case "Fast Tasks":
        setBoostDesc(fastTasks);
        setBoostDescBuy(fastTasksBuy);
        setBoostButton(fastTasksBuyButton);
        break;
      case "Time Booster":
        setBoostDesc(timeBoost);
        setBoostDescBuy(timeBoostBuy);
        setBoostButton(timeBoostBuyButton);
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

    switch (boost) {
      case "Boost Visibility": {
        const visPoints = (spend * 5) / 4;
        if (charityORG.visibilityDrain > 0) {
          if (charityORG.visibilityDrain >= visPoints) charityORG.visibilityDrain -= visPoints;
          else {
            charityORG.visibilityBooster += visPoints - charityORG.visibilityDrain;
            charityORG.visibilityDrain = 0;
          }
        } else {
          charityORG.visibilityBooster += visPoints;
        }
        charityORG.addKarmaMessage(
          "Spent " + formatNumber(spend, 0) + " on " + formatNumber(spend * 5, 0) + " visibility boost",
        );
        Player.karma -= spend;
        break;
      }
      case "Reduce Terror": {
        const terrorPoints = (spend * 5) / 4;
        if (charityORG.terrorDrain > 0) {
          if (charityORG.terrorDrain >= terrorPoints) charityORG.terrorDrain -= terrorPoints;
          else {
            charityORG.terrorBooster += terrorPoints - charityORG.terrorDrain;
            charityORG.terrorDrain = 0;
          }
        } else {
          charityORG.terrorBooster += terrorPoints;
        }
        charityORG.addKarmaMessage(
          "Spent " + formatNumber(spend, 0) + " on " + formatNumber(spend * 5, 0) + " terror boost",
        );
        Player.karma -= spend;
        break;
      }
      case "Slow Attacks": {
        if (charityORG.fastAttacks > 0) {
          const slowAtksPtsNeeded = (charityORG.fastAttacks / 5) * 4;
          const slowAtksPointsTotal = (spend * 5) / 4;
          if (slowAtksPtsNeeded >= slowAtksPointsTotal) {
            charityORG.fastAttacks -= slowAtksPointsTotal;
            Player.karma -= spend;
            charityORG.addKarmaMessage(
              "Spent " + formatNumber(spend, 0) + " on " + formatNumber(spend * 5, 0) + " slow attakcs",
            );
          } else {
            charityORG.fastAttacks = 0;
            Player.karma -= (slowAtksPtsNeeded / 5) * 4;
            charityORG.addKarmaMessage(
              "Spent " +
                formatNumber((slowAtksPtsNeeded / 5) * 4, 0) +
                " on " +
                formatNumber((slowAtksPtsNeeded / 5) * 4 * 5, 0) +
                " slow attakcs",
            );
          }
        }
        break;
      }
      case "Fast Tasks": {
        const fTaskPoints = (spend * 5) / 4;
        if (charityORG.slowTasks > 0) {
          if (charityORG.slowTasks >= fTaskPoints) charityORG.slowTasks -= fTaskPoints;
          else {
            charityORG.fastTasks += fTaskPoints - charityORG.slowTasks;
            charityORG.slowTasks = 0;
          }
        } else {
          charityORG.fastTasks += fTaskPoints;
        }
        charityORG.addKarmaMessage(
          "Spent " + formatNumber(spend, 0) + " on " + formatNumber(spend * 5, 0) + " fast tasks",
        );
        Player.karma -= spend;
        break;
      }
      case "Time Booster": {
        const timePoints = (spend * 5) / 4;
        charityORG.storedCycles += timePoints;
        Player.karma -= spend;
        charityORG.addKarmaMessage(
          "Spent " + formatNumber(spend, 0) + " on " + formatNumber(spend * 2.5, 0) + " time boost",
        );
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
