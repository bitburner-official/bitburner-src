import * as React from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { Money } from "../ui/React/Money";
import { BetInput } from "./BetInput";
import { Deck } from "./CardDeck/Deck";
import { Hand } from "./CardDeck/Hand";
import { ReactCard } from "./CardDeck/ReactCard";
import { hasEnoughMoney, reachedLimit, win } from "./Game";
import { exceptionAlert } from "../utils/helpers/exceptionAlert";

const initialBet = 1e6;
const maxBet = 100e6;

export const DECK_COUNT = 5; // 5-deck multideck

enum Result {
  Pending = "Pending",
  PlayerWon = "You won!",
  PlayerWonByBlackjack = "You Won! Blackjack!",
  DealerWon = "You lost!",
  Tie = "Push! (Tie)",
}

interface State {
  playerHand: Hand;
  dealerHand: Hand;
  bet: number;
  betInput: string;
  gameInProgress: boolean;
  result: Result;
  gains: number; // Track gains only for this session
  wagerInvalid: boolean;
  wagerInvalidHelperText: string;
}

export class Blackjack extends React.Component<Record<string, never>, State> {
  deck: Deck;

  constructor(props: Record<string, never>) {
    super(props);

    this.deck = new Deck(DECK_COUNT);

    this.state = {
      playerHand: new Hand([]),
      dealerHand: new Hand([]),
      bet: initialBet,
      betInput: String(initialBet),
      gameInProgress: false,
      result: Result.Pending,
      gains: 0,
      wagerInvalid: false,
      wagerInvalidHelperText: "",
    };
  }

  startGame = (): void => {
    if (reachedLimit() || !hasEnoughMoney(this.state.bet)) {
      return;
    }

    win(-this.state.bet);

    const playerHand = new Hand([this.deck.safeDrawCard(), this.deck.safeDrawCard()]);
    const dealerHand = new Hand([this.deck.safeDrawCard(), this.deck.safeDrawCard()]);

    this.setState({
      playerHand,
      dealerHand,
      gameInProgress: true,
      result: Result.Pending,
    });

    // If the player is dealt a blackjack and the dealer is not, then the player
    // immediately wins
    if (this.getTrueHandValue(playerHand) === 21) {
      if (this.getTrueHandValue(dealerHand) === 21) {
        this.finishGame(Result.Tie);
      } else {
        this.finishGame(Result.PlayerWonByBlackjack);
      }
    } else if (this.getTrueHandValue(dealerHand) === 21) {
      // Check if dealer won by blackjack. We know at this point that the player does not also have blackjack.
      this.finishGame(Result.DealerWon);
    }
  };

  // Returns an array of numbers representing all possible values of the given Hand. The reason it needs to be
  // an array is because an Ace can count as both 1 and 11.
  getHandValue = (hand: Hand): number[] => {
    let result: number[] = [0];

    for (let i = 0; i < hand.cards.length; ++i) {
      const value = hand.cards[i].value;
      if (value >= 10) {
        result = result.map((x) => x + 10);
      } else if (value === 1) {
        result = result.flatMap((x) => [x + 1, x + 11]);
      } else {
        result = result.map((x) => x + value);
      }
    }

    return result;
  };

  // Returns the single hand value used for determine things like victory and whether or not
  // the dealer has to hit. Essentially this uses the biggest value that's 21 or under. If no such value exists,
  // then it means the hand is busted and we can just return whatever
  getTrueHandValue = (hand: Hand): number => {
    const handValues = this.getHandValue(hand);
    const valuesUnder21 = handValues.filter((x) => x <= 21);

    if (valuesUnder21.length > 0) {
      valuesUnder21.sort((a, b) => a - b);
      return valuesUnder21[valuesUnder21.length - 1];
    } else {
      // Just return the first value. It doesn't really matter anyways since hand is busted.
      return handValues[0];
    }
  };

  // Returns all hand values that are 21 or under. If no values are 21 or under, then the first value is returned.
  getHandDisplayValues = (hand: Hand): number[] => {
    const handValues = this.getHandValue(hand);
    if (this.isHandBusted(hand)) {
      // Hand is busted so just return the 1st value, doesn't really matter
      return [...new Set([handValues[0]])];
    } else {
      return [...new Set(handValues.filter((x) => x <= 21))];
    }
  };

  isHandBusted = (hand: Hand): boolean => {
    return this.getTrueHandValue(hand) > 21;
  };

  playerHit = (event: React.MouseEvent): void => {
    if (!event.isTrusted) {
      return;
    }

    const newHand = this.state.playerHand.addCards(this.deck.safeDrawCard());

    this.setState({
      playerHand: newHand,
    });

    // Check if player busted, and finish the game if so
    if (this.isHandBusted(newHand)) {
      this.finishGame(Result.DealerWon);
    }
  };

