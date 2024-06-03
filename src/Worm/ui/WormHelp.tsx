import { createStyles, makeStyles } from "@mui/styles";
import { Grid, Typography } from "@mui/material";
import React from "react";
import { WormQuiz } from "./WormQuiz";
import { WormProperties1 } from "./images/WormProperties1";
import { WormProperties2 } from "./images/WormProperties2";
import { WormTraversal1 } from "./images/WormTraversal1";
import { WormTraversal2 } from "./images/WormTraversal2";
import { WormProperties3 } from "./images/WormProperties3";
import { WormProperties4 } from "./images/WormProperties4";
import { WORM_CREATE_COOLDOWN, wormMaxSessions, WORM_SOLVE_COOLDOWN } from "../calculations";
import { convertTimeMsToTimeElapsedString } from "../../utils/StringHelperFunctions";
import { Player } from "@player";

const styles = makeStyles(() =>
  createStyles({
    scroll: {
      height: "calc(100vh - 100px)",
      overflowY: "scroll",
      marginTop: "10px",
    },
    text: {
      width: "60%",
      marginRight: "15px",
    },
    quizSmall: {
      width: "calc(40% - 50px)",
      marginRight: "15px",
    },
    quizLarge: {
      width: "calc(40% - 50px)",
      minHeight: "540px",
      marginRight: "15px",
    },
  }),
);

const traversalQuiz = (
  <WormQuiz
    questions={[
      {
        text: "What input will result in the output 's01'?",
        answer: "A",
        explanation: "The connection labeled 'A' points from the starting state 's00' to 's01'.",
        type: "text",
        visual: () => <WormTraversal1 />,
      },
      {
        text: "What input will result in 's02'?",
        answer: "AB",
        explanation: "Chaining 'A' and 'B' to 'AB' will first go to 's01' and then to 's02'.",
        type: "text",
        visual: () => <WormTraversal1 />,
      },
      {
        text: "What input will go through 's02' and end at 's00'?",
        answer: "ABBA",
        explanation: "'ABB' will go through 's02' and end back at 's00', so 'ABBA' will lead to 's01'.",
        type: "text",
        visual: () => <WormTraversal2 />,
      },
    ]}
  />
);

const pathBipartiteQuiz = (
  <WormQuiz
    questions={[
      {
        text: "What is the shortest path to 's03'?",
        answer: "EC",
        explanation: "The shortest path to 's03' goes from 's00' to 's02' and ends at 's03'.",
        type: "text",
        visual: () => <WormProperties2 />,
      },
      {
        text: "Is this network bipartite?",
        answer: "true",
        explanation: "'s00' and 's02' are in the first group and 's01' and 's03' are in the second group.",
        type: "truthy",
        visual: () => <WormProperties1 />,
      },
      {
        text: "Is this network bipartite?",
        answer: "false",
        explanation: "'s00' and 's02' can no longer be in the same group, as 's00' has a connection to 's02'.",
        type: "truthy",
        visual: () => <WormProperties2 />,
      },
    ]}
  />
);

const valueIndegreeQuiz = (
  <WormQuiz
    questions={[
      {
        text: "What is the highest state in the network?",
        answer: "s03",
        explanation: "State 's03' is the highest state.",
        type: "choice",
        choices: ["s00", "s01", "s02", "s03"],
        visual: () => <WormProperties1 />,
      },
      {
        text: "What is the node value of 's01'?",
        answer: "1",
        explanation: "The highest state it points to is 's02', 2 - 1 = 1.",
        type: "number",
        visual: () => <WormProperties2 />,
      },
      {
        text: "What is the node value of 's00'?",
        answer: "2",
        explanation: "The highest state it points to is 's02', 2 - 0 = 2.",
        type: "number",
        visual: () => <WormProperties2 />,
      },
      {
        text: "What is the node value of 's03'?",
        answer: "-3",
        explanation: "The highest state it points to is 's00', 0 - 3  = -3.",
        type: "number",
        visual: () => <WormProperties2 />,
      },
      {
        text: "What is the indegree of 's00'?",
        answer: "1",
        explanation: "There is one connection to 's00'.",
        type: "number",
        visual: () => <WormProperties2 />,
      },
      {
        text: "What is the indegree of 's02'?",
        answer: "2",
        explanation: "There are two connections to 's02'.",
        type: "number",
        visual: () => <WormProperties2 />,
      },
    ]}
  />
);

