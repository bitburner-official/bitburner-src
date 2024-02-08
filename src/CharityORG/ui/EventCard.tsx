import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { CharityEvent } from "../CharityEvent";
import { formatNumber } from "../../ui/formatNumber";
import { forEach } from "lodash";
import { convertTimeMsToTimeElapsedString } from "../../utils/StringHelperFunctions";

/** React Component for the popup that manages gang members upgrades */
export function EventCard(event: CharityEvent | undefined, queue: boolean): React.ReactElement {
  if (event === undefined) return <></>;

  return (
    <>
      <Box display="grid" width="99%">
        <Typography>
          Task:<br></br>
          Name: {event.taskObject.short_name}
          <br></br>
          Desc: {event.taskObject.desc}
          <br></br>
          Diff: {formatNumber(event.taskObject.difficulty)}
          <br></br>
          Cycles until removed:{" "}
          {!event.hasTimer
            ? "N/A"
            : queue
              ? convertTimeMsToTimeElapsedString((event.cyclesTillRemoved - event.cyclesElapsed) * 200)
              : convertTimeMsToTimeElapsedString((event.cyclesTillDeath - event.cyclesElapsed) * 200)}
          <br></br>
          Cycles until completed: {convertTimeMsToTimeElapsedString((event.cyclesNeeded - event.cyclesCompleted) * 200)}
          <br></br>
          <Box display="grid" whiteSpace="pre">
            Base Gain :{" "}
            {(event.taskObject.baseMoneyGain < 10 ? "  $" : event.taskObject.baseMoneyGain < 100 ? " $" : "$") +
              formatNumber(event.taskObject.baseMoneyGain, 3)}
            <br></br>
            Base Spend :{" "}
            {(event.taskObject.baseMoneySpend < 10 ? "  $" : event.taskObject.baseMoneySpend < 100 ? " $" : "$") +
              formatNumber(event.taskObject.baseMoneySpend, 3)}
            <br></br>
            Base Karma :{" "}
            {(event.taskObject.baseKarmaGain < 10 ? "   " : event.taskObject.baseKarmaGain < 100 ? "  " : " ") +
              formatNumber(event.taskObject.baseKarmaGain, 3)}
            <br></br>
            Base Prestige :{" "}
            {(event.taskObject.basePrestige < 10 ? "   " : event.taskObject.basePrestige < 100 ? "  " : " ") +
              formatNumber(event.taskObject.basePrestige, 3)}
            <br></br>
            Base Terror :{" "}
            {(event.taskObject.baseTerror < 10 ? "   " : event.taskObject.baseTerror < 100 ? "  " : " ") +
              formatNumber(event.taskObject.baseTerror, 3)}
            <br></br>
            Base Visibility:{" "}
            {(event.taskObject.baseVisibility < 10 ? "   " : event.taskObject.baseVisibility < 100 ? "  " : " ") +
              formatNumber(event.taskObject.baseVisibility, 3)}
            <br></br>
          </Box>
          Weights:<br></br>
          <Box display="grid" whiteSpace="pre" sx={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
            {"Hack: "}
            {(event.taskObject.hackWeight < 10 ? "0" : "") + formatNumber(event.taskObject.hackWeight, 2)} {"  "}
            {"Str : "}
            {(event.taskObject.strWeight < 10 ? "0" : "") + formatNumber(event.taskObject.strWeight, 2)} {"  "}
            {"Def : "}
            {(event.taskObject.defWeight < 10 ? "0" : "") + formatNumber(event.taskObject.defWeight, 2)}
            <br></br>
            {"Dex : "}
            {(event.taskObject.dexWeight < 10 ? "0" : "") + formatNumber(event.taskObject.dexWeight, 2)} {"  "}
            {"Agi : "}
            {(event.taskObject.agiWeight < 10 ? "0" : "") + formatNumber(event.taskObject.agiWeight, 2)} {"  "}
            {"Cha : "}
            {(event.taskObject.chaWeight < 10 ? "0" : "") + formatNumber(event.taskObject.chaWeight, 2)}
            <br></br>
          </Box>
          Effects:<br></br>
          <Box display="grid" sx={{ gridTemplateColumns: "1fr 1fr" }}>
            {forEach(event.modifiers).map((n, i) => (
              <Typography key={i}>
                {n.area}: {formatNumber(n.strength, 2)}
                <br></br>
              </Typography>
            ))}
          </Box>
          <br></br>
          Death Effects:<br></br>
          <Box display="grid" sx={{ gridTemplateColumns: "1fr 1fr" }}>
            {forEach(event.deathEffects).map((n, i) => (
              <Typography key={i}>
                {n.type.replaceAll("_", " ")}: {formatNumber(n.strength, 2)}
                <br></br>
              </Typography>
            ))}
          </Box>
        </Typography>
      </Box>
    </>
  );
}
/*
          <Box display="grid" sx={{ gridTemplateColumns: "1fr 1fr" }}>
        {
          forEach(props.charityORG.masterModifiers).map((n, i) => (
            <Typography key={i}>{n.area} {formatNumber(n.strength)}%<br></br></Typography>
          ))
        }
      </Box>
      */
