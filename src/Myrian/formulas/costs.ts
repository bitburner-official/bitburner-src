import { DeviceType } from "@enums";

// parameters for a exponential formula, a^(b*X+c)+d
type ExponentialFormulaParams = [number, number, number, number];

// Parameters for a cost that shouldn't be available. Such as upgrading the max energy of a isocket.
const NA: ExponentialFormulaParams = [Infinity, Infinity, Infinity, Infinity];

type DeviceScale = Record<DeviceType, ExponentialFormulaParams>;

// Default scale for each device type, helps simplify code.
const defaultScale = Object.keys(DeviceType).reduce((acc, type) => ({ ...acc, [type]: NA }), {}) as DeviceScale;

// Exponential formula, a^(b*X+c)+d
const exp = (p: ExponentialFormulaParams, x: number): number => Math.pow(p[0], p[1] * x + p[2]) + p[3];

// Wrap exp with a specific scale for each device type.
const makeExpFunction = (p: Partial<DeviceScale>) => {
  const scale = { ...defaultScale, ...p };
  return (type: DeviceType, x: number) => exp(scale[type], x);
};

export const upgradeMaxContentCost = makeExpFunction({
  [DeviceType.Bus]: [8, 0.5, 2, 0],
  [DeviceType.ISocket]: [4, 1, 5, 0],
  [DeviceType.Reducer]: [256, 1, -3, 512],
  [DeviceType.Cache]: [1.2, 10, 0, 63],
});

export const upgradeTierCost = makeExpFunction({
  [DeviceType.Reducer]: [1.5, 1, 2, 0],
  [DeviceType.Battery]: [2, 1, 3, 0],
});

export const upgradeEmissionCost = makeExpFunction({
  [DeviceType.ISocket]: [2, 1, 3, 0],
});

export const upgradeMoveLvlCost = makeExpFunction({
  [DeviceType.Bus]: [2, 1, 3, 0],
});

export const upgradeTransferLvlCost = makeExpFunction({
  [DeviceType.Bus]: [2, 1, 3, 0],
});

export const upgradeReduceLvlCost = makeExpFunction({
  [DeviceType.Bus]: [2, 1, 3, 0],
});

export const upgradeInstallLvlCost = makeExpFunction({
  [DeviceType.Bus]: [2, 1, 3, 0],
});

export const upgradeMaxEnergyCost = makeExpFunction({
  [DeviceType.Bus]: [1.1, 1, -8, 16],
  [DeviceType.Battery]: [1.1, 1, -16, 8],
});

export const installDeviceCost = makeExpFunction({
  [DeviceType.Bus]: [4, 0.5, 2, 0],
  [DeviceType.ISocket]: [2, 1, 4, 0],
  [DeviceType.OSocket]: [4, 1, 3, 0],
  [DeviceType.Reducer]: [5, 0.5, 1, 0],
  [DeviceType.Cache]: [1.2, 5, 0, 18],
  [DeviceType.Battery]: [1.2, 10, 0, 63],
});
