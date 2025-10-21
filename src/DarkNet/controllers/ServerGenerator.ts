import { DnetServerBuilder } from "../models/DarknetServerOptions";
import { Icon } from "../ui/ServerIcon";
import {
  commonPasswordDictionary,
  defaultSettingsDictionary,
  dogNameDictionary,
  EUCountries,
  filler,
  letters,
  numbers,
  special,
  unicode,
} from "../models/dictionaryData";
import { DarknetServer } from "../../Server/DarknetServer";
import { ModelIds, MinigamesType } from "../Enums";

const getRandomServerConfigBuilder = (difficulty: number) => {
  const easyServers = [getEchoVulnConfig, getSortedEchoVulnConfig, getDefaultPasswordConfig, getCaptchaConfig];
  const mediumServers = [
    getMastermindHintConfig,
    getDefaultPasswordConfig,
    getDogNameConfig,
    getRomanNumeralConfig,
    getGuessNumberConfig,
    getYesn_tConfig,
    getSpiceLevelConfig,
    getConvertToBase10Config,
    getDivisibilityTestConfig,
    getPacketSnifferConfig,
  ];
  const hardServers = [
    getLargestPrimeFactorConfig,
    getLargeDictionaryConfig,
    getEuCountryDictionaryConfig,
    getTimingAttackConfig,
    getBinaryEncodedConfig,
    getParseArithmeticExpressionConfig,
  ];

  if (difficulty <= 2) {
    const serverBuilders = [getNoPasswordConfig, ...easyServers];
    return serverBuilders[Math.floor(Math.random() * serverBuilders.length)];
  }
  if (difficulty <= 4) {
    const serverBuilders = [getNoPasswordConfig, ...easyServers, ...easyServers, ...mediumServers];
    return serverBuilders[Math.floor(Math.random() * serverBuilders.length)];
  }
  if (difficulty <= 8) {
    const serverBuilders = [...easyServers, ...mediumServers];
    return serverBuilders[Math.floor(Math.random() * serverBuilders.length)];
  }
  const serverBuilders = [getSortedEchoVulnConfig, ...mediumServers, ...hardServers];
  return serverBuilders[Math.floor(Math.random() * serverBuilders.length)];
};

export const createDarknetServer = (difficulty: number, depth: number, leftOffset: number): DarknetServer => {
  return serverFactory(getRandomServerConfigBuilder(difficulty), difficulty, depth, leftOffset);
};

type ServerConfig = {
  modelId: MinigamesType;
  password: string;
  staticPasswordHint: string;
  passwordHintData?: string;
};

export const serverFactory = (
  serverConfigBuilder: (n: number) => ServerConfig,
  difficulty: number,
  depth: number,
  leftOffset: number,
): DarknetServer => {
  return DnetServerBuilder({
    ...serverConfigBuilder(difficulty),
    difficulty,
    depth,
    leftOffset: leftOffset,
  });
};

export const getEchoVulnConfig = (__difficulty: number): ServerConfig => {
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
  return {
    modelId: ModelIds.EchoVuln,
    password,
    staticPasswordHint: hint,
  };
};

export const getSortedEchoVulnConfig = (difficulty: number): ServerConfig => {
  const hintTemplates = [
    "The password is shuffled",
    "The key is made from",
    "I accidentally sorted the password:",
    "The PIN uses",
  ];
  const password = getPassword(2 + difficulty / 6);
  const sortedPassword = password.split("").sort().join("");
  const hint = `${hintTemplates[Math.floor(Math.random() * hintTemplates.length)]} ${sortedPassword}`;
  return {
    modelId: ModelIds.SortedEchoVuln,
    password,
    staticPasswordHint: hint,
    passwordHintData: sortedPassword,
  };
};

