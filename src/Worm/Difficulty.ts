export interface DifficultyType {
	id: typeof Difficulty[keyof typeof Difficulty];
	name: string;

	complexity: number;
	amountOfChange: number;
	windowBetweenChange: number;
	bonusMultiplier: number;
}

export const Difficulty = {
	MANUAL: 0,
	NORMAL: 1,
	FAST: 2,
} as const;

export const difficulties: DifficultyType[] = [
	{
		id: Difficulty.MANUAL,
		name: "Manual",
		complexity: 1,
		amountOfChange: 0.5,
		windowBetweenChange: 4,
		bonusMultiplier: 0.33
	},
	{
		id: Difficulty.NORMAL,
		name: "Normal",
		complexity: 2,
		amountOfChange: 1,
		windowBetweenChange: 2,
		bonusMultiplier: 0.66
	},
	{
		id: Difficulty.FAST,
		name: "Fast",
		complexity: 3,
		amountOfChange: 2,
		windowBetweenChange: 1,
		bonusMultiplier: 1
	}
];