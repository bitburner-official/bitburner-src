import { exceptionAlert } from "../../utils/helpers/exceptionAlert";
import { getRandomIntInclusive } from "../../utils/helpers/getRandomIntInclusive";
import { CodingContractTypes, parseArrayString } from "../ContractTypes";
import { CodingContractName } from "@enums";

export const findAllValidMathExpressions: Pick<CodingContractTypes, CodingContractName.FindAllValidMathExpressions> = {
  [CodingContractName.FindAllValidMathExpressions]: {
    desc: (data: [string, number]): string => {
      const digits: string = data[0];
      const target: number = data[1];

      return [
        "给你以下只包含 0 到 9 数字的字符串：\n\n",
        `${digits}\n\n`,
        `同时给你一个目标数字 ${target}。请返回所有可能的插入方式，`,
        "将 +（加）、-（减）和 *（乘）运算符插入到该字符串中，使",
        "其求值结果等于目标数字。（按常规运算顺序。）\n\n",
        "提供的答案应为一个包含有效表达式的字符串数组。",
        "本题给定的数据是一个包含两个元素的数组。第一个元素",
        "是数字字符串，第二个元素是目标数字：\n\n",
        `["${digits}", ${target}]\n\n`,
        "注意：求值顺序遵循脚本运算符优先级。\n",
        "注意：表达式中的数字不能有前导 0。换句话说，",
        `"1+01" 不是有效表达式。\n\n`,
        "示例：\n\n",
        `输入：digits = "123"，target = 6\n`,
        `输出：["1+2+3", "1*2*3"]\n\n`,
        `输入：digits = "105"，target = 5\n`,
        `输出：["1*0+5", "10-5"]`,
      ].join(" ");
    },
    difficulty: 10,
    generate: (): [string, number] => {
      const numDigits = getRandomIntInclusive(4, 12);
      const digitsArray: string[] = [];
      digitsArray.length = numDigits;
      for (let i = 0; i < digitsArray.length; ++i) {
        if (i === 0) {
          digitsArray[i] = String(getRandomIntInclusive(1, 9));
        } else {
          digitsArray[i] = String(getRandomIntInclusive(0, 9));
        }
      }

      const target: number = getRandomIntInclusive(-100, 100);
      const digits: string = digitsArray.join("");

      return [digits, target];
    },
    getAnswer: (data) => {
      const num = data[0];
      const target = data[1];

      function helper(
        res: string[],
        path: string,
        num: string,
        target: number,
        pos: number,
        evaluated: number,
        multed: number,
      ): void {
        if (pos === num.length) {
          if (target === evaluated) {
            res.push(path);
          }
          return;
        }

        for (let i = pos; i < num.length; ++i) {
          if (i != pos && num[pos] == "0") {
            break;
          }
          const cur = parseInt(num.substring(pos, i + 1));

          if (pos === 0) {
            helper(res, path + cur, num, target, i + 1, cur, cur);
          } else {
            helper(res, path + "+" + cur, num, target, i + 1, evaluated + cur, cur);
            helper(res, path + "-" + cur, num, target, i + 1, evaluated - cur, -cur);
            helper(res, path + "*" + cur, num, target, i + 1, evaluated - multed + multed * cur, multed * cur);
          }
        }
      }

      const result: string[] = [];
      helper(result, "", num, target, 0, 0, 0);

      return result;
    },
    solver: (data, answer) => {
      const result = findAllValidMathExpressions[CodingContractName.FindAllValidMathExpressions].getAnswer(data);

      if (result === null) {
        exceptionAlert(
          new Error(
            `Unexpected null when calculating the answer for ${CodingContractName.FindAllValidMathExpressions} contract. Data: ${data}`,
          ),
        );
        return false;
      }

      if (result.length !== answer.length) return false;

      const solutions = new Set(answer);
      return result.every((sol) => solutions.has(sol));
    },
    convertAnswer: (ans) => {
      const parsedAnswer = parseArrayString(ans);
      if (!findAllValidMathExpressions[CodingContractName.FindAllValidMathExpressions].validateAnswer(parsedAnswer)) {
        return null;
      }
      return parsedAnswer;
    },
    validateAnswer: (ans): ans is string[] => Array.isArray(ans) && ans.every((s) => typeof s === "string"),
  },
};