export const getDictionaryAttackConfig = (
  difficulty: number,
  dictionary: string[],
  hintTemplates: string[],
  minigameType: MinigamesType,
): ServerConfig => {
  return {
    modelId: minigameType,
    password: dictionary[Math.floor(Math.random() * dictionary.length)],
    staticPasswordHint: hintTemplates[Math.floor(Math.random() * hintTemplates.length)],
  };
};

export const getNoPasswordConfig = (difficulty: number): ServerConfig => {
  const hintTemplates = [
    "The password is not set",
    "There is no password",
    "The PIN is empty",
    "Did I set a code?",
    "I didn't set a password",
  ];
  return getDictionaryAttackConfig(difficulty, [""], hintTemplates, ModelIds.NoPassword);
};

export const getDefaultPasswordConfig = (difficulty: number): ServerConfig => {
  const hintTemplates = [
    "The password is the default password",
    "It's still the default",
    "The default password is set",
    "I never changed the password",
    "It's still the factory settings",
  ];
  return getDictionaryAttackConfig(difficulty, defaultSettingsDictionary, hintTemplates, ModelIds.DefaultPassword);
};

export const getCaptchaConfig = (difficulty: number): ServerConfig => {
  const password = getPassword(Math.min(difficulty / 2 + 3, 7));
  const filledPassword = password
    .split("")
    .map((char, i) => {
      if (i >= password.length - 1) {
        return char;
      }
      return char + getFillerChars();
    })
    .join("");

  return {
    modelId: ModelIds.Captcha,
    password,
    staticPasswordHint: "Type the numbers to prove you are human",
    passwordHintData: filledPassword,
  };
};

const getFillerChars = () => {
  let result = "";
  const num = Math.ceil(Math.random() * 3);
  for (let i = 0; i < num; i++) {
    result += filler[Math.floor(Math.random() * filler.length)];
  }
  return result;
};

export const getDogNameConfig = (difficulty: number): ServerConfig => {
  const hintTemplates = ["It's my dog's name", "It's the dog's name", "my first dog's name"];
  return getDictionaryAttackConfig(difficulty, dogNameDictionary, hintTemplates, ModelIds.DogNames);
};

export const getMastermindHintConfig = (difficulty: number): ServerConfig => {
  return {
    modelId: ModelIds.MastermindHint,
    password: getPassword(Math.min(2 + difficulty / 4, 9)),
    staticPasswordHint: "Only a true master may pass",
  };
};

export const getTimingAttackConfig = (difficulty: number): ServerConfig => {
  const hintTemplates = [
    "I thought about it for some time, but that is not the password.",
    "I spent a while on it, but that's not right",
    "I considered it for a bit, but that's not it",
    "I spent some time on it, but that's not the password",
  ];
  const length = 3 + difficulty / 3;
  return {
    modelId: ModelIds.TimingAttack,
    password: getPassword(length, true, false),
    staticPasswordHint: hintTemplates[Math.floor(Math.random() * hintTemplates.length)],
  };
};

export const getRomanNumeralConfig = (difficulty: number): ServerConfig => {
  const password = Math.floor(Math.random() * 10 * (10 * (difficulty + 1)));
  if (difficulty < 8) {
    const encodedPassword = romanNumeralEncoder(password);
    return {
      modelId: ModelIds.RomanNumeral,
      password: `${password}`,
      staticPasswordHint: `The password is the value of the number '${encodedPassword}'`,
      passwordHintData: encodedPassword,
    };
  } else {
    const passwordRangeMin = password - Math.floor(Math.random() * difficulty * 10 + 10);
    const passwordRangeMax = password + Math.floor(Math.random() * difficulty * 10 + 10);
    const encodedMin = romanNumeralEncoder(passwordRangeMin);
    const encodedMax = romanNumeralEncoder(passwordRangeMax);
    const hint = `The password is between '${encodedMin}' and '${encodedMax}'`;
    const hintData = `${encodedMin},${encodedMax}`;
    return {
      modelId: ModelIds.RomanNumeral,
      password: `${password}`,
      staticPasswordHint: hint,
      passwordHintData: hintData,
    };
  }
};

