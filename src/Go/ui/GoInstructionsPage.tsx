import React from "react";
import { Grid, Link, Typography } from "@mui/material";

import { GoOpponent, GoColor } from "@enums";
import { boardStyles } from "../boardState/goStyles";
import { boardStateFromSimpleBoard } from "../boardAnalysis/boardAnalysis";
import { GoTutorialChallenge } from "./GoTutorialChallenge";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { getMaxFavor } from "../effects/effect";

const captureChallenge = (
  <GoTutorialChallenge
    state={boardStateFromSimpleBoard([".....", "OX...", "OXX..", "OOX.O", "OOX.."], GoOpponent.none, GoColor.white)}
    description={
      "CHALLENGE: This white network on the bottom is vulnerable! Click on the board to place a router. Capture some white pieces by cutting off their access to any empty nodes."
    }
    correctMoves={[{ x: 0, y: 0 }]}
    correctText={
      "Correct! With no open ports, the white routers are destroyed. Now you surround and control the empty nodes in the bottom-right."
    }
    incorrectText={"Unfortunately the white routers still touch at least one empty node. Hit 'Reset' to try again."}
  />
);

const saveTheNetworkChallenge = (
  <GoTutorialChallenge
    state={boardStateFromSimpleBoard(["OO.##", "XO..#", "XX..#", "XO...", "XO..."], GoOpponent.none, GoColor.white)}
    description={
      "CHALLENGE: Your routers are in trouble! They only have one open port. Save the black network by connecting them to more empty nodes."
    }
    correctMoves={[{ x: 2, y: 2 }]}
    correctText={
      "Correct! Now the network touches three empty nodes instead of one, making it much harder to cut them off."
    }
    incorrectText={
      "Unfortunately your network can still be cut off from all empty ports in just one move by white. Hit 'Reset' to try again."
    }
  />
);

const onlyGoodMoveChallenge = (
  <GoTutorialChallenge
    state={boardStateFromSimpleBoard(["XXO.O", "XO.O.", ".OOOO", "XXXXX", "X.X.X"], GoOpponent.none, GoColor.white)}
    description={"CHALLENGE: Save the black network on the left! Connect the network to more than one empty node."}
    correctMoves={[{ x: 2, y: 0 }]}
    correctText={
      "Correct! Now the network touches two empty nodes instead of one, making it much harder to cut them off."
    }
    incorrectText={
      "Incorrect. Your left network can still be cut off from empty ports in just one move. Also, you blocked one of your only open ports from your right network!"
    }
  />
);

const makeTwoEyesChallenge = (
  <GoTutorialChallenge
    state={boardStateFromSimpleBoard(["XXOO.", ".XXOO", ".XXO.", ".XXOO", "XXOO."], GoOpponent.none, GoColor.white)}
    description={
      "CHALLENGE: The black routers are only connected to one empty-node group. Place a router such that they are connected to TWO empty node groups instead."
    }
    correctMoves={[{ x: 2, y: 0 }]}
    correctText={
      "Correct! Now that your network surrounds empty nodes in multiple different areas, it is impossible for the network to be captured by white because of the suicide rule (unless you fill in your own empty nodes!)."
    }
    incorrectText={
      "Incorrect. The black network still only touches one group of open nodes. (Hint: Try dividing up the bottom open-node group.) Hit 'Reset' to try again."
    }
  />
);

