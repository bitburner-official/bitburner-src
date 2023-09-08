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
                <Box sx={{ fontWeight: "bold "}}>WIP</Box>
								Not written yet.
              </Typography>
						</>
					)}
				/>
			</Typography>
			<Typography>
				Description WIP
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
