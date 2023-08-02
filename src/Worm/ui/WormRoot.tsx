import { Info } from '@mui/icons-material';
import { Container, Typography } from '@mui/material';
import React, { useState } from 'react';
import { dialogBoxCreate } from '../../ui/React/DialogBox';
import { BonusTime } from './BonusTime';
import { BonusSelector } from './BonusSelector';
import { BonusType } from '../BonusType';
import { Worm } from '../Worm';
import { WormInput } from './WormInput';

interface IProps {
	worm: Worm | null;
}

export function WormRoot({ worm }: IProps): React.ReactElement {
	const [bonus, setBonus] = useState<BonusType>("None" as unknown as BonusType);

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
			<BonusSelector setBonus={setBonus}/>
			<Typography>
				Current effect of {bonus}: 0%. Not implemented, duh
			</Typography>
			<BonusTime worm={worm}/>
			<WormInput worm={worm}/>
		</Container>
	)
}
