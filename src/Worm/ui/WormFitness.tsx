import { Box, Typography } from '@mui/material'
import React from 'react'
import { Worm } from '../Worm'
import { calculateFitness } from '../helpers/calculations';

interface IProps {
	worm: Worm;
}

export function WormFitness({ worm }: IProps) {
	const fitness = calculateFitness(worm);
	return (
		<Box>
			<Typography>
				Worm fitness: {Math.round(fitness * 100 * 100) / 100}%
			</Typography>
		</Box>
	)
}
