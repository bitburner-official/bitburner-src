import { DnetServerBuilder } from "../models/DnetServerData";
import { Icon } from "./ServerIcon";
import { Server } from "../../Server/Server";
import {
  commonPasswordDictionary,
  defaultSettingsDictionary,
  dogNameDictionary,
  EUCountries,
  letters,
  numbers,
  special,
  unicode,
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
  CommonPasswordDictionary,
  EUCountryDictionary,
  Yesn_t,
  Synchronize,
  BinaryEncodedFeedback,
  SpiceLevel,
  ConvertToBase10,
  parsedExpression,
  divisibilityTest,
  packetSniffer,
  labyrinth,
}

export const getDarknetServer = (difficulty: number, x: number, y: number): Server => {
  const easyServers = [getEchoVulnServer, getSortedEchoVulnServer, getDefaultPasswordServer];
  const mediumServers = [
    getMastermindHintServer,
    getDefaultPasswordServer,
    getDogNameServer,
    getRomanNumeralServer,
    getGuessNumberServer,
    getYesn_tServer,
    getSpiceLevelServer,
    getConvertToBase10Server,
    getDivisibilityTestServer,
    getPacketSnifferServer,
  ];
  const hardServers = [
    getLargestPrimeFactorServer,
    getLargeDictionaryServer,
    getEuCountryDictionaryServer,
    getTimingAttackServer,
    getBinaryEncodedFeedbackServer,
    getParseArithmeticExpressionServer,
  ];
  if (difficulty <= 2) {
    const serverBuilders = [getNoPasswordServer, ...easyServers];
    return serverBuilders[Math.floor(Math.random() * serverBuilders.length)](difficulty, x, y);
  }
  if (difficulty <= 4) {
    const serverBuilders = [getNoPasswordServer, ...easyServers, ...easyServers, ...mediumServers];
    return serverBuilders[Math.floor(Math.random() * serverBuilders.length)](difficulty, x, y);
  }
  if (difficulty <= 8) {
    const serverBuilders = [...easyServers, ...mediumServers];
    return serverBuilders[Math.floor(Math.random() * serverBuilders.length)](difficulty, x, y);
  }
  const serverBuilders = [getSortedEchoVulnServer, ...mediumServers, ...hardServers];
  return serverBuilders[Math.floor(Math.random() * serverBuilders.length)](difficulty, x, y);
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
  return DnetServerBuilder({
    icon: getRandomIcon(),
    minigameType: Minigames.EchoVuln,
    password,
    passwordHint: hint,
    difficulty,
    x,
    y,
  });
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
  return DnetServerBuilder({
    icon: getRandomIcon(),
    minigameType: Minigames.SortedEchoVuln,
    password: password,
    passwordHint: hint,
    passwordHintData: sortedPassword,
    difficulty,
    x,
    y,
  });
};

export const getDictionaryAttackServer = (
  difficulty: number,
  x: number,
  y: number,
  dictionary: string[],
  hintTemplates: string[],
  minigameType: Minigames,
): Server => {
  return DnetServerBuilder({
    icon: getRandomIcon(),
    minigameType,
    password: dictionary[Math.floor(Math.random() * dictionary.length)],
    passwordHint: hintTemplates[Math.floor(Math.random() * hintTemplates.length)],
    difficulty,
    x,
    y,
  });
};

export const getNoPasswordServer = (difficulty: number, x: number, y: number): Server => {
  const hintTemplates = [
    "The password is not set",
    "There is no password",
    "The PIN is empty",
    "Did I set a code?",
    "I didn't set a password",
  ];
  return getDictionaryAttackServer(difficulty, x, y, [""], hintTemplates, Minigames.NoPassword);
};

export const getDefaultPasswordServer = (difficulty: number, x: number, y: number): Server => {
  const hintTemplates = [
    "The password is the default password",
    "It's still the default",
    "The default password is set",
    "I never changed the password",
    "It's still the factory settings",
  ];
  return getDictionaryAttackServer(
    difficulty,
    x,
    y,
    defaultSettingsDictionary,
    hintTemplates,
    Minigames.DefaultPassword,
  );
};

export const getDogNameServer = (difficulty: number, x: number, y: number): Server => {
  const hintTemplates = ["It's my dog's name", "It's the dog's name", "my first dog's name"];
  return getDictionaryAttackServer(difficulty, x, y, dogNameDictionary, hintTemplates, Minigames.DogNames);
};

