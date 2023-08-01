import { Box, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material'
import React, { useState } from 'react'
import { Bonus, BonusType, bonusTypeStrings } from '../BonusType'

interface IProps {
	setBonus(value: BonusType): void;
}

export function BonusSelector(props: IProps) {
	const [value, setValue] = useState<string>("None");

	function onChange(event: SelectChangeEvent) {
		const value = event.target.value;
		setValue(value);

		const index = bonusTypeStrings.indexOf(value);
		if (index === -1) throw new Error(`Chosen BonusType is not a valid BonusType. VALUE, INDEX: ${value}, ${index}`);
		console.log(event.target.value, index);

		const bonusType = BonusType[index] as unknown as BonusType;
		props.setBonus(bonusType);
	}

	return (
		<Select onChange={onChange} value={value}>
			{bonusTypeStrings.map(string => (
				<MenuItem key={string} value={string}>
					<BonusItem bonus={string}/>
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