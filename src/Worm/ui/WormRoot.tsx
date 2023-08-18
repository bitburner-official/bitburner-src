import { Info } from '@mui/icons-material';
import { Container, Stack, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { dialogBoxCreate } from '../../ui/React/DialogBox';
import { BonusSelector } from './BonusSelector';
import { Worm } from '../Worm';
import { WormInput } from './WormInput';
import { WormFitness } from './WormFitness';
import { useRerender } from '../../ui/React/hooks';
import { WormEvents } from '../WormEvents';
import { DifficultySelector } from './DifficultySelector';
import { calculateFitness } from '../calculations';

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
                The worm. WIP
              </Typography>
              <br />
              <Typography>
                Guess what the worm looks like.
              </Typography>
              <br />
              <Typography>
                Get a bigger bonus the more correct the guess is.
              </Typography>
              <br />
              <Typography>
                Choose difficulties to make it easier or harder.
              </Typography>
						</>
					)}
				/>
			</Typography>
			<Typography>
				Some description here
			</Typography>
			<Stack direction="row" spacing={2}>
				<DifficultySelector difficulty={worm.difficulty.id} setDifficulty={d => worm.setDifficulty(d)}/>
				<BonusSelector // might want to pass entire worm
					bonus={worm.bonus}
					setBonus={b => worm.setBonus(b)}
					bonusMultiplier={worm.difficulty.bonusMultiplier}
					fitness={calculateFitness(worm)}/>
			</Stack>
			<WormFitness worm={worm}/>
			<WormInput worm={worm}/>
		</Container>
	)
}
