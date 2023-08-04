import { Box, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material'
import React from 'react'
import { Bonus, BonusType, bonusTypeNumbers } from '../BonusType'

interface IProps {
	bonus: BonusType;
	setBonus(value: BonusType): void;
}

export function BonusSelector(props: IProps) {
	function onChange(event: SelectChangeEvent) {
		const value = Number(event.target.value);
		if (!Object.values(BonusType).includes(value)) throw new Error(`Chosen BonusType "${value}" does not exist.`);

		props.setBonus(value);
	}

	return (
		<Select onChange={onChange} value={String(props.bonus)}>
			{bonusTypeNumbers.map(i => (
				<MenuItem key={i} value={i}>
					<BonusItem bonus={BonusType[Number(i)]}/>
				</MenuItem>
			))}
		</Select>
	)
}

export function BonusItem({ bonus }: { bonus: string }) {
	return (
		<>
		<Typography component="div">
			<Box sx={{ fontWeight: "bold" }}>{bonus}</Box>
			{Bonus(BonusType[bonus as keyof typeof BonusType])}
		</Typography>
		</>
	)
}