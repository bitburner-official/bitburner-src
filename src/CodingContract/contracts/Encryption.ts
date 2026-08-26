import { CodingContractTypes } from "../ContractTypes";
import { CodingContractName } from "../Enums";

export const encryption: Pick<
  CodingContractTypes,
  CodingContractName.EncryptionICaesarCipher | CodingContractName.EncryptionIIVigenereCipher
> = {
  [CodingContractName.EncryptionICaesarCipher]: {
    desc: (data: [string, number]): string => {
      return [
        "凯撒密码是最简单的加密技术之一。",
        "它是一种替换密码，明文中的每个字母都会被替换为",
        "字母表中向下（后移）固定数目个位置的字母。",
        "例如，左移 3 位时，D 会被替换为 A，",
        "E 会变成 B，而 A 会变成 X（因为是循环的）。\n\n",
        "给你一个包含两个元素的数组：\n",
        `  ["${data[0]}", ${data[1]}]\n`,
        "第一个元素是明文，第二个元素是左移位数。\n\n",
        "以大写字符串形式返回密文。空格保持不变。",
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
    getAnswer: (data) => {
      // data = [plaintext, shift value]
      // build char array, shifting via map and join to final results
      const cipher = [...data[0]]
        .map((a) => (a === " " ? a : String.fromCharCode(((a.charCodeAt(0) - 65 - data[1] + 26) % 26) + 65)))
        .join("");
      return cipher;
    },
    solver: (data, answer) => {
      return encryption[CodingContractName.EncryptionICaesarCipher].getAnswer(data) === answer;
    },
    convertAnswer: (ans) => ans,
    validateAnswer: (ans): ans is string => typeof ans === "string",
  },
  [CodingContractName.EncryptionIIVigenereCipher]: {
    desc: (data: [string, string]): string => {
      return [
        "维吉尼亚密码是一种多表替换密码。它使用",
        "维吉尼亚方阵和关键字来加密和解密明文。\n\n",
        "  维吉尼亚方阵：\n",
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
        "加密时，明文的每个字母与重复关键字中对应的字母配对。",
        "例如，明文 DASHBOARD 用关键字 LINUX 加密：\n",
        "   明文：DASHBOARD\n",
        "   关键字：LINUXLINU\n",
        "于是，第一个字母 D 与密钥的第一个字母 L 配对。因此，使用",
        "维吉尼亚方阵中行 D 与列 L 交叉处的字母得到第一个密文字母 O。整个密文都必须重复这一过程。\n\n",
        "给你一个包含两个元素的数组：\n",
        `  ["${data[0]}", "${data[1]}"]\n`,
        "第一个元素是明文，第二个元素是关键字。\n\n",
        "以大写字符串形式返回密文。",
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
    getAnswer: (data) => {
      // data = [plaintext, keyword]
      // build char array, shifting via map and corresponding keyword letter and join to final results
      const cipher = [...data[0]]
        .map((a, i) => {
          return a === " "
            ? a
            : String.fromCharCode(((a.charCodeAt(0) - 2 * 65 + data[1].charCodeAt(i % data[1].length)) % 26) + 65);
        })
        .join("");
      return cipher;
    },
    solver: (data, answer) => {
      return encryption[CodingContractName.EncryptionIIVigenereCipher].getAnswer(data) === answer;
    },
    convertAnswer: (ans) => ans,
    validateAnswer: (ans): ans is string => typeof ans === "string",
  },
};
