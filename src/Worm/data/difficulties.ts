import { Difficulty } from "../Difficulty";

export const difficulties: Difficulty[] = [
	{
		name: "Manual",
		formulasUsed: 4,
		amountOfChange: 0.5,
		speedOfChange: 0.5,
		bonusMultiplier: 0.5
	},
	{
		name: "Normal",
		formulasUsed: 8,
		amountOfChange: 1,
		speedOfChange: 1,
		bonusMultiplier: 1
	},
	{
		name: "Fast",
		formulasUsed: 12,
		amountOfChange: 2,
		speedOfChange: 2,
		bonusMultiplier: 2
	}
];