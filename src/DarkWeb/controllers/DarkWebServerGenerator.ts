import { DWebServerBuilder } from "../models/DarkWebServerData";
import { Icon } from "./ServerIcon";
import { Server } from "../../Server/Server";
import {
  commonPasswordDictionary,
  defaultSettingsDictionary, EUCountries,
  letters,
  numbers,
  special, unicode,
} from "../models/dictionaryData";

export enum Minigames {
  EchoVuln,
  SortedEchoVuln,
  NoPassword,
  DefaultPassword,
  MastermindHint,
  TimingAttack,
  LargestPrimeFactor,
  RomanNumeral,
  DogNames,
  GuessNumber,
  CommonPasswordDictionary
}

export const getDarkWebServer = (difficulty: number, x: number, y: number): Server => {
  if (difficulty <= 2 || Math.random() < 0.1) {
    const serverBuilders = [getEchoVulnServer, getNoPasswordServer, getSortedEchoVulnServer, getDefaultPasswordServer];
    return serverBuilders[Math.floor(Math.random() * serverBuilders.length)](difficulty,x, y);
  }
  if (difficulty <= 6 || Math.random() < 0.1) {
    const serverBuilders = [
      getMastermindHintServer,
      getDefaultPasswordServer,
      getSortedEchoVulnServer,
      getDogNameServer,
      getRomanNumeralServer,
      getGuessNumberServer,
    ];
    return serverBuilders[Math.floor(Math.random() * serverBuilders.length)](difficulty,x, y);
  }
  const serverBuilders = [
    getTimingAttackServer,
    getLargestPrimeFactorServer,
    getMastermindHintServer,
    getRomanNumeralServer,
    getSortedEchoVulnServer,
    getGuessNumberServer,
    getLargeDictionaryServer,
    getEuCountryDictionaryServer,
  ];
  return serverBuilders[Math.floor(Math.random() * serverBuilders.length)](difficulty,x, y);
};

export const getName = (difficulty: number): string => {
  // TODO: Implement
  return `${getResponseTime(Math.random() * 5)}.${getResponseTime(difficulty * 5)}.0.${getResponseTime(
    Math.random() * 5,
  )}`;
};

export const getEchoVulnServer = (difficulty: number, x: number, y: number): Server => {
  const hintTemplates = [
    "The password is",
    "The PIN is",
    "Remember to use",
    "It's set to",
    "The key is",
    "The secret is",
  ];
  const password = getPassword(3);
  const hint = `${hintTemplates[Math.floor(Math.random() * hintTemplates.length)]} ${password}`;
  return DWebServerBuilder(
    {
      icon: getRandomIcon(),
      minigameType: Minigames.EchoVuln,
      password,
      passwordHint: hint,
      x,
      y,
    },
    getName(difficulty),
    difficulty,
  );
};

export const getSortedEchoVulnServer = (difficulty: number, x: number, y: number): Server => {
  const hintTemplates = [
    "The password is shuffled",
    "The key is made from",
    "I accidentally sorted the password",
    "The PIN uses these",
  ];
  const password = getPassword(3 + difficulty / 2);
  const sortedPassword = password.split("").sort().join("");
  const hint = `${hintTemplates[Math.floor(Math.random() * hintTemplates.length)]} ${sortedPassword}`;
  return DWebServerBuilder(
    {
      icon: getRandomIcon(),
      minigameType: Minigames.SortedEchoVuln,
      password: password,
      passwordHint: hint,
      passwordHintData: sortedPassword,
      x,
      y,
    },
    getName(difficulty),
    difficulty,
  );
};

export const getDictionaryAttackServer = (
  difficulty: number,
  x: number,
  y: number,
  dictionary: string[],
  hintTemplates: string[],
  minigameType: Minigames,
): Server => {
  return DWebServerBuilder(
    {
      icon: getRandomIcon(),
      minigameType,
      password: dictionary[Math.floor(Math.random() * dictionary.length)],
      passwordHint: hintTemplates[Math.floor(Math.random() * hintTemplates.length)],
      x,
      y,
    },
    getName(difficulty),
    difficulty,
  );
};

