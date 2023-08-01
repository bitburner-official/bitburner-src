import { Info } from '@mui/icons-material';
import { Button, Container, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { dialogBoxCreate } from '../../ui/React/DialogBox';
import { KEY } from "../../utils/helpers/keyCodes";
import { BonusTime } from './BonusTime';
import { Player } from '@player';
import { BonusSelector } from './BonusSelector';
import { BonusType } from '../BonusType';
import { Worm } from '../Worm';

interface IProps {
	worm: Worm | null;
}

export function WormRoot({ worm }: IProps): React.ReactElement {
	const [input, setInput] = useState<string>("");
	const [bonus, setBonus] = useState<BonusType>("None" as unknown as BonusType);
	const isValidInput = true;

	function setWorm() {
		if (!isValidInput) return;

		console.log(worm, input);
	}

	function onChange(event: React.ChangeEvent<HTMLInputElement>) {
		setInput(event.target.value);
	}

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === KEY.ENTER) setWorm();
  }

	if (Player.worm === null) return <Typography>You shouldn't be here...</Typography>;

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
			<BonusTime worm={Player.worm}/>
			<TextField
				onChange={onChange}
				onKeyDown={onKeyDown}
				placeholder="0.32, 0.54, 0.23"
				InputProps={{
					startAdornment: "[",
					endAdornment: "]"
				}}
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
