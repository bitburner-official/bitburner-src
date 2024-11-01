import { Settings } from "../Settings/Settings";
import EnRawData from "./en.json";
import JpRawData from "./jp.json";

const translations: { [key: string]: LocaleData } = {
  en: <LocaleData>(<unknown>EnRawData),
  jp: <LocaleData>(<unknown>JpRawData),
};

interface LocaleData {
  Menu: { [k: string]: string };
  Overview: { [k: string]: string };
}

export const Locale = {
  Menu: function (key: string) {
    return key in translations[Settings.InterfaceLocale].Menu ? translations[Settings.InterfaceLocale].Menu[key] : key;
  },
  Overview: function (key: string) {
    return key in translations[Settings.InterfaceLocale].Overview
      ? translations[Settings.InterfaceLocale].Overview[key]
      : key;
  },
};