export const getNoPasswordServer = (difficulty: number, x: number, y: number): Server => {
  const hintTemplates = [
    "The password is not set",
    "There is no password",
    "The PIN is empty",
    "Did I set a code?",
    "I didn't set a password",
  ];
  return getDictionaryAttackServer(difficulty,x, y, [""], hintTemplates, Minigames.NoPassword);
};

export const getDefaultPasswordServer = (difficulty: number, x: number, y: number): Server => {
  const hintTemplates = [
    "The password is the default password",
    "It's still the default",
    "The default password is set",
    "I never changed the password",
    "It's still the factory settings",
  ];
  return getDictionaryAttackServer(difficulty,x, y, defaultSettingsDictionary, hintTemplates, Minigames.DefaultPassword);
};

export const getDogNameServer = (difficulty: number, x: number, y: number): Server => {
  const dictionary = ["fido", "spot", "rover", "max"];
  const hintTemplates = ["It's my dog's name", "It's the dog's name", "my first dog's name"];
  return getDictionaryAttackServer(difficulty,x, y, dictionary, hintTemplates, Minigames.DogNames);
};

export const getMastermindHintServer = (difficulty: number, x: number, y: number): Server => {
  return DWebServerBuilder(
    {
      icon: getRandomIcon(),
      minigameType: Minigames.MastermindHint,
      password: getPassword(2 + difficulty),
      passwordHint: "", // dynamic hint
      x,
      y,
    },
    getName(difficulty),
    difficulty,
  );
};

export const getTimingAttackServer = (difficulty: number, x: number, y: number): Server => {
  const hintTemplates = [
    "I thought about it for some time, but that is not the password.",
    "I spent a while on it, but that's not right",
    "I considered it for a bit, but that's not it",
    "I spent some time on it, but that's not the password",
  ];
  const length = 3 + difficulty;
  return DWebServerBuilder(
    {
      icon: getRandomIcon(),
      minigameType: Minigames.TimingAttack,
      password: getPassword(length, true, false),
      passwordHint: hintTemplates[Math.floor(Math.random() * hintTemplates.length)],
      x,
      y,
    },
    getName(difficulty),
    difficulty,
  );
};

export const getRomanNumeralServer = (difficulty: number, x: number, y: number): Server => {
  const password = Math.floor(Math.random() * 10 * (10 * (difficulty + 1)));
  const encodedPassword = romanNumeralEncoder(password);
  return DWebServerBuilder(
    {
      icon: getRandomIcon(),
      minigameType: Minigames.RomanNumeral,
      password: `${password}`,
      passwordHint: `The password is the value of the number ${encodedPassword}`,
      passwordHintData: encodedPassword,
      x,
      y,
    },
    getName(difficulty),
    difficulty,
  );
};

export const getLargestPrimeFactorServer = (difficulty: number, x: number, y: number): Server => {
  const largestPrimePasswordDetails = getLargestPrimeFactorPassword(difficulty);
  return DWebServerBuilder(
    {
      icon: getRandomIcon(),
      minigameType: Minigames.LargestPrimeFactor,
      password: `${largestPrimePasswordDetails.largestPrime}`,
      passwordHint: `The password is the largest prime factor of ${largestPrimePasswordDetails.password}`,
      passwordHintData: `${largestPrimePasswordDetails.password}`,
      x,
      y,
    },
    getName(difficulty),
    difficulty,
  );
};

export const getGuessNumberServer = (difficulty: number,  x: number, y: number): Server => {
  const password = `${Math.floor(Math.random() * 10 * (15 * (difficulty + 1)))}`;
  const maxNumber = 10 ** (password.length +1);
  return DWebServerBuilder(
    {
      icon: getRandomIcon(),
      minigameType: Minigames.GuessNumber,
      password: password,
      passwordHint: `The password is a number between 0 and ${maxNumber}`,
      x,
      y,
    },
    getName(difficulty),
    difficulty,
  );
}