export const getMastermindHintServer = (difficulty: number, x: number, y: number): Server => {
  return DnetServerBuilder({
    icon: getRandomIcon(),
    minigameType: Minigames.MastermindHint,
    password: getPassword(2 + difficulty / 3),
    passwordHint: "", // dynamic hint
    difficulty,
    x,
    y,
  });
};

export const getTimingAttackServer = (difficulty: number, x: number, y: number): Server => {
  const hintTemplates = [
    "I thought about it for some time, but that is not the password.",
    "I spent a while on it, but that's not right",
    "I considered it for a bit, but that's not it",
    "I spent some time on it, but that's not the password",
  ];
  const length = 3 + difficulty / 3;
  return DnetServerBuilder({
    icon: getRandomIcon(),
    minigameType: Minigames.TimingAttack,
    password: getPassword(length, true, false),
    passwordHint: hintTemplates[Math.floor(Math.random() * hintTemplates.length)],
    difficulty,
    x,
    y,
  });
};

export const getRomanNumeralServer = (difficulty: number, x: number, y: number): Server => {
  const password = Math.floor(Math.random() * 10 * (10 * (difficulty + 1)));
  if (difficulty < 8) {
    const encodedPassword = romanNumeralEncoder(password);
    return DnetServerBuilder({
      icon: getRandomIcon(),
      minigameType: Minigames.RomanNumeral,
      password: `${password}`,
      passwordHint: `The password is the value of the number ${encodedPassword}`,
      passwordHintData: encodedPassword,
      difficulty,
      x,
      y,
    });
  } else {
    const passwordRangeMin = password - Math.floor(Math.random() * difficulty * 10 + 10);
    const passwordRangeMax = password + Math.floor(Math.random() * difficulty * 10 + 10);
    const encodedMin = romanNumeralEncoder(passwordRangeMin);
    const encodedMax = romanNumeralEncoder(passwordRangeMax);
    const hint = `The password is between ${encodedMin} and ${encodedMax}`;
    const hintData = `${passwordRangeMin},${passwordRangeMax}`;
    return DnetServerBuilder({
      icon: getRandomIcon(),
      minigameType: Minigames.RomanNumeral,
      password: `${password}`,
      passwordHint: hint,
      passwordHintData: hintData,
      difficulty,
      x,
      y,
    });
  }
};

export const getLargestPrimeFactorServer = (difficulty: number, x: number, y: number): Server => {
  const largestPrimePasswordDetails = getLargestPrimeFactorPassword(difficulty);
  return DnetServerBuilder({
    icon: getRandomIcon(),
    minigameType: Minigames.LargestPrimeFactor,
    password: `${largestPrimePasswordDetails.largestPrime}`,
    passwordHint: `The password is the largest prime factor of ${largestPrimePasswordDetails.password}`,
    passwordHintData: `${largestPrimePasswordDetails.password}`,
    difficulty,
    x,
    y,
  });
};

export const getGuessNumberServer = (difficulty: number, x: number, y: number): Server => {
  const password = `${Math.floor((Math.random() * 10 * (difficulty + 3)) / 3)}`;
  const maxNumber = 10 ** (password.length + 1);
  return DnetServerBuilder({
    icon: getRandomIcon(),
    minigameType: Minigames.GuessNumber,
    password: password,
    passwordHint: `The password is a number between 0 and ${maxNumber}`,
    difficulty,
    x,
    y,
  });
};

export const getLargeDictionaryServer = (difficulty: number, x: number, y: number): Server => {
  return getDictionaryAttackServer(
    difficulty,
    x,
    y,
    commonPasswordDictionary,
    ["It's a common password"],
    Minigames.CommonPasswordDictionary,
  );
};

export const getEuCountryDictionaryServer = (difficulty: number, x: number, y: number): Server => {
  return getDictionaryAttackServer(
    difficulty,
    x,
    y,
    EUCountries,
    ["My favorite EU country"],
    Minigames.EUCountryDictionary,
  );
};

export const getYesn_tServer = (difficulty: number, x: number, y: number): Server => {
  const password = getPassword(3 + difficulty / 3, true, difficulty > 8, false, false);
  return DnetServerBuilder({
    icon: getRandomIcon(),
    minigameType: Minigames.Yesn_t,
    password,
    passwordHint: "",
    difficulty,
    x,
    y,
  });
};

export const getBinaryEncodedFeedbackServer = (difficulty: number, x: number, y: number): Server => {
  const password = getPassword(3 + difficulty / 3, true, difficulty > 8, false, false);
  return DnetServerBuilder({
    icon: getRandomIcon(),
    minigameType: Minigames.BinaryEncodedFeedback,
    password,
    passwordHint: "",
    difficulty,
    x,
    y,
  });
};

