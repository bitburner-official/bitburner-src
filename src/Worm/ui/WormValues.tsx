import { Box, Typography } from '@mui/material'
import React from 'react'
import { Worm } from '../Worm'
import { calculateFitness } from '../calculations';
import { formatPercent } from '../../ui/formatNumber';

interface IProps {
	worm: Worm;
}

export function WormValues({ worm }: IProps) {
	const fitness = calculateFitness(worm);
	return (
		<Box>
			<Typography>
				Worm fitness: {formatPercent(fitness)}<br />
				Worm insight: {formatPercent(worm.insight)}
			</Typography>
		</Box>
	)
}
