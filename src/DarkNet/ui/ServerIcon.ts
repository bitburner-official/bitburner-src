import {
  ConnectedTv,
  LaptopMac,
  DesktopMac,
  Dns,
  TapAndPlay,
  PhoneIphone,
  Terminal,
  SatelliteAlt,
  Dvr,
  Microwave,
  ElectricCar,
  Blender,
  LiveTv,
  Subtitles,
  Web,
  ExitToApp,
  SvgIconComponent,
} from "@mui/icons-material";

export enum Icon {
  ConnectedTv = "ConnectedTv",
  LaptopMac = "LaptopMac",
  DesktopMac = "DesktopMac",
  Dns = "Dns",
  TapAndPlay = "TapAndPlay",
  PhoneIphone = "PhoneIphone",
  Terminal = "Terminal",
  SatelliteAlt = "SatelliteAlt",
  Dvr = "Dvr",
  Microwave = "Microwave",
  ElectricCar = "ElectricCar",
  Blender = "Blender",
  LiveTv = "LiveTv",
  Subtitles = "Subtitles",
  Web = "Web",
}

export const labIcon: string = "ExitToApp";

export const getIcon = (name: Icon | typeof labIcon): SvgIconComponent => {
  switch (name) {
    case "LaptopMac":
      return LaptopMac;
    case "DesktopMac":
      return DesktopMac;
    case "Dns":
      return Dns;
    case "TapAndPlay":
      return TapAndPlay;
    case "PhoneIphone":
      return PhoneIphone;
    case "Terminal":
      return Terminal;
    case "SatelliteAlt":
      return SatelliteAlt;
    case "Dvr":
      return Dvr;
    case "Microwave":
      return Microwave;
    case "ElectricCar":
      return ElectricCar;
    case "Blender":
      return Blender;
    case "LiveTv":
      return LiveTv;
    case "Subtitles":
      return Subtitles;
    case "Web":
      return Web;
    case "ExitToApp":
      return ExitToApp;
    default:
      return ConnectedTv;
  }
};