export const getSpiceLevelServer = (difficulty: number, x: number, y: number): Server => {
  const password = getPassword(3 + difficulty / 3, true, difficulty > 8, false, false);
  return DnetServerBuilder({
    icon: getRandomIcon(),
    minigameType: Minigames.SpiceLevel,
    password,
    passwordHint: "",
    difficulty,
    x,
    y,
  });
};

export const getConvertToBase10Server = (difficulty: number, x: number, y: number): Server => {
  const password = Math.floor(Math.random() * 10 * (10 * (difficulty + 1)));
  const bases = [2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16];
  let base = bases[Math.floor(Math.random() * bases.length)];
  if (difficulty > 12) {
    base += bases[Math.floor(Math.random() * bases.length)] / 10;
  }
  const encodedPassword = encodeNumberInBaseN(password, base);
  return DnetServerBuilder({
    icon: getRandomIcon(),
    minigameType: Minigames.ConvertToBase10,
    password: `${password}`,
    passwordHint: `the password is the base ${base} number ${encodedPassword} in base 10`,
    passwordHintData: `${base},${encodedPassword}`,
    difficulty,
    x,
    y,
  });
};

export const getParseArithmeticExpressionServer = (difficulty: number, x: number, y: number): Server => {
  const expression = generateSimpleArithmeticExpression(difficulty);
  const result = parseSimpleArithmeticExpression(expression);
  return DnetServerBuilder({
    icon: getRandomIcon(),
    minigameType: Minigames.parsedExpression,
    password: `${result}`,
    passwordHint: `The password is the evaluation of this expression`,
    passwordHintData: expression,
    difficulty,
    x,
    y,
  });
};

export const getDivisibilityTestServer = (difficulty: number, x: number, y: number): Server => {
  let password = Math.floor(Math.random() * 12 * (difficulty + 1));
  for (let i = 0; i < difficulty; i++) {
    if (Math.random() < 0.5) {
      password *= Math.ceil(Math.random() * 5);
    } else if (Math.random() < 0.7) {
      password *= smallPrimes[Math.floor(Math.random() * smallPrimes.length)];
    } else {
      password *= largePrimes[Math.floor(Math.random() * largePrimes.length)];
    }
  }
  return DnetServerBuilder({
    icon: getRandomIcon(),
    minigameType: Minigames.divisibilityTest,
    password: `${password}`,
    passwordHint: `The password is divisible by 3`,
    difficulty,
    x,
    y,
  });
};

export const getPacketSnifferServer = (difficulty: number, x: number, y: number): Server => {
  return DnetServerBuilder({
    icon: getRandomIcon(),
    minigameType: Minigames.packetSniffer,
    password: getPassword(3 + difficulty / 3, true, difficulty > 8, false, false),
    passwordHint: "(I'm busy browsing social media at the cafe)",
    difficulty,
    x,
    y,
  });
};

// TODO: most common item in array server
// TODO: more leetcode array manipulation servers

// TODO: more guess and check servers
// TODO: warmer / colder server ?

// TODO: verbal description of simple math problem (nth root of x)

// TODO: basic cypher server?

// TODO: eval pwn server

export const encodeNumberInBaseN = (decimalNumber: number, base: number) => {
  const characters = [...numbers.split(""), "A", "B", "C", "D", "E", "F"];
  let digits = Math.floor(Math.log(decimalNumber) / Math.log(base));
  let remaining = decimalNumber;
  let result: string = "";

  while (remaining >= 0.1) {
    if (digits === -1) {
      result += ".";
    }
    const place = Math.floor(remaining / base ** digits);
    result += characters[place];
    remaining -= place * base ** digits;
    digits -= 1;
  }

  return result;
};

export const parseBaseNNumberString = (numberString: string, base: number): number => {
  const characters = [...numbers.split(""), "A", "B", "C", "D", "E", "F"];
  let result = 0;
  let index = 0;
  let digit = numberString.split(".")[0].length - 1;

  while (index < numberString.length) {
    const currentDigit = numberString[index];
    if (currentDigit === ".") {
      index += 1;
      continue;
    }
    result += characters.indexOf(currentDigit) * base ** digit;
    index += 1;
    digit -= 1;
  }

  return result;
};

