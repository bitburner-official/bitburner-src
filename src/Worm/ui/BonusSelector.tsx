import { Box, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material'
import React from 'react'
import { BonusType, bonuses, getCurrentBonusPower, numberIsBonusValue } from '../BonusType'
import { formatPercent } from '../../ui/formatNumber';

interface IProps {
	fitness: number;
	insight: number;
	bonusMultiplier: number;
	bonus: BonusType;
	setBonus(value: BonusType): void;
}

function formatMultiplier(power: number, data: BonusType): string {
  if (data.description.includes("+x%")) {
    return data.description.replace(/-*x%/, formatPercent(power - 1));
  } else if (data.description.includes("-x%")) {
    const perc = formatPercent((1 / power) - 1);
    return data.description.replace(/-x%/, perc);
  } else {
    return data.description.replace(/x%/, formatPercent(power - 1));
  }
}

export function BonusSelector(props: IProps) {
	function onChange(event: SelectChangeEvent) {
		const value = Number(event.target.value);
		if (!numberIsBonusValue(value)) throw new Error(`Chosen Bonus "${value}" does not exist.`);

		const data = bonuses.find(b => b.id === value);
		if (data === undefined) throw new Error(`Chosen Bonus "${value}" does not exist.`);

		props.setBonus(data);
	}

	return (
		<Select onChange={onChange} value={String(props.bonus.id)}>
			{bonuses.map(b => (
				<MenuItem key={String(b.id)} value={String(b.id)}>
					<BonusItem
						bonus={b}
						insight={props.insight}
						fitness={props.fitness}
						bonusMultiplier={props.bonusMultiplier}
					/>
				</MenuItem>
			))}
		</Select>
	)
}

interface ItemProps {
	bonus: BonusType,
	insight: number;
	fitness: number,
	bonusMultiplier: number
}

export function BonusItem({ bonus, insight, fitness, bonusMultiplier }: ItemProps) {
	return (
		<>
		<Typography component="div">
			<Box sx={{ fontWeight: "bold" }}>{bonus.id} - {bonus.name}</Box>
			{formatMultiplier(getCurrentBonusPower(bonus, insight, fitness, bonusMultiplier), bonus)}
		</Typography>
		</>
	)
}