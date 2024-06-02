import { Glitch } from "@enums";
import { myrian, myrianSize } from "../Myrian";
import { findDevice } from "../Myrian";
import { NewLock } from "../NewDevices";

const applySegmentation = () => {
  const segmentation = myrian.glitches[Glitch.Segmentation];
  for (let i = 0; i < segmentation; i++) {
    const x = Math.floor(Math.random() * myrianSize);
    const y = Math.floor(Math.random() * myrianSize);
    if (findDevice([x, y])) continue;
    NewLock(`lock-${x}-${y}`, x, y);
  }
};

export const startSegmentation = () => setInterval(applySegmentation, 30000);