  playerStay = (event: React.MouseEvent): void => {
    if (!event.isTrusted) return;

    // Determine if Dealer needs to hit. A dealer must hit if they have 16 or lower.
    // If the dealer has a Soft 17 (Ace + 6), then they stay.
    let newDealerHand = this.state.dealerHand;
    let dealerHandValue = this.getTrueHandValue(newDealerHand);
    while (dealerHandValue <= 16) {
      newDealerHand = newDealerHand.addCards(this.deck.safeDrawCard());
      dealerHandValue = this.getTrueHandValue(newDealerHand);
    }

    this.setState({
      dealerHand: newDealerHand,
    });

    // If dealer has busted, then player wins
    if (this.isHandBusted(newDealerHand)) {
      this.finishGame(Result.PlayerWon);
    } else {
      const dealerHandValue = this.getTrueHandValue(newDealerHand);
      const playerHandValue = this.getTrueHandValue(this.state.playerHand);

      // We expect nobody to have busted. If someone busted, there is an error
      // in our game logic
      if (dealerHandValue > 21 || playerHandValue > 21) {
        throw new Error("Someone busted when not expected to");
      }

      if (playerHandValue > dealerHandValue) {
        this.finishGame(Result.PlayerWon);
      } else if (playerHandValue < dealerHandValue) {
        this.finishGame(Result.DealerWon);
      } else {
        this.finishGame(Result.Tie);
      }
    }
  };

  finishGame = (result: Result): void => {
    /**
     * Explicitly declare the type of "gains". If we forget a case here, TypeScript will notify us: "Variable 'gains' is
     * used before being assigned.".
     */
    let gains: number;
    switch (result) {
      case Result.DealerWon:
        // We took away the bet at the start, don't need to take more
        gains = 0;
        break;
      case Result.Tie:
        // We took away the bet at the start, give it back
        gains = this.state.bet;
        break;
      case Result.PlayerWon:
        // Give back their bet plus their winnings
        gains = 2 * this.state.bet;
        break;
      case Result.PlayerWonByBlackjack:
        // Blackjack pays out 1.5x bet!
        gains = 2.5 * this.state.bet;
        break;
      case Result.Pending:
        /**
         * Don't throw an error. Callers of this function are event handlers (onClick) of buttons. If we throw an error,
         * it won't be shown to the player.
         */
        exceptionAlert(new Error(`Unexpected Blackjack result: ${result}.`));
        gains = 0;
        break;
    }
    win(gains);
    this.setState({
      gameInProgress: false,
      result,
      gains: this.state.gains + gains - this.state.bet, // Not updated upfront - only tracks the final outcome
    });
  };

  // Start game button
  startOnClick = (event: React.MouseEvent): void => {
    // Protect against scripting...although maybe this would be fun to automate
    if (!event.isTrusted) {
      return;
    }

    if (!this.state.wagerInvalid) {
      this.startGame();
    }
  };

  render(): React.ReactNode {
    const { playerHand, dealerHand, gameInProgress, result, wagerInvalid, gains } = this.state;

    // Get the player totals to display.
    const playerHandValues = this.getHandDisplayValues(playerHand);
    const dealerHandValues = this.getHandDisplayValues(dealerHand);

    return (
      <>
        <Box>
          <BetInput
            initialBet={initialBet}
            maxBet={maxBet}
            gameInProgress={gameInProgress}
            setBet={(bet) => {
              this.setState({
                bet,
              });
            }}
            validBetCallback={() => {
              this.setState({
                wagerInvalid: false,
                result: Result.Pending,
              });
            }}
            invalidBetCallback={() => {
              this.setState({
                wagerInvalid: true,
              });
            }}
          />

          <Typography>
            {"Total earnings this session: "}
            <Money money={gains} />
          </Typography>
        </Box>

        {/* Buttons */}
        {!gameInProgress ? (
          <Button onClick={this.startOnClick} disabled={wagerInvalid}>
            Start
          </Button>
        ) : (
          <>
            <Button onClick={this.playerHit}>Hit</Button>
            <Button color="secondary" onClick={this.playerStay}>
              Stay
            </Button>
          </>
        )}

        {/* Main game part. Displays both if the game is in progress OR if there's a result so you can see
         * the cards that led to that result. */}
        {(gameInProgress || result !== Result.Pending) && (
          <>
            <Box display="flex">
              <Paper elevation={2}>
                <Typography>Player</Typography>
                {playerHand.cards.map((card, i) => (
                  <ReactCard card={card} key={i} />
                ))}

                <Typography>
                  Count:{" "}
                  {playerHandValues
                    .map<React.ReactNode>((value, i) => <span key={i}>{value}</span>)
                    .reduce((prev, curr) => [prev, " or ", curr])}
                </Typography>
              </Paper>
            </Box>

            <br />

            <Box display="flex">
              <Paper elevation={2}>
                <Typography>Dealer</Typography>
                {dealerHand.cards.map((card, i) => (
                  // Hide every card except the first while game is in progress
                  <ReactCard card={card} hidden={gameInProgress && i !== 0} key={i} />
                ))}

                {!gameInProgress && (
                  <>
                    <Typography>
                      Count:{" "}
                      {dealerHandValues
                        .map<React.ReactNode>((value, i) => <span key={i}>{value}</span>)
                        .reduce((prev, curr) => [prev, " or ", curr])}
                    </Typography>
                  </>
                )}
              </Paper>
            </Box>
          </>
        )}

        {/* Results from previous round */}
        {result !== Result.Pending && (
          <Typography>
            {result}&nbsp;
            {result === Result.PlayerWon && <Money money={this.state.bet} />}
            {result === Result.PlayerWonByBlackjack && <Money money={this.state.bet * 1.5} />}
            {result === Result.DealerWon && <Money money={-this.state.bet} />}
          </Typography>
        )}
      </>
    );
  }
}
