import { Box, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material'
import React from 'react'
import { Bonus, BonusType, bonusTypeNumbers, getCurrentBonusPower, stringIsBonusTypeKey } from '../BonusType'
import { formatPercent } from '../../ui/formatNumber';

interface IProps {
	fitness: number;
	bonusMultiplier: number;
	bonus: BonusType;
	setBonus(value: BonusType): void;
}

function formatMultiplier(effect: number, type: BonusType): string {
	const bonusText = Bonus(type);
  if (bonusText.includes("+x%")) {
    return bonusText.replace(/-*x%/, formatPercent(effect - 1));
  } else if (bonusText.includes("-x%")) {
    const perc = formatPercent(1 - effect);
    return bonusText.replace(/-x%/, perc);
  } else {
    return bonusText;
  }
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
					<BonusItem bonus={BonusType[Number(i)]} fitness={props.fitness} bonusMultiplier={props.bonusMultiplier}/>
				</MenuItem>
			))}
		</Select>
	)
}

export function BonusItem({ bonus, fitness, bonusMultiplier }: { bonus: string, fitness: number, bonusMultiplier: number }) {
	if (!stringIsBonusTypeKey(bonus)) throw new Error(`String "${bonus}" is not a key of BonusType.`);
	return (
		<>
		<Typography component="div">
			<Box sx={{ fontWeight: "bold" }}>{bonus}</Box>
			{formatMultiplier(getCurrentBonusPower(BonusType[bonus], fitness, bonusMultiplier), BonusType[bonus])}
		</Typography>
		</>
	)
}