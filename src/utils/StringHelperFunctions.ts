import { Settings } from "../Settings/Settings";
import { pluralize } from "./I18nUtils";

/*
Converts a date representing time in milliseconds to a string with the format H hours M minutes and S seconds
e.g.    10000 -> "10 seconds"
        120000 -> "2 minutes and 0 seconds"
*/
export function convertTimeMsToTimeElapsedString(time: number, showMilli = false): string {
  const negFlag = time < 0;
  time = Math.abs(Math.floor(time));
  const millisecondsPerSecond = 1000;
  const secondPerMinute = 60;
  const minutesPerHours = 60;
  const secondPerHours: number = secondPerMinute * minutesPerHours;
  const hoursPerDays = 24;
  const secondPerDay: number = secondPerHours * hoursPerDays;

  // Convert ms to seconds, since we only have second-level precision
  const totalSeconds: number = Math.floor(time / millisecondsPerSecond);

  const days: number = Math.floor(totalSeconds / secondPerDay);
  const secTruncDays: number = totalSeconds % secondPerDay;

  const hours: number = Math.floor(secTruncDays / secondPerHours);
  const secTruncHours: number = secTruncDays % secondPerHours;

  const minutes: number = Math.floor(secTruncHours / secondPerMinute);
  const secTruncMinutes: number = secTruncHours % secondPerMinute;

  const milliTruncSec: string = (() => {
    let str = `${time % millisecondsPerSecond}`;
    while (str.length < 3) str = "0" + str;
    return str;
  })();

  const seconds: string = showMilli ? `${secTruncMinutes}.${milliTruncSec}` : `${secTruncMinutes}`;

  let res = "";
  if (days > 0) {
    res += `${pluralize(days, "day")} `;
  }
  if (hours > 0 || (Settings.ShowMiddleNullTimeUnit && res != "")) {
    res += `${pluralize(hours, "hour")} `;
  }
  if (minutes > 0 || (Settings.ShowMiddleNullTimeUnit && res != "")) {
    res += `${pluralize(minutes, "minute")} `;
  }
  res += `${seconds} second${!showMilli && secTruncMinutes === 1 ? "" : "s"}`;

  return negFlag ? `-(${res})` : res;
}

// Finds the longest common starting substring in a set of strings
export function longestCommonStart(strings: string[]): string {
  if (!containsAllStrings(strings)) {
    return "";
  }
  if (strings.length === 0) {
    return "";
  }

  const a1: string = strings[0];
  for (let i = 0; i < a1.length; ++i) {
    const chr = a1.charAt(i).toUpperCase();
    for (let s = 1; s < strings.length; ++s) {
      if (chr !== strings[s].charAt(i).toUpperCase()) {
        return a1.substring(0, i);
      }
    }
  }
  return a1;
}

// Returns whether an array contains entirely of string objects
export function containsAllStrings(arr: string[]): boolean {
  return arr.every((value) => typeof value === "string");
}

// Generates a random alphanumeric string with N characters
export function generateRandomString(n: number): string {
  let str = "";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < n; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return str;
}

export function capitalizeFirstLetter(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function capitalizeEachWord(s: string): string {
  return s
    .split(" ")
    .map((word) => capitalizeFirstLetter(word))
    .join(" ");
}

export function getKeyFromReactElements(a: string | React.JSX.Element, b: string | React.JSX.Element): string {
  const keyOfA = typeof a === "string" ? a : a.key ?? "";
  const keyOfb = typeof b === "string" ? b : b.key ?? "";
  return keyOfA + keyOfb;
}
