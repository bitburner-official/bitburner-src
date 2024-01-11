import React from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { formatNumber } from "../../ui/formatNumber";
import Box from "@mui/material/Box";
import { MenuItem, TextField } from "@mui/material";
import { Player } from "@player";
import { useRerender } from "../../ui/React/hooks";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { LotteryConstants } from "../../../src/Lottery/data/LotteryConstants";
import { buyRandomTicket } from "../../../src/Lottery/Lotto";

/** React Component for the popup that manages Karma spending */
export function ItemsItemsSubpage(): React.ReactElement {
  const charityORG = (function () {
    if (Player.charityORG === null) throw new Error("Charity should not be null");
    return Player.charityORG;
  })();
  const [spend, setSpend] = React.useState(0);
  const [boost, setBoost] = React.useState("");
  const [boostDesc, setBoostDesc] = React.useState("Please select an item from the drop down menu");
  const [boostDescBuy, setBoostDescBuy] = React.useState("You will see how effective an item is here.");
  const [boostButton, setBoostButton] = React.useState("None Selected");
  const [boostConvert, setBoostConvert] = React.useState("None Selected");
  const rerender = useRerender();

  const list = ["Lucky Coins", "Ascension Tokens", "Decoy Juice", "Random Dice", "Java Juice", "Ticket Stubs"];

  const lucky =
    "Lucky Coins have many uses.  They can be transformed into any other item, used to cancel events without penalty, refresh pending events (If you have no active events), and they can be used to purchase Quantom Tickets!  Quantom Tickets are lottery tickets that replenish with each reset.";
  const ascension =
    "Want to ascend a volunteer?  You will need 1 of these tokens to do so.  Ascension resets your volunteer, but they come back stronger.";
  const decoy =
    "Some juice you drink, some you spray.  This you spray.  Made from the pheremones of various Influencers from all the social platforms, this will draw the attention of everyone away from you for a time.";
  const random =
    "Fuzzy dice that once lived on a car mirror.  You can use these dice to either add or subtract from your current random count.";
  const java =
    "Sometime in the early 21st century, corporations did away with coffee.  This led to a new revolution of discovered cafinated beverages, and as time passed, more and more were re-discovered.  This is 'Hot Brown Morning Drink'";
  const ticket =
    "A random lottery ticket voucher given to you by a client.  Redeem it at any time and then cash it in to see if it's a winner!";

  const quantomCost =
    Player.quantomTickets >= LotteryConstants.MaxTickets ? Number.POSITIVE_INFINITY : Player.quantomTickets * 2 + 1;
  const luckyBuy =
    "Current cost: (" +
    quantomCost +
    ") -  Lucky Coins can purchase Quantom Tickets, but their cost goes up with each one purchased.";
  const ascensionBuy =
    "Ascension Tokens are used in the Management page directly.  You can convert a Lucky Token to 5 Ascension Tokens.";
  const decoyBuy =
    "Every 1 Decoy Juice will provide you with 60 seconds of Stop Attacks (Cancells out Fast Attacks first).";
  const randomBuy = "Every 1 Random Dice will either increase or decrease your Random Count.  Use either +/- here.";
  const javaBuy = "Every 1 Java Juice will provide you with 60 seconds of Fast Tasks (Cancells out Slow Tasks first).";
  const ticketBuy =
    "Every 1 Ticket Stub converts into a random, max priced Lottery Ticket.  Can only convert if you can hold the ticket.";

  const luckyUse = "Purchase Quantom Ticket";
  const ascensionUse = "Use in Management";
  const decoyUse = "Use Decoy Juice";
  const randomUse = "Use Random Dice";
  const javaUse = "Use Java";
  const ticketUse = "Convert Ticket Stub";

  const luckyConvert = "Cannot Convert";
  const ascensionConvert = "Convert 1 Lucky to 5 Ascension Tokens";
  const decoyConvert = "Convert 1 Lucky to 5 Decoy Juice";
  const randomConvert = "Convert 1 Lucky to 5 Random Dice";
  const javaConvert = "Convert 1 Lucky to 5 Java Juice";
  const ticketConvert = "Convert 1 Lucky to 1000 tickets";

  function onBoostChange(event: SelectChangeEvent): void {
    setBoost(event.target.value);
    switch (event.target.value) {
      case "Lucky Coins":
        setBoostDesc(lucky);
        setBoostDescBuy(luckyBuy);
        setBoostButton(luckyUse);
        setBoostConvert(luckyConvert);
        break;
      case "Ascension Tokens":
        setBoostDesc(ascension);
        setBoostDescBuy(ascensionBuy);
        setBoostButton(ascensionUse);
        setBoostConvert(ascensionConvert);
        break;
      case "Decoy Juice":
        setBoostDesc(decoy);
        setBoostDescBuy(decoyBuy);
        setBoostButton(decoyUse);
        setBoostConvert(decoyConvert);
        break;
      case "Random Dice":
        setBoostDesc(random);
        setBoostDescBuy(randomBuy);
        setBoostButton(randomUse);
        setBoostConvert(randomConvert);
        break;
      case "Java Juice":
        setBoostDesc(java);
        setBoostDescBuy(javaBuy);
        setBoostButton(javaUse);
        setBoostConvert(javaConvert);
        break;
      case "Ticket Stubs":
        setBoostDesc(ticket);
        setBoostDescBuy(ticketBuy);
        setBoostButton(ticketUse);
        setBoostConvert(ticketConvert);
        break;
      default:
        break;
    }
    rerender();
  }

  function updateSpend(e: React.ChangeEvent<HTMLInputElement>): void {
    const spendVal = Number.parseInt(e.currentTarget.value);
    if (spendVal < 0 && boost !== "Random Dice") {
      setSpend(0);
      e.currentTarget.value = "";
      return;
    }
    setSpend(spendVal);
  }

  function purchaseConvert(): void {
    if (spend <= 0 || spend > charityORG.luckyCoin) return;

    //const list = ["Lucky Coins", "Ascension Tokens", "Decoy Juice", "Random Dice", "Java Juice", "Ticket Stubs"];
    switch (boost) {
      case "Lucky Coins":
        dialogBoxCreate("Cannot convert a lucky coin.");
        break;
      case "Ascension Tokens":
        // 1 lucky = 5 ascension tokens
        charityORG.ascensionToken += 5 * spend;
        charityORG.luckyCoin -= spend;
        charityORG.addItemUseMessage("Converted " + spend + " lucky coins into " + spend * 5 + " ascension tokens");
        return;
      case "Decoy Juice":
        // 1 lucky = 5 decoy juice
        charityORG.decoyJuice += 5 * spend;
        charityORG.luckyCoin -= spend;
        charityORG.addItemUseMessage("Converted " + spend + " lucky coins into " + spend * 5 + " decoy juice");
        break;
      case "Random Dice":
        // 1 lucky = 5 random dice
        charityORG.randomDice += 5 * spend;
        charityORG.luckyCoin -= spend;
        charityORG.addItemUseMessage("Converted " + spend + " lucky coins into " + spend * 5 + " random dice");
        break;
      case "Java Juice":
        // 1 lucky = 5 java juice
        charityORG.javaJuice += 5 * spend;
        charityORG.luckyCoin -= spend;
        charityORG.addItemUseMessage("Converted " + spend + " lucky coins into " + spend * 5 + " java juice");
        break;
      case "Ticket Stubs":
        // 1 lucky = 1000 ticket stubs
        charityORG.ticketStub += 1000 * spend;
        charityORG.luckyCoin -= spend;
        charityORG.addItemUseMessage("Converted " + spend + " lucky coins into " + spend * 1000 + " ticket stubs");
        break;
      default:
        return;
    }
    setSpend(0);
    rerender();
  }

  function purchaseBoost(): void {
    if (spend === 0) return;

    switch (boost) {
      case "Lucky Coins": {
        if (spend > charityORG.luckyCoin || spend < quantomCost || Player.quantomTickets >= LotteryConstants.MaxTickets)
          return;
        Player.quantomTickets++;
        charityORG.luckyCoin -= quantomCost;
        charityORG.addItemUseMessage("Purchased a Quantom Ticket!");
        break;
      }
      case "Ascension Tokens": {
        dialogBoxCreate("Spend Ascension Tokens in the Management section.");
        return;
      }
      case "Decoy Juice": {
        //Remove Fast Atks and add Stop Atks - 60s worth
        if (spend > charityORG.decoyJuice) return;

        const decoyTime = spend * (5 * 60);
        if (charityORG.fastAttacks > 0) {
          if (charityORG.fastAttacks > decoyTime) charityORG.fastAttacks -= decoyTime;
          else {
            charityORG.stopAttacks += decoyTime - charityORG.fastAttacks;
            charityORG.fastAttacks = 0;
          }
        } else {
          charityORG.stopAttacks += decoyTime;
        }
        charityORG.decoyJuice -= spend;
        charityORG.addItemUseMessage("Used " + spend + " decoy juice for " + decoyTime + " stop attack time.");
        break;
      }
      case "Random Dice": {
        // +/- random stat.  Can be negative spend
        if (Math.abs(spend) > charityORG.randomDice) return;

        charityORG.random += spend;
        charityORG.randomDice -= Math.abs(spend);
        charityORG.addItemUseMessage("Used " + Math.abs(spend) + " random dice for " + spend + " random events.");
        break;
      }
      case "Java Juice": {
        //Remove Slow Tasks and add Fast Tasks - 60s worth
        if (spend > charityORG.javaJuice) return;

        const taskTime = spend * (5 * 60);
        if (charityORG.slowTasks > 0) {
          if (charityORG.slowTasks > taskTime) charityORG.slowTasks -= taskTime;
          else {
            charityORG.fastTasks += taskTime - charityORG.slowTasks;
            charityORG.slowTasks = 0;
          }
        } else {
          charityORG.fastTasks += taskTime;
        }
        charityORG.javaJuice -= spend;
        charityORG.addItemUseMessage("Used " + spend + " java juice for " + taskTime + " fast task time.");
        break;
      }
      case "Ticket Stubs": {
        //Convert to random tickets
        if (Player.lotteryTickets.length + spend > LotteryConstants.MaxTickets || spend > charityORG.ticketStub) return;
        for (let i = 0; i < spend; i++) buyRandomTicket();
        charityORG.addItemUseMessage("Used " + spend + " ticket stubs and purchased " + spend + " lottery tickets.");
        charityORG.ticketStub -= spend;
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
        <Box display="grid" sx={{ flex: "none", width: "900px", gridTemplateColumns: "7fr 1fr 7fr" }}>
          <span>
            <Typography>Select your item:</Typography>
            <Select onChange={onBoostChange} value={boost} sx={{ height: "min-content", width: "100%", mb: 1 }}>
              {list.map((k, i) => (
                <MenuItem key={i + 1} value={k}>
                  <Typography variant="h6">{k}</Typography>
                </MenuItem>
              ))}
            </Select>
            <br></br>
            <br></br>
            <Typography variant="body1">{boostDesc}</Typography>
            <br></br>
            <br></br>
          </span>
          <span>&nbsp&nbsp</span>
          <div>
            <Typography variant="h6">Items:</Typography>
            <Typography variant="body1">Lucky Coins: {formatNumber(charityORG.luckyCoin, 2)}</Typography>
            <Typography variant="body1">Ascension Tokens: {formatNumber(charityORG.ascensionToken, 2)}</Typography>
            <Typography variant="body1">Decoy Juice: {formatNumber(charityORG.decoyJuice, 2)}</Typography>
            <Typography variant="body1">Random Dice: {formatNumber(charityORG.randomDice, 2)}</Typography>
            <Typography variant="body1">Java Juice: {formatNumber(charityORG.javaJuice, 2)}</Typography>
            <Typography variant="body1">Ticket Stub: {formatNumber(charityORG.ticketStub, 2)}</Typography>
            <Typography variant="body1">Quantom Tickets: {formatNumber(Player.quantomTickets, 2)}</Typography>
          </div>
        </Box>
      </span>
      <Typography>Spend:</Typography>
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
          <br></br>
        </Typography>
      </Box>
      <Button onClick={() => purchaseBoost()}>{boostButton}</Button>{" "}
      <Button onClick={() => purchaseConvert()}>{boostConvert}</Button>
    </>
  );
}
