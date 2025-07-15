import { CodingContractTypes } from "../ContractTypes";
import { CodingContractName } from "../Enums";

export const encryption: Pick<
  CodingContractTypes,
  CodingContractName.EncryptionICaesarCipher | CodingContractName.EncryptionIIVigenereCipher
> = {
  [CodingContractName.EncryptionICaesarCipher]: {
    desc: (data: [string, number]): string => {
      return [
        "Caesar cipher is one of the simplest encryption technique.",
        "It is a type of substitution cipher in which each letter in the plaintext ",
        "is replaced by a letter some fixed number of positions down the alphabet.",
        "For example, with a left shift of 3, D would be replaced by A, ",
        "E would become B, and A would become X (because of rotation).\n\n",
        "You are given an array with two elements:\n",
        `  ["${data[0]}", ${data[1]}]\n`,
        "The first element is the plaintext, the second element is the left shift value.\n\n",
        "Return the ciphertext as uppercase string. Spaces remains the same.",
      ].join(" ");
    },
    difficulty: 1,
    generate: (): [string, number] => {
      // return [plaintext, shift value]
      const words = [
        "ARRAY",
        "CACHE",
        "CLOUD",
        "DEBUG",
        "EMAIL",
        "ENTER",
        "FLASH",
        "FRAME",
        "INBOX",
        "LINUX",
        "LOGIC",
        "LOGIN",
        "MACRO",
        "MEDIA",
        "MODEM",
        "MOUSE",
        "PASTE",
        "POPUP",
        "PRINT",
        "QUEUE",
        "SHELL",
        "SHIFT",
        "TABLE",
        "TRASH",
        "VIRUS",
      ];
      return [
        words
          .sort(() => Math.random() - 0.5)
          .slice(0, 5)
          .join(" "),
        Math.floor(Math.random() * 25 + 1),
      ];
    },
    solver: (data, answer) => {
      // data = [plaintext, shift value]
      // build char array, shifting via map and join to final results
      const cipher = [...data[0]]
        .map((a) => (a === " " ? a : String.fromCharCode(((a.charCodeAt(0) - 65 - data[1] + 26) % 26) + 65)))
        .join("");
      return cipher === answer;
    },
    convertAnswer: (ans) => ans,
    validateAnswer: (ans): ans is string => typeof ans === "string",
  },
  [CodingContractName.EncryptionIIVigenereCipher]: {
    desc: (data: [string, string]): string => {
      return [
        "Vigenère cipher is a type of polyalphabetic substitution. It uses ",
        "the Vigenère square to encrypt and decrypt plaintext with a keyword.\n\n",
        "  Vigenère square:\n",
        "         A B C D E F G H I J K L M N O P Q R S T U V W X Y Z \n",
        "       +----------------------------------------------------\n",
        "     A | A B C D E F G H I J K L M N O P Q R S T U V W X Y Z \n",
        "     B | B C D E F G H I J K L M N O P Q R S T U V W X Y Z A \n",
        "     C | C D E F G H I J K L M N O P Q R S T U V W X Y Z A B\n",
        "     D | D E F G H I J K L M N O P Q R S T U V W X Y Z A B C\n",
        "     E | E F G H I J K L M N O P Q R S T U V W X Y Z A B C D\n",
        "                ...\n",
        "     Y | Y Z A B C D E F G H I J K L M N O P Q R S T U V W X\n",
        "     Z | Z A B C D E F G H I J K L M N O P Q R S T U V W X Y\n\n",
        "For encryption each letter of the plaintext is paired with the corresponding letter of a repeating keyword.",
        "For example, the plaintext DASHBOARD is encrypted with the keyword LINUX:\n",
        "   Plaintext: DASHBOARD\n",
        "   Keyword:   LINUXLINU\n",
        "So, the first letter D is paired with the first letter of the key L. Therefore, row D and column L of the ",
        "Vigenère square are used to get the first cipher letter O. This must be repeated for the whole ciphertext.\n\n",
        "You are given an array with two elements:\n",
        `  ["${data[0]}", "${data[1]}"]\n`,
        "The first element is the plaintext, the second element is the keyword.\n\n",
        "Return the ciphertext as uppercase string.",
      ].join(" ");
    },
    difficulty: 2,
    generate: (): [string, string] => {
      // return [plaintext, keyword]
      const words = [
        "ARRAY",
        "CACHE",
        "CLOUD",
        "DEBUG",
        "EMAIL",
        "ENTER",
        "FLASH",
        "FRAME",
        "INBOX",
        "LINUX",
        "LOGIC",
        "LOGIN",
        "MACRO",
        "MEDIA",
        "MODEM",
        "MOUSE",
        "PASTE",
        "POPUP",
        "PRINT",
        "QUEUE",
        "SHELL",
        "SHIFT",
        "TABLE",
        "TRASH",
        "VIRUS",
      ];
      const keys = [
        "ALGORITHM",
        "BANDWIDTH",
        "BLOGGER",
        "BOOKMARK",
        "BROADBAND",
        "BROWSER",
        "CAPTCHA",
        "CLIPBOARD",
        "COMPUTING",
        "COMMAND",
        "COMPILE",
        "COMPRESS",
        "COMPUTER",
        "CONFIGURE",
        "DASHBOARD",
        "DATABASE",
        "DESKTOP",
        "DIGITAL",
        "DOCUMENT",
        "DOWNLOAD",
        "DYNAMIC",
        "EMOTICON",
        "ENCRYPT",
        "EXABYTE",
        "FIREWALL",
        "FIRMWARE",
        "FLAMING",
        "FLOWCHART",
        "FREEWARE",
        "GIGABYTE",
        "GRAPHICS",
        "HARDWARE",
        "HYPERLINK",
        "HYPERTEXT",
        "INTEGER",
        "INTERFACE",
        "INTERNET",
        "ITERATION",
        "JOYSTICK",
        "JUNKMAIL",
        "KEYBOARD",
        "KEYWORD",
        "LURKING",
        "MACINTOSH",
        "MAINFRAME",
        "MALWARE",
        "MONITOR",
        "NETWORK",
        "NOTEBOOK",
        "COMPUTER",
        "OFFLINE",
        "OPERATING",
        "PASSWORD",
        "PHISHING",
        "PLATFORM",
        "PODCAST",
        "PRINTER",
        "PRIVACY",
        "PROCESS",
        "PROGRAM",
        "PROTOCOL",
        "REALTIME",
        "RESTORE",
        "RUNTIME",
        "SCANNER",
        "SECURITY",
        "SHAREWARE",
        "SNAPSHOT",
        "SOFTWARE",
        "SPAMMER",
        "SPYWARE",
        "STORAGE",
        "TERMINAL",
        "TEMPLATE",
        "TERABYTE",
        "TOOLBAR",
        "TYPEFACE",
        "USERNAME",
        "UTILITY",
        "VERSION",
        "VIRTUAL",
        "WEBMASTER",
        "WEBSITE",
        "WINDOWS",
        "WIRELESS",
        "PROCESSOR",
      ];
      return [
        words
          .sort(() => Math.random() - 0.5)
          .slice(0, 5)
          .join(""),
        keys.sort(() => Math.random() - 0.5)[0],
      ];
    },
    solver: (data, answer) => {
      // data = [plaintext, keyword]
      // build char array, shifting via map and corresponding keyword letter and join to final results
      const cipher = [...data[0]]
        .map((a, i) => {
          return a === " "
            ? a
            : String.fromCharCode(((a.charCodeAt(0) - 2 * 65 + data[1].charCodeAt(i % data[1].length)) % 26) + 65);
        })
        .join("");
      return cipher === answer;
    },
    convertAnswer: (ans) => ans,
    validateAnswer: (ans): ans is string => typeof ans === "string",
  },
};
