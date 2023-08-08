import { Difficulty } from "../Difficulty";

// bonusMultiplier should not go above 1
export const difficulties: Difficulty[] = [
	{
		name: "Manual",
		complexity: 1,
		amountOfChange: 0.5,
		windowBetweenChange: 4,
		bonusMultiplier: 0.33
	},
	{
		name: "Normal",
		complexity: 2,
		amountOfChange: 1,
		windowBetweenChange: 2,
		bonusMultiplier: 0.66
	},
	{
		name: "Fast",
		complexity: 3,
		amountOfChange: 2,
		windowBetweenChange: 1,
		bonusMultiplier: 1
	}
];