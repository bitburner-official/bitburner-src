import React from "react";
import { Device } from "@nsdefs";
import { DeviceType } from "@enums";

import { BusIcon } from "./BusIcon";
import { ReducerIcon } from "./Reducer";
import { LockIcon } from "./LockIcon";
import { CacheIcon } from "./CacheIcon";
import { BatteryIcon } from "./BatteryIcon";
import { OSocketIcon } from "./OSocketIcon";
import { ISocketIcon } from "./ISocketIcon";
import {
  isDeviceBattery,
  isDeviceBus,
  isDeviceCache,
  isDeviceISocket,
  isDeviceLock,
  isDeviceOSocket,
  isDeviceReducer,
} from "../utils";

interface IDeviceIconProps {
  device: Device;
}

export const DeviceIcon = ({ device }: IDeviceIconProps): React.ReactElement => {
  if (isDeviceISocket(device)) return <ISocketIcon socket={device} />;
  if (isDeviceOSocket(device)) return <OSocketIcon socket={device} />;
  if (isDeviceBus(device)) return <BusIcon bus={device} />;
  if (isDeviceReducer(device)) return <ReducerIcon reducer={device} />;
  if (isDeviceLock(device)) return <LockIcon lock={device} />;
  if (isDeviceCache(device)) return <CacheIcon cache={device} />;
  if (isDeviceBattery(device)) return <BatteryIcon battery={device} />;
  return <></>;
};
