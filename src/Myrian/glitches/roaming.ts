import { DeviceType, Glitch } from "@enums";
import { myrian, myrianSize } from "../Myrian";
import { findDevice, inMyrianBounds } from "../Myrian";
import { roamingTime } from "../formulas/glitches";

const clamp = (min: number, v: number, max: number) => Math.min(Math.max(v, min), max);

let globalOffset = 0;

const dirDiff = (v: number): number => {
  globalOffset++;
  const r = Math.random();
  const d = v - (myrianSize - 1) / 2;
  const h = d > 0 ? -1 : 1;

  const dv = Math.floor(r * 3 + h * Math.random() * Math.sin(globalOffset * 0.05) * Math.abs(d)) - 1;
  return clamp(-1, dv, 1);
};

const isEmpty = (x: number, y: number) => {
  if (!inMyrianBounds(x, y)) return false;
  return !findDevice([x, y]);
};

const dirs = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
];

const applyRoaming = () => {
  const roaming = myrian.glitches[Glitch.Roaming];
  setTimeout(applyRoaming, roamingTime(roaming));
  if (roaming === 0) return;
  myrian.devices.forEach((device) => {
    if (device.type !== DeviceType.OSocket && device.type !== DeviceType.ISocket) return;
    if (device.isBusy) return;
    let canMove = false;
    for (const dir of dirs) {
      const [dx, dy] = dir;
      if (isEmpty(device.x + dx, device.y + dy)) {
        canMove = true;
        break;
      }
    }
    let x = -1;
    let y = -1;
    if (canMove) {
      let dx = dirDiff(device.x);
      let dy = dirDiff(device.y);

      if (dx !== 0 && dy !== 0) {
        if (Math.random() > 0.5) {
          dx = 0;
        } else {
          dy = 0;
        }
      }
      x = device.x + dx;
      y = device.y + dy;
    } else {
      x = Math.floor(Math.random() * myrianSize);
      y = Math.floor(Math.random() * myrianSize);
    }

    if (findDevice([x, y])) return;
    if (!inMyrianBounds(x, y)) return;
    device.x = x;
    device.y = y;
  });
};

export const startRoaming = () => setTimeout(applyRoaming, 0);