export const getLargeDictionaryServer = (difficulty: number, x: number, y: number): Server => {
  return getDictionaryAttackServer(difficulty, x, y, commonPasswordDictionary, ["It's a common password"], Minigames.CommonPasswordDictionary);
}

export const getEuCountryDictionaryServer = (difficulty: number, x: number, y: number): Server => {
  return getDictionaryAttackServer(difficulty, x, y, EUCountries, ["My favorite EU country"], Minigames.CommonPasswordDictionary);
}

// offset every other row

// TODO: most common item in array server
// TODO: more leetcode array manipulation servers

// TODO: arithmetic string server (eval bait)

// TODO: more guess and check servers

// TODO: verbal description of simple math problem (nth root of x)

// TODO: basic cypher server?

// TODO: eval pwn server

const getResponseTime = (additionalPasses = 0) => Math.floor(95 + Math.random() * 12 + additionalPasses * 25);

const getPassword = (
  length: number,
  allowNumbers = true,
  allowLetters = false,
  allowSpecial = false,
  allowUnicode = false,
): string => {

  const characters =
    (allowNumbers ? numbers : "") +
    (allowLetters ? letters : "") +
    (allowSpecial ? special : "") +
    (allowUnicode ? unicode : "");
  let password = "";
  for (let i = 0; i < length; i++) {
    password += characters[Math.floor(Math.random() * characters.length)];
  }
  return password;
};

export const getPasswordType = (password: string): string => {
  const passwordArr = password.split("");

  if (passwordArr.every((char) => numbers.includes(char))) {
    return "numeric";
  }
  if (passwordArr.every((char) => letters.includes(char))) {
    return "alphabetic";
  }
  if (passwordArr.every((char) => numbers.includes(char) || letters.includes(char))) {
    return "alphanumeric";
  }
  if (passwordArr.every((char) => char.charCodeAt(0) < 128)) {
    return "ASCII";
  }
  return "unicode";
};

export const getRandomIcon = (): Icon => {
  const icons = Object.values(Icon);
  return <Icon>icons[Math.floor(Math.random() * icons.length)];
};

const romanNumeralEncoder = (input: number): string => {
  const romanNumerals: { [key: number]: string } = {
    1: "I",
    4: "IV",
    5: "V",
    9: "IX",
    10: "X",
    40: "XL",
    50: "L",
    90: "XC",
    100: "C",
    400: "CD",
    500: "D",
    900: "CM",
    1000: "M",
  };

  const keys = Object.keys(romanNumerals).map((key) => parseInt(key));
  let result = "";
  for (let i = keys.length - 1; i >= 0; i--) {
    const key = keys[i];
    while (input >= key) {
      result += romanNumerals[key];
      input -= key;
    }
  }
  return result;
};

const getLargestPrimeFactorPassword = (difficulty = 1) => {
  const factorCount = 2 + Math.max(5, Math.floor(difficulty / 2));
  const smallPrimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
  const largePrimes = [
    10007, 10009, 10037, 10039, 10061, 10067, 10069, 10079, 10091, 10159, 10163, 10169, 10177, 10181, 10193, 10211,
    10223, 10243, 10247, 10253, 10259, 10267, 343051, 426799, 464279, 532993, 982097, 987929, 993893, 997609,
  ];

  const largePrimeIndex = Math.ceil(Math.random() * (largePrimes.length - 1));
  let number = largePrimes[Math.random() * largePrimes.length];
  for (let i = 1; i <= factorCount; i++) {
    number *= smallPrimes[Math.floor(Math.random() * smallPrimes.length)];
  }

  return {
    largestPrime: largePrimes[largePrimeIndex],
    password: number,
  };
};
