import { Box, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material'
import React from 'react'
import { Difficulty } from '../Difficulty';
import { difficulties } from '../data/difficulties';
import { formatPercent } from '../../ui/formatNumber';

interface IProps {
	difficulty: string;
	setDifficulty(value: Difficulty): void;
}

export function DifficultySelector(props: IProps) {
	function onChange(event: SelectChangeEvent) {
		const value = event.target.value;

		const difficulty = difficulties.find(d => d.name === value);
		if (difficulty === undefined) throw new Error(`Selected invalid difficulty "${value}"`);
		props.setDifficulty(difficulty);
	}

	return (
		<Select onChange={onChange} value={props.difficulty}>
			{difficulties.map(v => (
				<MenuItem key={v.name} value={v.name}>
					<DifficultyItem difficulty={v}/>
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
			Multiplier: {formatPercent(difficulty.bonusMultiplier)}<br/>
			Complexity: {difficulty.complexity}<br/>
			Time between changes: {formatPercent(difficulty.windowBetweenChange)}<br/>
			Amount of change: {formatPercent(difficulty.amountOfChange)}<br/>
		</Typography>
		</>
	)
}