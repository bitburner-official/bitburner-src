import React, { useState } from "react";
import Typography from "@mui/material/Typography";
import { EventCard } from "./EventCard";
import { ListItemButton } from "@mui/material";
import Box from "@mui/material/Box";
import { Player } from "@player";
import Button from "@mui/material/Button";
import { CharityEvent } from "../CharityEvent";
import { useRerender } from "../../ui/React/hooks";

/** React Component for the popup that manages Karma spending */
export function EventSubpage(): React.ReactElement {
  const charityORG = (function () {
    if (Player.charityORG === null) throw new Error("Charity should not be null");
    return Player.charityORG;
  })();
  const [currentCategory, setCurrentCategory] = useState("");
  const [pendingCategory, setPendingCategory] = useState("");
  const [attackCategory, setAttackCategory] = useState("");
  useRerender(200);

  if (currentCategory !== "" && !charityORG.currentEvents.find((f) => f.name === currentCategory))
    setCurrentCategory("");
  if (attackCategory !== "" && !charityORG.currentEvents.find((f) => f.name === attackCategory)) setAttackCategory("");
  if (pendingCategory !== "" && !charityORG.waitingEvents.find((f) => f.name === pendingCategory))
    setPendingCategory("");

  function abandonEvent(): void {
    const event = charityORG.currentEvents.find((f) => f.name === currentCategory);
    if (event === undefined) return;
    const index = charityORG.currentEvents.indexOf(event);
    charityORG.currentEvents.splice(index, 1);

    charityORG.addMessage("Abandoned: " + event.shortName);
    setCurrentCategory("");
    event.processDeath();
    charityORG.processNewEvents(0);
  }
  function acceptEvent(): void {
    const event = charityORG.waitingEvents.find((f) => f.name === pendingCategory);
    if (event === undefined) return;
    const index = charityORG.waitingEvents.indexOf(event);
    charityORG.waitingEvents.splice(index, 1);
    event.cyclesElapsed = 0;
    charityORG.currentEvents.push(event);
    charityORG.addMessage("Accepted: " + event.shortName);
    setPendingCategory("");
    charityORG.processNewEvents(0);
  }
  function luckyCancelEvent(): void {
    if (charityORG.luckyCoin < 1) return;
    const event = charityORG.currentEvents.filter((f) => f.isBeneficial).find((f) => f.name === currentCategory);
    if (event === undefined) return;
    const index = charityORG.currentEvents.indexOf(event);
    charityORG.currentEvents.splice(index, 1);
    charityORG.addItemUseMessage("Lucky Cancelled: " + event.shortName);
    charityORG.luckyCoin--;
    setCurrentCategory("");
    event.processRemoval();
    charityORG.processNewEvents(0);
  }
  function luckyCancelAttack(): void {
    if (charityORG.luckyCoin < 1) return;
    const event = charityORG.currentEvents.filter((f) => !f.isBeneficial).find((f) => f.name === attackCategory);
    if (event === undefined) return;
    const index = charityORG.currentEvents.indexOf(event);
    charityORG.currentEvents.splice(index, 1);
    charityORG.addItemUseMessage("Lucky Cancelled: " + event.shortName);
    charityORG.luckyCoin--;
    setAttackCategory("");
    event.processRemoval();
    charityORG.processNewEvents(0);
  }
  function luckyReset(): void {
    if (charityORG.luckyCoin < 1) return;
    if (charityORG.currentEvents.filter((f) => f.isBeneficial).length > 0) return; //Cannot refresh while you have active events
    charityORG.waitingEvents.length = 0;

    for (let i = 0; i < 5; i++) {
      const event = new CharityEvent("good event", true, false, 10000);
      event.randomize(true);
      charityORG.waitingEvents.push(event);

      const fundraise = new CharityEvent("good event", true, false, 10000);
      fundraise.randomize(true, true);
      charityORG.waitingEvents.push(fundraise);
    }

    charityORG.addItemUseMessage("Lucky Refreshed!");
    charityORG.luckyCoin--;
    setPendingCategory("");

    charityORG.processNewEvents(0);
  }

  // <Context.CharityORG.Provider value={charityORG}>
  return (
    <>
      <Box display="flex">
        <Typography>
          Charities help those in need. Here you can see those requests. Alongside of them, you can also see any attacks
          that are being made against you. Scroll up/down if the list is full.<br></br>
          <br></br>
        </Typography>
      </Box>
      <Box display="grid" width="100%" sx={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
        <span>
          <Typography>Current Actions:</Typography>
          <Typography>{charityORG.currentEvents.filter((e) => e.isBeneficial === true).length}</Typography>
          <Box sx={{ height: 220, overflow: "scroll", border: "1px solid", borderBlockColor: "yellow" }}>
            {charityORG.currentEvents
              .filter((n) => n.isBeneficial === true)
              .map((k, i) => (
                <ListItemButton
                  sx={{ height: 0, marginTop: 0.9, marginBottom: 0.9 }}
                  key={i + 1}
                  onClick={() => setCurrentCategory(k.name)}
                  selected={currentCategory === k.name}
                >
                  <Typography>
                    {i + 1 + "-"}
                    {k.shortName.substring(0, 50)}
                  </Typography>
                </ListItemButton>
              ))}
          </Box>
          <br></br>
          <Button title="Triggers death effects" onClick={() => abandonEvent()}>
            Abandon Event
          </Button>{" "}
          <Button title="Costs 1 lucky coin" onClick={() => luckyCancelEvent()}>
            Lucky Cancel
          </Button>
          {EventCard(
            charityORG.currentEvents.find((f) => f.name === currentCategory),
            false,
          )}
        </span>
        <span>
          <Typography>Pending Actions:</Typography>
          <Typography>{charityORG.waitingEvents.length}</Typography>
          <Box sx={{ height: 220, overflow: "scroll", border: "1px solid", borderBlockColor: "yellow" }}>
            {charityORG.waitingEvents.map((k, i) => (
              <ListItemButton
                sx={{ height: 0, marginTop: 0.9, marginBottom: 0.9 }}
                key={i + 1}
                onClick={() => setPendingCategory(k.name)}
                selected={pendingCategory === k.name}
              >
                <Typography>
                  {i + 1 + "-"}
                  {k.shortName.substring(0, 50)}
                </Typography>
              </ListItemButton>
            ))}
          </Box>
          <br></br>
          <Button onClick={() => acceptEvent()}>Accept Event</Button>{" "}
          <Button title="Must not have any active events" onClick={() => luckyReset()}>
            Lucky Reset
          </Button>
          {EventCard(
            charityORG.waitingEvents.find((f) => f.name === pendingCategory),
            true,
          )}
        </span>
        <span>
          <Typography>Attacks!</Typography>
          <Typography>{charityORG.currentEvents.filter((e) => e.isBeneficial === false).length}</Typography>
          <Box sx={{ height: 220, overflow: "scroll", border: "1px solid", borderBlockColor: "yellow" }}>
            {charityORG.currentEvents
              .filter((n) => n.isBeneficial === false)
              .map((k, i) => (
                <ListItemButton
                  sx={{ height: 0, marginTop: 0.9, marginBottom: 0.9 }}
                  key={i + 1}
                  onClick={() => setAttackCategory(k.name)}
                  selected={attackCategory === k.name}
                >
                  <Typography>
                    {i + 1 + "-"}
                    {k.shortName.substring(0, 50)}
                  </Typography>
                </ListItemButton>
              ))}
          </Box>
          <br></br>
          <Button title="Costs 1 lucky coin" onClick={() => luckyCancelAttack()}>
            Lucky Cancel
          </Button>
          {EventCard(
            charityORG.currentEvents.find((f) => f.name === attackCategory),
            false,
          )}
        </span>
      </Box>
    </>
  );
}
/*
<div>
            
          </div>

           <div>
            
          </div>

          <div>
            
          </div>

*/
