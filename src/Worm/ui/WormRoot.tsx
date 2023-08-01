import { Info } from '@mui/icons-material';
import { Button, Container, Typography } from '@mui/material';
import React, { useState } from 'react';
import { dialogBoxCreate } from '../../ui/React/DialogBox';
import { NumberInput } from '../../ui/React/NumberInput';
import { KEY } from "../../utils/helpers/keyCodes";
import { BonusTime } from './BonusTime';
import { Player } from '@player';

export function WormRoot(): React.ReactElement {
	const [input, setInput] = useState<number | null>(null);
	const isValidInput = true;

	function setWorm() {
		if (!isValidInput) return;

		console.log("SET WORM", input);
	}

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === KEY.ENTER) setWorm();
  }

	if (Player.worm === null) return (
	<>
		<Typography>You shouldn't be here...</Typography>
	</>
	)

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
			<BonusTime worm={Player.worm}/>
			<NumberInput
				type="number"
				onChange={setInput}
				onKeyDown={onKeyDown}
				placeholder="Your guess here"
			/>
			<Button
				disabled={!isValidInput}
				sx={{ mx: 1 }}
				onClick={setWorm}
			>
				Guess
			</Button>
		</Container>
	)
}
