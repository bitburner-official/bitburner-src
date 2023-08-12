import React, { useCallback, useMemo, useState } from 'react'
import { Worm } from '../Worm';
import { Button, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { formatWormNumber, isValidNumber } from '../helpers/calculations';

interface IProps {
	worm: Worm;
}

export function WormInput({ worm }: IProps) {
  const [guess, setGuess] = useState(worm.guess);
	const [input, setInput] = useState(worm.guess.map(n => n.toString()));

  // in useCallback to prevent infinite update loop
	const isValid = useCallback((val: number) => isValidNumber(worm, val), [worm]);
	const isSaved = useCallback((index: number, val: number) => val === worm.guess[index], [worm]);

  const handleChange = useCallback((index: number, value: string) => {
		const number = formatWormNumber(Number(value));

		setInput(arr => {
			arr[index] = value;
			return arr.slice();
		});
		if (isValid(number)) setGuess(arr => {
			arr[index] = number;
			return arr.slice();
		});
  }, [isValid, setGuess, setInput]);

	const handleBlur = useCallback((index: number) => {
		const number = formatWormNumber(Number(input[index]));

		setInput(arr => {
			arr[index] = String(number);
			return arr.slice();
		});
		if (isValid(number)) setGuess(arr => {
			arr[index] = number;
			return arr.slice();
		});
  }, [input, isValid, setGuess, setInput]);

	const handleReset = useCallback(() => {
		setGuess(worm.guess.slice());
		setInput(worm.guess.map(n => n.toString()));
	}, [worm.guess, setGuess, setInput]);
	const handleSubmit = useCallback(() => {
		worm.setGuess(guess);
		handleReset();
	}, [worm, guess, handleReset]);

	const allValid = useMemo(() => guess.every(num => isValid(num)), [guess, isValid]);
	const allSaved = useMemo(() => guess.every((num, i) => isSaved(i, num)), [guess, isSaved]);

  return (
    <>
      <Table sx={{ width: "432px", height: "192px" }}>
				<TableHead>
					<TableRow>
						<TableCell colSpan={4}>
							<Typography textAlign="center">
								Manual Inputs
							</Typography>
						</TableCell>
					</TableRow>
				</TableHead>
        <TableBody>
          {input.reduce<string[][]>((acc, cur, i) => {
						acc[Math.floor(i / 4)] ??= [];
						acc[Math.floor(i / 4)].push(cur);
						return acc;
					}, []).map((arr, i) => (
            <TableRow key={i}>
              {arr.map((cur, j) => (
                <TableCell 
									key={i + " " + j }
									sx={{ margin: 0, padding: "4px" }}
								>
									<TextField
										error={!isValid(Number(cur))}
										// not working at the moment
										// color={isSaved(4 * i + j, Number(cur)) ? "primary" : "warning"}
										focused={!isSaved(4 * i + j, Number(cur))}
										value={cur}
										onChange={event => handleChange(i * 4 + j, event.target.value)}
										onBlur={() => handleBlur(i * 4 + j)}
									/>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
			<Button onClick={handleReset} disabled={allSaved}>Discard</Button>
			<Button onClick={handleSubmit} disabled={!allValid || allSaved}>Apply</Button>
    </>
  );
}