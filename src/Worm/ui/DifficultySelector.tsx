import { Box, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material'
import React from 'react'
import { Difficulty, difficulties, DifficultyType } from '../Difficulty';
import { formatPercent } from '../../ui/formatNumber';

interface IProps {
	difficulty: typeof Difficulty[keyof typeof Difficulty];
	setDifficulty(value: DifficultyType): void;
}

export function DifficultySelector(props: IProps) {
	function onChange(event: SelectChangeEvent) {
		const value = Number(event.target.value);
		if (isNaN(value)) throw new Error(`Value "${event.target.value}" is not a number.`);

		const difficulty = difficulties.find(d => d.id === value);
		if (difficulty === undefined) throw new Error(`Selected invalid difficulty "${value}"`);
		props.setDifficulty(difficulty);
	}

	return (
		<Select onChange={onChange} value={props.difficulty.toString()}>
			{difficulties.map(v => (
				<MenuItem key={v.id.toString()} value={v.id.toString()}>
					<DifficultyItem difficulty={v}/>
				</MenuItem>
			))}
		</Select>
	)
}

export function DifficultyItem({ difficulty }: { difficulty: DifficultyType }) {
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