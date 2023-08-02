import React, { useCallback, useMemo, useState } from 'react'
import { Worm } from '../Worm';
import { Button, Table, TableBody, TableRow, TextField } from '@mui/material';
import { isValidNumber } from '../helpers/calculations';

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
		const number = Number(value);

		setInput(arr => {
			arr[index] = value;
			return arr.slice();
		});
		if (isValid(number)) setGuess(arr => {
			arr[index] = number;
			return arr.slice();
		});
  }, [isValid, setGuess, setInput]);

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
      <Table>
        <TableBody>
          {guess.reduce<number[][]>((acc, cur, i) => {
						acc[Math.floor(i / 4)] ??= [];
						acc[Math.floor(i / 4)].push(cur);
						return acc;
					}, []).map((arr, i) => (
            <TableRow key={i}>
              {arr.map((cur, j) => (
                <td key={i + " " + j }>
								<TextField
									sx={{ width: "100px", margin: "4px" }}
									error={!isValid(Number(input[4 * i + j]))}
									color={isSaved(4 * i + j, Number(input)) ? "primary" : "warning"}
									value={cur}
									onChange={event => handleChange(i * 4 + j, event.target.value)}
								/>
                </td>
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