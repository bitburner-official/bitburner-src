import { DarkWebServer, DWebServerBuilder } from "../models/DarkWebServer";
import { Icon } from "./ServerIcon";

export enum Minigames {
  EchoVuln,
  SortedEchoVuln,
  NoPassword ,
  DefaultPassword,
  MastermindHint,
  TimingAttack,
  LargestPrimeFactor,
  RomanNumeral,
  DogNames
}

export const getDarkWebServer = (difficulty: number, chaRequired: number, x: number, y: number): DarkWebServer => {
  if (difficulty <= 2 || Math.random() < 0.1) {
    const serverBuilders = [getEchoVulnServer, getNoPasswordServer, getSortedEchoVulnServer, getDefaultPasswordServer];
    return serverBuilders[Math.floor(Math.random() * serverBuilders.length)](difficulty, chaRequired, x, y);
  }
  if (difficulty <= 6 || Math.random() < 0.1) {
    const serverBuilders = [
      getMastermindHintServer,
      getDefaultPasswordServer,
      getSortedEchoVulnServer,
      getDogNameServer,
      getRomanNumeralServer
    ];
    return serverBuilders[Math.floor(Math.random() * serverBuilders.length)](difficulty, chaRequired, x, y);
  }
  const serverBuilders = [
    getTimingAttackServer,
    getLargestPrimeFactorServer,
    getMastermindHintServer,
    getRomanNumeralServer,
    getSortedEchoVulnServer
  ];
  return serverBuilders[Math.floor(Math.random() * serverBuilders.length)](difficulty, chaRequired, x, y);
};

export const getName = (difficulty: number): string => {
  // TODO: Implement
  return `${getResponseTime()}.${getResponseTime(difficulty * 5)}.0.${getResponseTime()}`;
};

export const getEchoVulnServer = (difficulty: number, chaRequired: number, x: number, y: number): DarkWebServer => {
  const hintTemplates = ["The password is", "The PIN is", "Remember to use", "It's set to", "The key is", "The secret is"];
  const password = getPassword(3);
  const hint = `${hintTemplates[Math.floor(Math.random() * hintTemplates.length)]} ${password}`;
  return DWebServerBuilder({
    name: getName(difficulty),
    icon: getRandomIcon(),
    minigameType: Minigames.EchoVuln,
    difficulty: difficulty,
    chaRequired: chaRequired,
    password,
    passwordHint: hint,
    x,
    y,
  });
};

export const getSortedEchoVulnServer = (difficulty: number, chaRequired: number, x: number, y: number): DarkWebServer => {
  const hintTemplates = ["The password contains", "The key is made from", "I accidentally sorted the password", "The PIN uses"]
  const password = getPassword(3 + (difficulty / 2))
  const hint = `${hintTemplates[Math.floor(Math.random() * hintTemplates.length)]} ${password.split("").sort().join("")}`;
  return DWebServerBuilder({
    name: getName(difficulty),
    icon: getRandomIcon(),
    minigameType: Minigames.SortedEchoVuln,
    difficulty: difficulty,
    chaRequired: chaRequired,
    password: password,
    passwordHint: hint,
    x,
    y,
  });
}

export const getDictionaryAttackServer = (difficulty: number, chaRequired: number, x: number, y: number, dictionary: string[], hintTemplates: string[], minigameType: Minigames): DarkWebServer => {
  return DWebServerBuilder({
    name: getName(difficulty),
    icon: getRandomIcon(),
    difficulty: difficulty,
    minigameType,
    chaRequired: chaRequired,
    password: dictionary[Math.floor(Math.random() * dictionary.length)],
    passwordHint: hintTemplates[Math.floor(Math.random() * hintTemplates.length)],
    x,
    y,
  });
};

export const getNoPasswordServer = (difficulty: number, chaRequired: number, x: number, y: number): DarkWebServer => {
  const hintTemplates = ["The password is not set", "There is no password", "The PIN is empty", "Did I set a code?", "I didn't set a password"];
  return getDictionaryAttackServer(difficulty, chaRequired, x, y, [""], hintTemplates, Minigames.NoPassword);
};

export const getDefaultPasswordServer = (difficulty: number, chaRequired: number, x: number, y: number,): DarkWebServer => {
  const dictionary = ["admin", "password", "0000", "12345"];
  const hintTemplates = ["The password is the default password", "It's still the default", "The default password is set", "I never changed the password", "It's still the factory settings"];
  return getDictionaryAttackServer(difficulty, chaRequired, x, y, dictionary, hintTemplates, Minigames.DefaultPassword);
};

