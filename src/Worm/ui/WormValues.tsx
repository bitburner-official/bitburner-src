import { Box, Typography } from '@mui/material'
import React from 'react'
import { Worm } from '../Worm'

interface IProps {
	worm: Worm;
}

export function WormValues({ worm }: IProps) {
	return (
		<Box>
			<Typography>
				Completions: {worm.completions}
			</Typography>
		</Box>
	)
}
