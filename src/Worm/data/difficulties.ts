import { Difficulty } from "../Difficulty";

export const difficulties: Difficulty[] = [
	{
		name: "Manual",
		formulasUsed: 4,
		amountOfChange: 0.5,
		windowBetweenChange: 4,
		bonusMultiplier: 0.5
	},
	{
		name: "Normal",
		formulasUsed: 8,
		amountOfChange: 1,
		windowBetweenChange: 2,
		bonusMultiplier: 1
	},
	{
		name: "Fast",
		formulasUsed: 12,
		amountOfChange: 2,
		windowBetweenChange: 1,
		bonusMultiplier: 2
	}
];