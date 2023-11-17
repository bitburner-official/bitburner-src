import { Info } from '@mui/icons-material';
import { Box, Container, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { dialogBoxCreate } from '../../ui/React/DialogBox';
import { BonusSelector } from './BonusSelector';
import { Worm } from '../Worm';
import { WormValues } from './WormValues';
import { useRerender } from '../../ui/React/hooks';
import { WormEvents } from '../WormEvents';
import { WormInput } from './WormInput';

interface IProps {
	worm: Worm | null;
}

export function WormRoot({ worm }: IProps): React.ReactElement {
	const rerender = useRerender();
	useEffect(() => WormEvents.subscribe(rerender), [rerender]);

	if (worm === null) return <Typography>You shouldn't be here...</Typography>;
	
	return (
		<Container maxWidth="lg" disableGutters sx={{ mx: 0 }}>
			<Typography variant="h4">
        Worm
        <Info
          sx={{ ml: 1, mb: 0 }}
          color="info"
          onClick={() => dialogBoxCreate(
            <>
              <Typography>
                <Box sx={{ fontWeight: "bold" }}>Network</Box>
								The network you have to calculate the properties for is not presented in a standard way.<br/>
								You have a given alphabet, a set of symbols you can use. You always start at the network state 0.<br/>
								From there, each state has random connections to other states.<br/>
								You can traverse these connections by entering a sequence of symbols from the given alphabet.<br/>
								The graph behind the network is a directed graph.<br/>
								Inputting the same symbol twice is not guranteed to bring you back to the predecessor.<br/>
								Each state is guranteed to have a connection to its successor. In the case of the highest state, it will loop back to state 0.<br/>
								After testing your sequence of symbols, you will recieve the state you landed on.<br/><br/>

								<Box sx={{ fontWeight: "bold" }}>Properties</Box>
								Your task is to gather information from the network and compute some properties the underlying graph has.<br/>
								The properties you have to compute are the following:<br/>
								1. Wether or not the graph is bipartite.<br/>
								In other terms, wether or not you can seperate the states of the graph in two groups,<br/>
								such that each state in a graph has no connection to a state in the same group.<br/>
								2. The shortest sequence, that leads to the highest state in the graph. There may be many possible shortest sequences.<br/>
								You only have to submit one of them.<br/>
								3. The node values for a given state. The value of a node is the highest state it connects to, minus its own value.<br/>
								4. The node indegrees for a given state. The indegree of a state is the amount of connections that lead to that state.<br/>
								If a property for a specific state is requested, you can gather the specified state through the worm API.<br/><br/>

								<Box sx={{ fontWeight: "bold" }}>Solving a network</Box>
								Once you have gathered enough data about the network and you computed all of the neccessary properties<br/>
								you can solve the network by submitting you properties using the worm API.<br/>
								Your attempt will only be successful, when your shortest path property is correct.<br/>
								If you only get the shortest path correct, you will recieve the minimum reward amount.<br/>
								If you do successfully solve a network, you will recieve the percentage of properties you got right as a reward.<br/>
								Be careful though, the network resets every time you attempt to solve it.<br/>
								If you submitted 3 out of 4 correct properties, you will recieve 0.75 completions.<br/>
								If you got all properties correct, you will recieve the maximum reward amount of 1.<br/><br/>
								
								<Box sx={{ fontWeight: "bold" }}>Completions</Box>
								The completions metric is a value that will increase with successful attempts.<br/>
								It controls how hard the underlying graph is going to be. Specifically, it will change how many states the graph has.<br/>
								The value also increase the bonus you will recieve.<br/>
								Each time you enter a new bitnode, the completions metric will be reset.<br/><br/>

								<Box sx={{ fontWeight: "bold" }}>Bonus</Box>
								The worm offers a lot of unique and powerful upgrades.<br/>
								They start off rather weak but get increasingly stronger, the more completions you achieved.<br/>
								There can only be one active bonus at a time.<br/>
              </Typography>
						</>
					)}
				/>
			</Typography>
			<Typography>
				The Worm is a highly complex program that infected the entire bitnode and create a giant network of resources.<br/>
				Simulating the behaviour of the virus gives you access to a small portion of this wealth.<br/>
				Though the program is not easily decieved, emulating the way it calculates the networks properties allows you to bypass most of its security measures.<br/>
				It is your task to develop a program that can solve the networks properties as efficient as possible.<br/>
				For a detailed description of the problem at hand click the I at the top of the page.<br/>
			</Typography>
			<BonusSelector // might want to pass entire worm
				bonus={worm.bonus}
				completions={worm.completions}
				setBonus={b => worm.setBonus(b)}
			/>
			<WormValues worm={worm}/>
			<WormInput worm={worm}/>
		</Container>
	)
}