const dfsQuiz = (
  <WormQuiz
    questions={[
      {
        text: "What state comes first in the DFS-Enumeration?",
        answer: "s00",
        explanation: "The DFS-Enumeration starts with the starting state.",
        type: "choice",
        choices: ["s03", "s02", "s01", "s00"],
        visual: () => <WormProperties1 />,
      },
      {
        text: "What state comes second in the DFS-Enumeration?",
        answer: "s01",
        explanation: "Depth-First-Search goes through the connections alphabetically.",
        type: "choice",
        choices: ["s03", "s02", "s01", "s00"],
        visual: () => <WormProperties2 />,
      },
      {
        text: "What state comes third in the DFS-Enumeration?",
        answer: "s02",
        explanation: "Traversing further down 's02' leads to 's03'.",
        type: "choice",
        choices: ["s03", "s02", "s01", "s00"],
        visual: () => <WormProperties3 />,
      },
      {
        text: "What state comes fourth in the DFS-Enumeration?",
        answer: "s02",
        explanation: "After traversing through 's01' to 's03', the next traversal is 'E' at 's00', going to 's02'.",
        type: "choice",
        choices: ["s03", "s02", "s01", "s00"],
        visual: () => <WormProperties4 />,
      },
    ]}
  />
);

export function WormHelp() {
  const classes = styles();

  return (
    <div className={classes.scroll}>
      <Typography variant="h5">Solving the worm</Typography>
      <Typography>
        To gather bonuses from the worm, you will need to solve for certain values hidden in a network. A network, or
        graph, is a set of nodes, called states, and connections from nodes to other nodes.
        <br />
        How such a network might look is depicted by some interactive elements on this page. The circles and their
        corresponding label, 's01' for example, are the states of the network. The arrows pointing from one state to
        another with their corresponding label, 'A' for example, are the connections.
        <br />
        <br />
        You cannot access the structure of this network directly. It is hidden at the beginning and you need figure out
        how it is structured. Certain metadata, like the number of states and their label, as well as a set of possible
        symbols for the connections, is being provided through the Worm API or shown on the manual input UI.
        <br />
        <br />
        There can be multiple instances of the worm that your scripts can solve at the same time. These "sessions" can
        be spawned in by any script and can be accessed using its specific identifier. Do note, sessions don't persist
        once the game is closed. There can only be {wormMaxSessions(Player.sourceFileLvl(16))} sessions active at once.
        Spawning in sessions has a {convertTimeMsToTimeElapsedString(WORM_CREATE_COOLDOWN)} cooldown. Solving sessions
        has another {convertTimeMsToTimeElapsedString(WORM_SOLVE_COOLDOWN)} cooldown.
      </Typography>
      <br />
      <br />
      <Typography variant="h5">Traversing the network</Typography>
      <Typography>
        Whether you are solving the worm manually or via scripts, one essential step to solving a session is figuring
        out what the underlying network looks like. To accomplish this, you will need to traverse it, starting from a
        constant starting state.
      </Typography>
      <br />
      <Grid container>
        <Grid item className={classes.text}>
          <Typography>
            Each state can have connections to other states, each labeled with a symbol from the list of possible
            symbols. This means that a state can only have so many connections, as there are symbols in the given set.
            You can choose which connection to take, by entering its label as your input. You can also chain multiple
            symbols to traverse even further.
            <br />
            <br />
            After submitting your input, you will recieve the final state your input lead to as an output. Do note that
            any symbol submitted, that has no corresponding connection for the current state, will result in the output
            of the null state 'snull'.
          </Typography>
        </Grid>
        <Grid item className={classes.quizSmall}>
          {traversalQuiz}
        </Grid>
      </Grid>
      <br />
      <Typography>
        The starting state of every network is always the state with the lowest id, 's00'. The id of every state is the
        number at the end of the label. State 's143' would have the id 143.
        <br />
        <br />
        Each network has a specific maximum size it could have. Each state can have only so many connections, as there
        are symbols in the list of available symbols. There cannot be any connections with the same symbol on one state.
        Thus, the size of the network is the number of states of the network times the number of available symbols. This
        is the maximum size of the network, the actual size can vary, since some connections could be missing.
      </Typography>
      <br />
      <Typography variant="h5">Network properties</Typography>
      <Typography>
        To solve a session, you will need to submit a set of values that describe the underlying network. Each of the
        values you have to submit are about a certain property of the network. Depending on the value, it can be a
        simple boolean value, a number or something more complicated, like a state.
        <br />
        Certain properties depend on the state in question or some other value. These dependencies are shown in the
        manual input UI or can be gathered via the Worm API.
      </Typography>
      <br />
      <br />
      <Grid container>
        <Grid item className={classes.quizLarge}>
          {pathBipartiteQuiz}
        </Grid>
        <Grid item className={classes.text}>
          <Typography variant="h5">Shortest path and bipartiteness</Typography>
          <Typography>
            The shortest path of a network goes from the starting state to the highest possible state. It should have
            the fewest symbols used, going through as few states as possible.
            <br />
            <br />
            There can be multiple shortest paths with the same number of symbols to the highest state. It doesn't matter
            which of them you submit, as long as the input leads to the highest state and the length of the input is
            minimal.
            <br />
            <br />
            The bipartiteness of a graph describes if the states of the graph can be divided into to groups, such that
            no state from one group has a connection to a state in its group.
            <br />
            Therefore, looking at any state in the network, all states connected to this state have to be in the same
            group. If that is not the case, the graph is not bipartite.
          </Typography>
        </Grid>
      </Grid>
      <br />
      <br />
      <Grid container>
        <Grid item className={classes.text}>
          <Typography variant="h5">Node value and node indegree</Typography>
          <Typography>
            The node value and node indegree both depend on a state to be looked at. For both of these properties, a
            state is provided, which can be retrieved using the Worm API and is shown in the manual input UI.
            <br />
            <br />
            The value of a node is the id of the highest node it has a connection to, minus its own id. It is basically
            the highest jump that can be done at the corresponding state. The value of a node can also be negative, if
            the state in question only connects to states that have a lower id.
            <br />
            <br />
            The indegree of a node is the number of connections that point to the node. This property doesn't depend
            directly on the given state, but all of the states and their connections that point to it.
          </Typography>
        </Grid>
        <Grid item className={classes.quizLarge}>
          {valueIndegreeQuiz}
        </Grid>
      </Grid>
      <br />
      <br />
      <Grid container>
        <Grid item className={classes.quizLarge}>
          {dfsQuiz}
        </Grid>
        <Grid item className={classes.text}>
          <Typography variant="h5">Depth-First-Search Enumeration</Typography>
          <Typography>
            The Depth-First-Search (DFS) traversal describes a particular way of going through the network. Starting at
            some state, it traverses as far as possible into one direction, before stepping back and taking other
            routes.
            <br />
            <br />
            Traversing this way means to recursively apply the traversal on adjacent states in a determined order. To
            exclude any infinite loops or multiple visits to states, the traversal only continues to states that haven't
            been visited yet.
            <br />
            <br />
            The Depth-First-Search Enumeration is the order in which the states have been visited using the
            Depth-First-Search traversal algorithm. The starting state is the first state in the enumeration and all
            other visited states follow accordingly.
            <br />
            <br />
            The property for the network asks for the state in some position of this enumeration. The position to return
            is given through the Worm API or shown in the manual input UI. Do note the enumeration is zero-based,
            meaning the first state, the starting state, is in position zero.
          </Typography>
        </Grid>
      </Grid>
      <br />
      <br />
      <Typography variant="h5">Completions and rewards</Typography>
      <Typography>
        The worm offers a lot of unique and powerful upgrades called bonuses. To increase the strength of these bonuses,
        you have to do the work and solve the worm.
        <br />
        <br />
        After computing the properties of a network, you can complete the session by submitting your guess. Depending on
        how many are correct, you will recieve a currency specific to the Worm: completions.
        <br />
        You can gain a maximum reward of 1 completion from solving one session when all properties are correct. This
        maximum will decrease the more testing has been done in the session. The effect will be slow at first and ramp
        up the closer the number of tests gets to the maximum size of the session. If you test for the entire structure
        of the network, you will gain the minimum reward, while solving the session with parts of the network not tested
        will result in a bigger reward.
        <br />
        <br />
        The more completions you have, the bigger your worm bonus is.
        <br />
        The specific multiplier of the bonus depends on its individual scaling. Each bonus approaches a certain maximum
        multiplier, again depending on its scaling.
      </Typography>
    </div>
  );
}
