import { Device, DeviceID } from "@nsdefs";
import { DeviceType, Component, Glitch } from "@enums";
import { glitchMult } from "./formulas/glitches";
import { isDeviceISocket, pickOne } from "./utils";
import { componentTiers } from "./formulas/components";
import { NewBus, NewISocket, NewOSocket } from "./NewDevices";
import { startRoaming } from "./glitches/roaming";
import { startRust } from "./glitches/rust";
import { startSegmentation } from "./glitches/segmentation";
import { startBattery } from "./glitches/battery";

export interface Myrian {
  vulns: number;
  totalVulns: number;
  devices: Device[];
  glitches: Record<Glitch, number>;
  rust: Record<string, boolean>;
}

export const myrianSize = 12;

const defaultGlitches = Object.values(Glitch).reduce((acc, g) => ({ ...acc, [g]: 0 }), {}) as Record<Glitch, number>;

export const myrian: Myrian = {
  vulns: 0,
  totalVulns: 0,
  devices: [],
  glitches: { ...defaultGlitches },
  rust: {},
};

export const loadMyrian = (save: string) => {
  resetMyrian();
  startRoaming();
  startRust();
  startSegmentation();
  startBattery();
  if (!save) return;
  const savedMyrian = JSON.parse(save);
  Object.assign(myrian, savedMyrian);
  myrian.devices.forEach((d) => (d.isBusy = false));
  myrian.devices.filter(isDeviceISocket).forEach((d) => (d.content = new Array(d.maxContent).fill(d.emitting)));
};

export const inMyrianBounds = (x: number, y: number) => x >= 0 && x < myrianSize && y >= 0 && y < myrianSize;

export const findDevice = (id: DeviceID, type?: DeviceType): Device | undefined =>
  myrian.devices.find(
    (e) => (typeof id === "string" ? e.name === id : e.x === id[0] && e.y === id[1]) && (!type || type === e.type),
  );

export const removeDevice = (id: DeviceID, type?: DeviceType) => {
  myrian.devices = myrian.devices.filter(
    (e) => !((typeof id === "string" ? e.name === id : e.x === id[0] && e.y === id[1]) && (!type || type === e.type)),
  );
};

export const getTotalGlitchMult = () =>
  Object.entries(myrian.glitches).reduce((acc, [glitch, lvl]) => {
    return acc * glitchMult(glitch as Glitch, lvl);
  }, 1);

export const getNextOSocketRequest = (tier: number) => {
  const potential = componentTiers.slice(0, tier + 1).flat();
  return new Array(Math.floor(Math.pow(Math.random() * tier, 0.75) + 1)).fill(null).map(() => pickOne(potential));
};

export const countDevices = (type: DeviceType) =>
  myrian.devices.reduce((acc, d) => (d.type === type ? acc + 1 : acc), 0);

export const resetMyrian = () => {
  myrian.vulns = 0;
  myrian.totalVulns = 0;
  myrian.devices = [];
  myrian.glitches = { ...defaultGlitches };
  myrian.rust = {};

  NewBus("alice", Math.floor(myrianSize / 2), Math.floor(myrianSize / 2));

  NewISocket("isocket0", Math.floor(myrianSize / 4), 0, Component.R0);
  NewISocket("isocket1", Math.floor(myrianSize / 2), 0, Component.G0);
  NewISocket("isocket2", Math.floor((myrianSize * 3) / 4), 0, Component.B0);

  NewOSocket("osocket0", Math.floor(myrianSize / 4), Math.floor(myrianSize - 1));
  NewOSocket("osocket1", Math.floor(myrianSize / 2), Math.floor(myrianSize - 1));
  NewOSocket("osocket2", Math.floor((myrianSize * 3) / 4), Math.floor(myrianSize - 1));
};
