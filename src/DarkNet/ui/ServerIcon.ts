import {
  ConnectedTv,
  LaptopMac,
  DesktopMac,
  Dns,
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
  CallSplit,
  SignalWifiStatusbarConnectedNoInternet4,
  Calculate,
  Watch,
  NoCell,
  SettingsPower,
  VideogameAsset,
  AccountBalance,
  Elevator,
  Fax,
  AssuredWorkload,
  SvgIconComponent,
} from "@mui/icons-material";
import { ModelIds } from "../Enums";

export const getIcon = (model: string): SvgIconComponent => {
  switch (model) {
    case ModelIds.EchoVuln:
      return ConnectedTv;
    case ModelIds.SortedEchoVuln:
      return LaptopMac;
    case ModelIds.NoPassword:
      return PhoneIphone;
    case ModelIds.Captcha:
      return Dns;
    case ModelIds.DefaultPassword:
      return LiveTv;
    case ModelIds.BufferOverflow:
      return Terminal;
    case ModelIds.MastermindHint:
      return SatelliteAlt;
    case ModelIds.TimingAttack:
      return Fax;
    case ModelIds.LargestPrimeFactor:
      return Calculate;
    case ModelIds.RomanNumeral:
      return Watch;
    case ModelIds.DogNames:
      return DesktopMac;
    case ModelIds.GuessNumber:
      return Dvr;
    case ModelIds.CommonPasswordDictionary:
      return Subtitles;
    case ModelIds.EUCountryDictionary:
      return Web;
    case ModelIds.Yesn_t:
      return NoCell;
    case ModelIds.BinaryEncodedFeedback:
      return SettingsPower;
    case ModelIds.SpiceLevel:
      return Microwave;
    case ModelIds.ConvertToBase10:
      return VideogameAsset;
    case ModelIds.parsedExpression:
      return AccountBalance;
    case ModelIds.divisibilityTest:
      return ElectricCar;
    case ModelIds.tripleModulo:
      return Blender;
    case ModelIds.globalMaxima:
      return Elevator;
    case ModelIds.packetSniffer:
      return SignalWifiStatusbarConnectedNoInternet4;
    case ModelIds.encryptedPassword:
      return AssuredWorkload;
    case ModelIds.labyrinth:
      return CallSplit;
    default:
      return ConnectedTv;
  }
};
