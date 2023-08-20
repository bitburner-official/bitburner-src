export interface FormulaData {
	frequency: number;
	shift: number;
	
	amplitudes: number[];
	chosenFormulas: (typeof Formulas[keyof typeof Formulas])[];
}

export const FormulaDataFactory = (numFormulas: number): FormulaData => ({
	frequency: 1,
	shift: 1,

	amplitudes: Array.from({ length: numFormulas }, () => Math.random()),
	chosenFormulas: Array.from({ length: numFormulas }, () => Object.values(Formulas)[Math.floor(Math.random() * Object.values(Formulas).length)])
});

/** mutates input */
export const updateFormulaData = (data: FormulaData, changeMult: number) => {
	for (let i = 0; i < data.amplitudes.length; i++) {
		const change = (Math.random() - 0.5) / 5 * changeMult;
		const newVal = data.amplitudes[i] + change;

		// limit amps to min 0.05 to remove "disabled" formulas
		data.amplitudes[i] = Math.max(0.05, Math.min(0.95, newVal));
	}
};

export const Formulas = {
	SIN: 0,
	SIN_SQRT: 1,
	SIN_POW2: 2,
	SIN_POL1: 3,
	SIN_POL2: 4,
	SIN_DIVX: 5,
} as const;

export const formulaEquation: Record<typeof Formulas[keyof typeof Formulas], (x: number) => number> = {
	[Formulas.SIN]: x => Math.sin(x),
	[Formulas.SIN_SQRT]: x => Math.sin(Math.sqrt(x)),
	[Formulas.SIN_POW2]: x => Math.sin(Math.pow(x, 2)),
	[Formulas.SIN_POL1]: x => Math.sin((x + 5.64) * (x - 3.07) * (x - 19.23) / -333.34),
	[Formulas.SIN_POL2]: x => Math.sin(x * x * (x + 8) * (x - 24) / -5903 + 2),
	[Formulas.SIN_DIVX]: x => Math.sin(x) / x,
} as const;

export const evaluate = (data: FormulaData) => (x: number) => 
	(1 / data.chosenFormulas.length) *
	data.chosenFormulas.reduce<number>(
		(acc, cur, i) => acc + data.amplitudes[i] * formulaEquation[cur](data.frequency * (x + data.shift)),
		0
	);