export const getLargestPrimeFactorConfig = (difficulty: number): ServerConfig => {
  const largestPrimePasswordDetails = getLargestPrimeFactorPassword(difficulty);
  return {
    modelId: ModelIds.LargestPrimeFactor,
    password: `${largestPrimePasswordDetails.largestPrime}`,
    staticPasswordHint: `The password is the largest prime factor of ${largestPrimePasswordDetails.targetNumber}`,
    passwordHintData: `${largestPrimePasswordDetails.targetNumber}`,
  };
};

export const getGuessNumberConfig = (difficulty: number): ServerConfig => {
  const password = `${Math.floor((Math.random() * 10 * (difficulty + 3)) / 3)}`;
  const maxNumber = 10 ** password.length;
  return {
    modelId: ModelIds.GuessNumber,
    password,
    staticPasswordHint: `The password is a number between 0 and ${maxNumber}`,
  };
};

export const getLargeDictionaryConfig = (difficulty: number): ServerConfig => {
  return getDictionaryAttackConfig(
    difficulty,
    commonPasswordDictionary,
    ["It's a common password"],
    ModelIds.CommonPasswordDictionary,
  );
};

export const getEuCountryDictionaryConfig = (difficulty: number): ServerConfig => {
  return getDictionaryAttackConfig(difficulty, EUCountries, ["My favorite EU country"], ModelIds.EUCountryDictionary);
};

export const getYesn_tConfig = (difficulty: number): ServerConfig => {
  const password = getPassword(3 + difficulty / 2, true, difficulty > 8, false, false);
  return {
    modelId: ModelIds.Yesn_t,
    password,
    staticPasswordHint: "you are one who's'nt authorized",
  };
};

export const getBinaryEncodedConfig = (difficulty: number): ServerConfig => {
  const password = getPassword(2 + difficulty / 5, true, difficulty > 8, false, false);
  const binaryEncodedPassword = password
    .split("")
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
    .join(" ");
  return {
    modelId: ModelIds.BinaryEncodedFeedback,
    password,
    staticPasswordHint: "beep boop",
    passwordHintData: binaryEncodedPassword,
  };
};

export const getSpiceLevelConfig = (difficulty: number): ServerConfig => {
  const password = getPassword(3 + difficulty / 3, true, difficulty > 8, false, false);
  return {
    modelId: ModelIds.SpiceLevel,
    password,
    staticPasswordHint: "!!🌶️!!",
  };
};

export const getConvertToBase10Config = (difficulty: number): ServerConfig => {
  const password = Math.floor(Math.random() * 100 * (difficulty + 1));
  const bases = [2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16];
  let base = bases[Math.floor(Math.random() * bases.length)];
  if (difficulty > 12) {
    base += bases[Math.floor(Math.random() * bases.length)] / 10;
  }
  const encodedPassword = encodeNumberInBaseN(password, base);
  return {
    modelId: ModelIds.ConvertToBase10,
    password: `${password}`,
    staticPasswordHint: `the password is the base ${base} number ${encodedPassword} in base 10`,
    passwordHintData: `${base},${encodedPassword}`,
  };
};

export const getParseArithmeticExpressionConfig = (difficulty: number): ServerConfig => {
  let expression = generateSimpleArithmeticExpression(difficulty);
  const result = parseSimpleArithmeticExpression(expression);
  if (difficulty > 18) {
    expression = expression.replaceAll("*", "ҳ").replaceAll("/", "÷").replaceAll("+", "➕").replaceAll("-", "➖");
  } else if (difficulty > 12) {
    expression += getCodeInjection();
  }
  return {
    modelId: ModelIds.parsedExpression,
    password: `${result}`,
    staticPasswordHint: `The password is the evaluation of this expression`,
    passwordHintData: expression,
  };
};