export const GoInstructionsPage = (): React.ReactElement => {
  const { classes } = boardStyles();
  return (
    <div className={classes.instructionScroller}>
      <>
        <Typography variant="h4">IPvGO</Typography>
        <br />
        <Typography>
          In late 2070, the .org bubble burst, and most of the newly-implemented IPvGO 'net collapsed overnight. Since
          then, various factions have been fighting over small subnets to control their computational power. These
          subnets are very valuable in the right hands, if you can wrest them from their current owners.
          <br />
          <br />
          (For details about how to automate with the API, and for a working starter script, visit the IPvGO section of
          the in-game{" "}
          <Link
            style={{ cursor: "pointer" }}
            onClick={() => Router.toPage(Page.Documentation, { docPage: "programming/go_algorithms.md" })}
          >
            Bitburner Documentation)
          </Link>
        </Typography>
        <br />
        <br />
        <Grid container columns={2}>
          <Grid item className={classes.instructionsBlurb}>
            <Typography variant="h5">How to take over IPvGO Subnets</Typography>
            <br />
            <Typography>
              Your goal is to control more <i>empty nodes</i> in the subnet than the faction currently holding it, by
              surrounding those open nodes with your routers.
              <br />
              <br />
              Each turn you place a router in an empty node (or pass). The router will connect to your adjacent routers,
              forming networks. A network's remaining open ports are indicated by lines heading out towards the empty
              nodes adjacent to the network.
              <br />
              <br />
              If a group of routers no longer is connected to any empty nodes, they will experience intense packet loss
              and be removed from the subnet. Make sure you ALWAYS have access to several empty nodes in each of your
              networks! A network with only one remaining open port will start to fade in and out, because it is at risk
              of being destroyed.
              <br />
              <br />
              You also can use your routers to limit your opponent's access to empty nodes as much as possible. Cut a
              network off from any empty nodes, and their entire group of routers will be removed!
              <br />
              <br />
            </Typography>
          </Grid>
          <Grid item className={classes.instructionBoardWrapper}>
            {captureChallenge}
          </Grid>
        </Grid>
        <br />
        <br />
        <Grid container>
          <Grid item className={classes.instructionBoardWrapper}>
            {saveTheNetworkChallenge}
          </Grid>
          <Grid item className={classes.instructionsBlurb}>
            <Typography variant="h5">Winning the Subnet</Typography>
            <br />
            <Typography>
              The game ends when all of the open nodes on the subnet are completely surrounded by a single color, or
              when both players pass consecutively.
              <br />
              <br />
              Once the subnet is fully claimed, each player will get one point for each empty node they fully surround
              on the subnet, plus a point for each router they have. You can use the edge of the board along with your
              routers to fully surround and claim empty nodes. <br />
              <br />
              White will also get a few points (called "komi") as a home-field advantage in the subnet, and to balance
              black's advantage of having the first move.
              <br />
              <br />
              Any territory you control at the end of the game will award you stat multiplier bonuses. Winning the node
              will increase the amount gained, but is not required.
              <br />
              <br />
              Win streaks against a faction will give you +1 favor to that faction at certain numbers of wins (up to a
              max of {getMaxFavor()} favor), if you are currently a member of that faction.
            </Typography>
          </Grid>
        </Grid>
        <br />
        <br />
        <Grid container>
          <Grid item className={classes.instructionsBlurb}>
            <Typography variant="h5">Special Rule Details</Typography>
            <br />
            <Typography>
              * Because these subnets have fallen into disrepair, they are not always perfectly square. Dead areas, such
              as the top-left corner in the example above, are not part of the subnet. They do not count as territory,
              and do not provide open ports to adjacent routers.
              <br />
              <br />
              * You cannot suicide your own routers by cutting off access to their last remaining open node. You also
              cannot suicide a router by placing it in a node that is completely surrounded by your opponent's routers.
              <br />
              <br />
              * There is one exception to the suicide rule: You can place a router on ANY node if it would capture any
              of the opponent's routers.
              <br />
              <br />
              * You cannot repeat previous board states. This rule prevents infinite loops of capturing and
              re-capturing. This means that in some cases you cannot immediately capture an enemy network that is
              flashing and vulnerable.
              <br />
              <br />
              Note that you CAN re-capture eventually, but you must play somewhere else on the board first, to make the
              overall board state different.
            </Typography>
          </Grid>
          <Grid item className={classes.instructionBoardWrapper}>
            {onlyGoodMoveChallenge}
          </Grid>
        </Grid>
        <br />
        <br />
        <Grid container>
          <Grid item className={classes.instructionBoardWrapper}>
            {makeTwoEyesChallenge}
          </Grid>
          <Grid item className={classes.instructionsBlurb}>
            <Typography variant="h5">Strategy</Typography>
            <br />
            <br />
            <Typography>
              * You can place routers and look at the board state via the "ns.go" api. For more details, go to the IPvGO
              page in the{" "}
              <Link
                style={{ cursor: "pointer" }}
                onClick={() => Router.toPage(Page.Documentation, { docPage: "programming/go_algorithms.md" })}
              >
                Bitburner Documentation
              </Link>
              <br />
              <br />
              * If a network surrounds a single empty node, the opponent can eventually capture it by filling in that
              node. However, if your network has two separate empty nodes inside of it, the suicide rule prevents the
              opponent from filling up either of them. This means your network cannot be captured! Try to build your
              networks to surround several different empty nodes, and avoid filling in your network's empty nodes when
              possible.
              <br />
              <br />
              * Pay attention to when a network of routers has only one or two open ports to empty spaces! That is your
              opportunity to defend your network, or capture the opposing faction's.
              <br />
              <br />
              * Every faction has a different style, and different weaknesses. Try to identify what they are good and
              bad at doing.
              <br />
              <br />
              * The best way to learn strategies is to experiment and find out what works!
              <br />
              <br />* This game is Go with slightly simplified scoring. For more rule details and strategies try{" "}
              <Link href={"https://way-to-go.gitlab.io/#/en/capture-stones"} target={"_blank"} rel="noreferrer">
                The Way to Go interactive guide.
              </Link>{" "}
              <br />
              <br />
            </Typography>
          </Grid>
        </Grid>
        <br />
      </>
    </div>
  );
};