export const getDogNameServer = (difficulty: number, chaRequired: number, x: number, y: number): DarkWebServer => {
  const dictionary = ["fido", "spot", "rover", "max"];
  const hintTemplates = ["It's my dog's name", "It's the dog's name", "my first dog's name"];
  return getDictionaryAttackServer(difficulty, chaRequired, x, y, dictionary, hintTemplates, Minigames.DogNames);
}

export const getMastermindHintServer = (
  difficulty: number,
  chaRequired: number,
  x: number,
  y: number,
): DarkWebServer => {
  return DWebServerBuilder({
    name: getName(difficulty),
    icon: getRandomIcon(),
    minigameType: Minigames.MastermindHint,
    difficulty: difficulty,
    chaRequired: chaRequired,
    password: getPassword(2 + difficulty),
    passwordHint: "", // dynamic hint
    x,
    y,
  });
};

export const getTimingAttackServer = (difficulty: number, chaRequired: number, x: number, y: number): DarkWebServer => {
  const hintTemplates = ["I thought about it for some time, but that is not the password.", "I spent a while on it, but that's not right", "I considered it for a bit, but that's not it", "I spent some time on it, but that's not the password"];
  const length = 3 + difficulty;
  return DWebServerBuilder({
    name: getName(difficulty),
    icon: getRandomIcon(),
    minigameType: Minigames.TimingAttack,
    difficulty: difficulty,
    chaRequired: chaRequired,
    password: getPassword(length, true, false),
    passwordHint: hintTemplates[Math.floor(Math.random() * hintTemplates.length)],
    x,
    y,
  });
};

export const getRomanNumeralServer = (difficulty: number, chaRequired: number, x: number, y: number): DarkWebServer => {
  const password = Math.floor(Math.random() * 10 * (10* (difficulty + 1)));
  const encodedPassword = romanNumeralEncoder(password);
  return DWebServerBuilder({
    name: getName(difficulty),
    icon: getRandomIcon(),
    minigameType: Minigames.RomanNumeral,
    difficulty: difficulty,
    chaRequired: chaRequired,
    password: `${password}`,
    passwordHint: `The password is the value of the number ${encodedPassword}`,
    x,
    y,
  });
}

export const getLargestPrimeFactorServer = (difficulty: number, chaRequired: number, x: number, y: number): DarkWebServer => {
  const largestPrimePasswordDetails = getLargestPrimeFactorPassword(difficulty);
  return DWebServerBuilder({
    name: getName(difficulty),
    icon: getRandomIcon(),
    minigameType: Minigames.LargestPrimeFactor,
    difficulty: difficulty,
    chaRequired: chaRequired,
    password: `${largestPrimePasswordDetails.largestPrime}`,
    passwordHint: `The password is the largest prime factor of ${largestPrimePasswordDetails.password}`,
    x,
    y,
  });
}

// TODO: change passwordChecker to failure response object
    // TODO: how to do interactive prompts? by server type ID lookup?

// TODO: arithmetic string server (eval bait)

// TODO: verbal description of simple math problem (nth root of x)

// TODO: basic cypher server?

// TODO: simple dictionary attack servers (dog's name, cat's name, etc)

// TODO: eval pwn server

const getResponseTime = (additionalPasses = 0) => Math.floor(95 + Math.random() * 12 + additionalPasses * 25);


const getPassword = (
  length: number,
  allowNumbers = true,
  allowLetters = false,
  allowSpecial = false,
  allowUnicode = false,
): string => {
  const numbers = "0123456789";
  const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const special = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  const unicode = "¼░╡╢╣╤╥╦╧╨╩╪╫╬╭╮╯╰╱╲╳╴╵╶╷╸╹╺╻╼╽╾╿";

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
  const numbers = "0123456789";
  const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
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
}

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
}

const getLargestPrimeFactorPassword = (difficulty = 1) => {
  const factorCount = 2 + Math.max(5, Math.floor(difficulty / 2));
  const smallPrimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
  const largePrimes = [10007, 10009, 10037, 10039, 10061, 10067, 10069, 10079, 10091, 10159, 10163, 10169, 10177, 10181, 10193, 10211, 10223, 10243, 10247, 10253, 10259, 10267, 343051, 426799, 464279, 532993, 982097, 987929, 993893, 997609];

  const largePrimeIndex = Math.ceil(Math.random() * (largePrimes.length - 1));
  let number = 1;
  for (let i = 1; i <= factorCount; i++) {
    const primeSource = i % 3 === 0 ? smallPrimes : largePrimes;
    number *= primeSource[Math.floor(Math.random() * smallPrimes.length)];
  }

  return {
    largestPrime: largePrimes[largePrimeIndex],
    password: number,
  }

}