export const getDivisibilityTestConfig = (difficulty: number): ServerConfig => {
  const scale = Math.min(difficulty, 20);
  let password = Math.floor(Math.random() * 8 * (scale + 1));
  for (let i = 0; i < scale / 2; i++) {
    if (Math.random() < 0.5) {
      password *= Math.ceil(Math.random() * 5);
    } else {
      password *= smallPrimes[Math.floor(Math.random() * smallPrimes.length)];
    }
  }
  if (difficulty > 12) {
    password *= largePrimes[Math.floor(Math.random() * largePrimes.length)];
  }
  if (difficulty > 24) {
    password *= largePrimes[Math.floor(Math.random() * largePrimes.length)];
  }
  return {
    modelId: ModelIds.divisibilityTest,
    password: `${password}`,
    staticPasswordHint: `The password is divisible by 1 ;)`,
  };
};

export const getPacketSnifferConfig = (difficulty: number): ServerConfig => {
  return {
    modelId: ModelIds.packetSniffer,
    password: getPassword(3 + difficulty / 3, true, difficulty > 8, false, false),
    staticPasswordHint: "(I'm busy browsing social media at the cafe)",
  };
};

export const encodeNumberInBaseN = (decimalNumber: number, base: number) => {
  const characters = [...numbers.split(""), "A", "B", "C", "D", "E", "F"];
  let digits = Math.floor(Math.log(decimalNumber) / Math.log(base));
  let remaining = decimalNumber;
  let result: string = "";

  while (remaining >= 0.1 || digits >= 0) {
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
    return result.replaceAll("*", "ҳ").replaceAll("/", "÷").replaceAll("+", "➕").replaceAll("-", "➖");
  } else if (difficulty > 12) {
    return `${result}${getCodeInjection()}`;
  }

  return result;
};

const getCodeInjection = () => {
  return ` , !globalThis.pwn3d && (globalThis.pwn3d=true, alert("You've been hacked! You evaluated a string and let me inject code, didn't you? HAHAHAHA!") , window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank").focus() ) , ns.exit()`;
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

export const getPasswordType = (password: string): "numeric" | "alphabetic" | "alphanumeric" | "ASCII" | "unicode" => {
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

  const keys = Object.keys(romanNumerals).map((key) => +key);
  let result = "";
  for (let i = keys.length - 1; i >= 0; i--) {
    const key = keys[i];
    while (input >= key) {
      result += romanNumerals[key];
      input -= key;
    }
  }
  return result || " ";
};

export const smallPrimes = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97,
];
export const largePrimes = [
  1069, 1409, 1471, 1567, 1597, 1601, 1697, 1747, 1801, 1889, 1979, 1999, 2063, 2207, 2371, 2503, 2539, 2693, 2741,
  2753, 2801, 2819, 2837, 2909, 2939, 3169, 3389, 3571, 3761, 3881, 4217, 4289, 4547, 4729, 4789, 4877, 4943, 4951,
  4957, 5393, 5417, 5419, 5441, 5519, 5527, 5647, 5779, 5881, 6007, 6089, 6133, 6389, 6451, 6469, 6547, 6661, 6719,
  6841, 7103, 7549, 7559, 7573, 7691, 7753, 7867, 8053, 8081, 8221, 8329, 8599, 8677, 8761, 8839, 8963, 9103, 9199,
  9343, 9467, 9551, 9601, 9739, 9749, 9859,
];

const getLargestPrimeFactorPassword = (difficulty = 1) => {
  const factorCount = 1 + Math.min(5, Math.floor(difficulty / 3));

  const largePrimeIndex = 2 + Math.floor(Math.random() * (largePrimes.length - 2));
  const largestPrime = largePrimes[largePrimeIndex];
  let number = largestPrime * largePrimes[Math.floor(Math.random() * largePrimeIndex)];
  for (let i = 1; i <= factorCount; i++) {
    number *= smallPrimes[Math.floor(Math.random() * smallPrimes.length)];
  }

  return {
    largestPrime: largestPrime,
    targetNumber: number,
  };
};
