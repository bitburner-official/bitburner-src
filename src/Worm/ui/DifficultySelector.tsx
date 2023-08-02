import { Box, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material'
import React, { useState } from 'react'
import { Difficulty } from '../Difficulty';
import { difficulties } from '../data/difficulties';

interface IProps {
	setDifficulty(value: Difficulty): void;
}

export function DifficultySelector(props: IProps) {
	const [name, setName] = useState<string>(difficulties[0].name);

	function onChange(event: SelectChangeEvent) {
		const value = event.target.value;
		setName(value);

		const difficulty = difficulties.find(d => d.name === value);
		if (difficulty === undefined) throw new Error(`Selected invalid difficulty "${value}"`);
		props.setDifficulty(difficulty);
	}

	return (
		<Select onChange={onChange} value={name}>
			{difficulties.map(difficulty => (
				<MenuItem key={difficulty.name} value={difficulty.name}>
					<DifficultyItem difficulty={difficulty}/>
				</MenuItem>
			))}
		</Select>
	)
}

export function DifficultyItem({ difficulty }: { difficulty: Difficulty }) {
	return (
		<>
		<Typography component="div">
			<Box sx={{ fontWeight: "bold" }}>{difficulty.name}</Box>
			Formulas: {difficulty.formulasUsed}<br/>
			Time between changes: {difficulty.speedOfChange * 100}%<br/>
			Amount of change: {difficulty.amountOfChange * 100}%<br/>
		</Typography>
		</>
	)
}