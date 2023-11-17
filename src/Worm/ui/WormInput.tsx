import React, { useState } from 'react'
import { Worm } from '../Worm';
import { Button, Stack, TextField, Typography } from '@mui/material';
import { isValidInput } from '../Automata';
import { parseWormInputArray } from '../calculations';

interface IProps {
	worm: Worm;
}

export function WormInput({ worm }: IProps) {
	const [input, setInput] = useState("");
	const [state, setState] = useState("");
	const [guess, setGuess] = useState("");
	const [result, setResult] = useState("");

	function handleSubmit() {
		if (!isValidInput(worm.data, input)) return;
		const result = worm.evaluate(input);
		if (result === null) setState("INVALID");
		else setState(result);
	}

	function handleGuess() {
		const wormArray = parseWormInputArray(worm, guess);
		if (wormArray === null) return;
		const result = worm.solve(wormArray);
		setResult(result.toString());
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
		<Typography>Chosen "Value" Node: {worm.chosenNodes[0]}</Typography>
		<Typography>Chosen "Indegree" Node: {worm.chosenNodes[1]}</Typography>
		<Stack direction="row">
			<TextField
				value={guess}
				onChange={event => setGuess(event.target.value)}
				onSubmit={handleGuess}
				InputProps={{
					startAdornment: "[",
					endAdornment: "]"
				}}
			/>
			<Button disabled={!parseWormInputArray(worm, guess)} onClick={handleGuess}>Guess</Button>
			{result !== "" && <Typography>Reward: {result}</Typography>}
		</Stack>
	</>
	);
}