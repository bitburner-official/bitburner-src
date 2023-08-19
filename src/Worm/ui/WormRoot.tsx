import { Info } from '@mui/icons-material';
import { Box, Container, Stack, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { dialogBoxCreate } from '../../ui/React/DialogBox';
import { BonusSelector } from './BonusSelector';
import { Worm } from '../Worm';
import { WormValues } from './WormValues';
import { useRerender } from '../../ui/React/hooks';
import { WormEvents } from '../WormEvents';
import { DifficultySelector } from './DifficultySelector';
import { calculateFitness } from '../calculations';
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
                <Box sx={{ fontWeight: "bold "}}>Guessing</Box>
								Your guess is an array of 16 different numbers, ranging from -1 to 1 inclusive.<br />
								You can either guess manually through the UI or make a script to guess for you.<br />
              </Typography>
              <br />
              <Typography>
								<Box sx={{ fontWeight: "bold "}}>Fitness and Insight</Box>
								The fitness of the worm represents how good your current guess is. <br />
								100% fitness means your guess matches the worm completely. <br />
								The insight of the worm is the average of your worst guesses over a period of time. <br />
								The insight changes every time the worm changes. <br />
								Both of these values determine what multiplier you recieve. <br />
								Fitness contributes 60%, while Insight contributes only 40%.
              </Typography>
							<br />
              <Typography>
								<Box sx={{ fontWeight: "bold "}}>Difficulty</Box>
								The difficulty of the worm greatly changes how hard and rewarding the worm is. <br />
								Each difficulty setting can change how fast the worm changes and how big these changes are. <br />
								These settings also control how complex the underlying values are <br />
								and how penalyzing differences between the guess and worm are.
              </Typography>
              <br />
              <Typography>
								<Box sx={{ fontWeight: "bold "}}>Bonus</Box>
								The bonus of the worm is the reward you get for achieving good guesses. <br />
								While these bonuses are very powerful, you also need to spend a lot of resources to maintain them. <br />
								Each bonus has a certain power level, which gets scaled based on your guesses.
              </Typography>
              <br />
							<Typography>
								<Box sx={{ fontWeight: "bold "}}>Advanced</Box>
								Internally, the worm is made of a large variety of sin waves, each multiplied by a changing amplitude. <br />
								The sum of those formulas gets divided by the amount used. <br /> 
								The number of formulas used scales based on the complexity of the current difficulty. <br />
								The resulting fitness of your guess is not linear. <br />
								The difference of the guess and the worm is scaled by the complexity of the difficulty and transformed by some function.
              </Typography>
						</>
					)}
				/>
			</Typography>
			<Typography>
				The worm is a series of numbers you have to guess. A closer guess to the correct worm rewards you with higher multipliers.
			</Typography>
			<Stack direction="row" spacing={2}>
				<DifficultySelector difficulty={worm.difficulty.id} setDifficulty={d => worm.setDifficulty(d)}/>
				<BonusSelector // might want to pass entire worm
					bonus={worm.bonus}
					insight={worm.insight}
					setBonus={b => worm.setBonus(b)}
					bonusMultiplier={worm.difficulty.bonusMultiplier}
					fitness={calculateFitness(worm)}/>
			</Stack>
			<WormValues worm={worm}/>
			<WormInput worm={worm}/>
		</Container>
	)
}
