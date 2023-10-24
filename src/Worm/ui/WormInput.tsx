import React, { useState } from 'react'
import { Worm } from '../Worm';
import { Button, Stack, TextField, Typography } from '@mui/material';
import { isValidInput } from '../Automata';

interface IProps {
	worm: Worm;
}

export function WormInput({ worm }: IProps) {
	const [input, setInput] = useState("");
	const [state, setState] = useState("");

	function handleSubmit() {
		if (!isValidInput(worm.data, input)) return;
		const result = worm.evaluate(input);
		if (result === null) setState("INVALID");
		else setState(result);
	}

	return (
	<>
		<Typography>Valid Symbols: "{worm.data.symbols.join("")}"</Typography>
		<Stack direction="row">
			<TextField
				value={input}
				onChange={event => setInput(event.target.value)}
				onSubmit={handleSubmit}
			/>
			<Button disabled={!isValidInput(worm.data, input)} onClick={handleSubmit}>Submit</Button>
			{state !== "" && <Typography>Result: {state}</Typography>}
		</Stack>
	</>
	);
}