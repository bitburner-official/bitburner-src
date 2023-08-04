import { Info } from '@mui/icons-material';
import { Container, Stack, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { dialogBoxCreate } from '../../ui/React/DialogBox';
import { BonusSelector } from './BonusSelector';
import { Bonus, BonusType } from '../BonusType';
import { Worm } from '../Worm';
import { WormInput } from './WormInput';
import { WormFitness } from './WormFitness';
import { useRerender } from '../../ui/React/hooks';
import { WormEvents } from '../WormEvents';
import { DifficultySelector } from './DifficultySelector';
import { formatPercent } from '../../ui/formatNumber';
import { calculateBonus, calculateFitness } from '../helpers/calculations';

interface IProps {
	worm: Worm | null;
}

function formatMultiplier(effect: number, type: BonusType): string {
	const bonusText = Bonus(type);
  if (bonusText.includes("+x%")) {
    return bonusText.replace(/-*x%/, formatPercent(effect - 1));
  } else if (bonusText.includes("-x%")) {
    const perc = formatPercent(1 - 1 / effect);
    return bonusText.replace(/-x%/, perc);
  } else {
    return bonusText;
  }
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
				<DifficultySelector difficulty={worm.difficulty.name} setDifficulty={d => worm.setDifficulty(d)}/>
				<BonusSelector bonus={worm.bonus} setBonus={bonus => worm.bonus = bonus}/>
			</Stack>
			<Typography>
				Current effect of {BonusType[worm.bonus]}: {formatMultiplier(calculateBonus(calculateFitness(worm), worm.difficulty.bonusMultiplier), worm.bonus)}
			</Typography>
			<WormFitness worm={worm}/>
			<WormInput worm={worm}/>
		</Container>
	)
}
