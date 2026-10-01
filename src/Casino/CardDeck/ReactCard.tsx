import React, { FC } from "react";
import { Card, Suit } from "./Card";

import Paper from "@mui/material/Paper";
import { throwIfReachable } from "../../utils/helpers/throwIfReachable";
import { Typography } from "@mui/material";

interface Props {
  card: Card;
  hidden?: boolean;
}

export const ReactCard: FC<Props> = ({ card, hidden }) => {
  let suit: React.ReactNode;
  switch (card.suit) {
    case Suit.Clubs:
      suit = <span>&#9827;</span>;
      break;
    case Suit.Diamonds:
      suit = <span>&#9830;</span>;
      break;
    case Suit.Hearts:
      suit = <span>&#9829;</span>;
      break;
    case Suit.Spades:
      suit = <span>&#9824;</span>;
      break;
    default:
      throwIfReachable(card.suit);
  }
  return (
    <Paper
      sx={{
        padding: "10px",
        border: "solid 1px #808080",
        backgroundColor: "white",
        display: "inline-block",
        borderRadius: "10px",
        fontSize: "18.5px",
        textAlign: "center",
        margin: "3px",
        fontWeight: "bold",
        color: card.isRedSuit() ? "red" : "black",
      }}
    >
      <>
        <Typography component="span" sx={{ fontSize: "20px", fontFamily: "sans-serif" }}>
          {hidden ? " - " : card.formatValue()}
        </Typography>
        <span>{hidden ? " - " : suit}</span>
      </>
    </Paper>
  );
};
