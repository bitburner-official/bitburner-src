import { CodingContractName } from "@enums";
import { CodingContractTypes, parseArrayString } from "../ContractTypes";
import { exceptionAlert } from "../../utils/helpers/exceptionAlert";
import { getRandomIntInclusive } from "../../utils/helpers/getRandomIntInclusive";

export const generateIPAddresses: Pick<CodingContractTypes, CodingContractName.GenerateIPAddresses> = {
  [CodingContractName.GenerateIPAddresses]: {
    desc: (data: string): string => {
      return [
        "给定以下只包含数字的字符串，返回",
        "由该字符串可以构造出的所有",
        "有效 IP 地址组合的数组：\n\n",
        `${data}\n\n`,
        "注意：除非八位组表示的数字本身就是 '0'，否则它不能以 '0' 开头。",
        "例如，'192.168.010.1' 不是有效 IP。\n\n",
        "示例：\n\n",
        '25525511135 -> ["255.255.11.135", "255.255.111.35"]\n',
        '1938718066 -> ["193.87.180.66"]',
      ].join(" ");
    },
    difficulty: 3,
    generate: (): string => {
      let str = "";
      for (let i = 0; i < 4; ++i) {
        const num: number = getRandomIntInclusive(0, 255);
        const convNum: string = num.toString();
        str += convNum;
      }

      return str;
    },
    getAnswer: (data) => {
      const ret: string[] = [];
      for (let a = 1; a <= 3; ++a) {
        for (let b = 1; b <= 3; ++b) {
          for (let c = 1; c <= 3; ++c) {
            for (let d = 1; d <= 3; ++d) {
              if (a + b + c + d === data.length) {
                const A = parseInt(data.substring(0, a), 10);
                const B = parseInt(data.substring(a, a + b), 10);
                const C = parseInt(data.substring(a + b, a + b + c), 10);
                const D = parseInt(data.substring(a + b + c, a + b + c + d), 10);
                if (A <= 255 && B <= 255 && C <= 255 && D <= 255) {
                  const ip: string = [A.toString(), ".", B.toString(), ".", C.toString(), ".", D.toString()].join("");
                  if (ip.length === data.length + 3) {
                    ret.push(ip);
                  }
                }
              }
            }
          }
        }
      }

      return ret;
    },
    solver: (data, answer) => {
      const ret = generateIPAddresses[CodingContractName.GenerateIPAddresses].getAnswer(data);
      if (ret === null) {
        exceptionAlert(
          new Error(
            `Unexpected null when calculating the answer for ${CodingContractName.GenerateIPAddresses} contract. Data: ${data}`,
          ),
        );
        return false;
      }
      return ret.length === answer.length && ret.every((ip) => answer.includes(ip));
    },
    convertAnswer: (ans) => {
      const parsedAnswer = parseArrayString(ans);
      if (!generateIPAddresses[CodingContractName.GenerateIPAddresses].validateAnswer(parsedAnswer)) {
        return null;
      }
      return parsedAnswer;
    },
    validateAnswer: (ans): ans is string[] => Array.isArray(ans) && ans.every((s) => typeof s === "string"),
  },
};