// example:  4 + 5 * ( 6 + 7 ) / 2
export const parseSimpleArithmeticExpression = (expression: string): number => {
  const tokens = expression.split("");

  // Identify parentheses
  let currentDepth = 0;
  const depth = tokens.map((token) => {
    if (token === "(") {
      currentDepth += 1;
    } else if (token === ")") {
      currentDepth -= 1;
      return currentDepth + 1;
    }
    return currentDepth;
  });
  const depth1Start = depth.indexOf(1);
  // find the last 1 before the first 0 after depth1Start
  const firstZeroAfterDepth1Start = depth.indexOf(0, depth1Start);
  const depth1End = firstZeroAfterDepth1Start === -1 ? depth.length - 1 : firstZeroAfterDepth1Start - 1;
  if (depth1Start !== -1) {
    const subExpression = tokens.slice(depth1Start + 1, depth1End).join("");
    const result = parseSimpleArithmeticExpression(subExpression);
    tokens.splice(depth1Start, depth1End - depth1Start + 1, result.toString());
    return parseSimpleArithmeticExpression(tokens.join(""));
  }

  // handle multiplication and division
  let remainingExpression = tokens.join("");

  // breakdown and explanation for this regex: https://regex101.com/r/mZhiBn/1
  const multiplicationDivisionRegex = /(-?\d*\.?\d+) *([*/]) *(-?\d*\.?\d+)/;
  let match = remainingExpression.match(multiplicationDivisionRegex);

  while (match) {
    const [__, left, operator, right] = match;
    const result = operator === "*" ? parseFloat(left) * parseFloat(right) : parseFloat(left) / parseFloat(right);
    const resultString = Math.abs(result) < 0.000001 ? result.toFixed(20) : result.toString();
    remainingExpression = remainingExpression.replace(match[0], resultString);
    match = remainingExpression.match(multiplicationDivisionRegex);
  }

  // handle addition and subtraction
  const additionSubtractionRegex = /(-?\d*\.?\d+) *([+-]) *(-?\d*\.?\d+)/;
  match = remainingExpression.match(additionSubtractionRegex);

  while (match) {
    const [__, left, operator, right] = match;
    const result = operator === "+" ? parseFloat(left) + parseFloat(right) : parseFloat(left) - parseFloat(right);
    remainingExpression = remainingExpression.replace(match[0], result.toString());
    match = remainingExpression.match(additionSubtractionRegex);
  }

  const [__, leftover] = remainingExpression.match(/(-?\d*\.?\d+)/) ?? ["", ""];

  return parseFloat(leftover);
};

export const generateSimpleArithmeticExpression = (difficulty: number): string => {
  const operators = ["+", "-", "*", "/"];
  const operatorCount = Math.floor(difficulty / 4);
  const expression = [];
  for (let i = 0; i < operatorCount; i++) {
    expression.push(Math.ceil(Math.random() * 98));
    expression.push(operators[Math.floor(Math.random() * operators.length)]);

    if (difficulty > 5 && Math.random() < difficulty / (difficulty + 50)) {
      expression.push("(");
      expression.push(generateSimpleArithmeticExpression(difficulty / 2));
      expression.push(")");
      expression.push(operators[Math.floor(Math.random() * operators.length)]);
    }
  }
  expression.push(Math.ceil(Math.random() * 98));

  const result = expression.join(" ");

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const calc = parseFloat(eval(result));
    if (Math.abs(calc) < 0.1) {
      return generateSimpleArithmeticExpression(difficulty);
    }
  } catch (__) {
    return generateSimpleArithmeticExpression(difficulty);
  }

  if (difficulty > 18) {
    return result.replace("*", "ҳ").replace("/", "÷").replace("+", "➕").replaceAll("-", "➖");
  } else if (difficulty > 12) {
    return `${result}${getCodeInjection()}`;
  }

  return result;
};

const getCodeInjection = () => {
  return `;alert("You've been hacked! You used eval() and let me inject code, didn't you? HAHAHAHAHA!");window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank").focus();`;
};

export const getPassword = (
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

export const romanNumeralEncoder = (input: number): string => {
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

const smallPrimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
const largePrimes = [
  10007, 10009, 10037, 10039, 10061, 10067, 10069, 10079, 10091, 10159, 10163, 10169, 10177, 10181, 10193, 10211, 10223,
  10243, 10247, 10253, 10259, 10267, 343051, 426799, 464279, 532993, 982097, 987929, 993893, 997609,
];

const getLargestPrimeFactorPassword = (difficulty = 1) => {
  const factorCount = 2 + Math.max(5, Math.floor(difficulty / 2));

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
