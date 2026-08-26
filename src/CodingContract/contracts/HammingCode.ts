import { getRandomIntInclusive } from "../../utils/helpers/getRandomIntInclusive";
import { CodingContractTypes } from "../ContractTypes";
import { CodingContractName } from "@enums";

export const hammingCode: Pick<
  CodingContractTypes,
  CodingContractName.HammingCodesEncodedBinaryToInteger | CodingContractName.HammingCodesIntegerToEncodedBinary
> = {
  [CodingContractName.HammingCodesIntegerToEncodedBinary]: {
    difficulty: 6,
    desc: (n: number): string => {
      return [
        "给你以下十进制数值：\n",
        `${n} \n\n`,
        "请将它转换为二进制表示，并将其编码为“扩展汉明码”。\n ",
        "该数字应被转换为不含前导零的 '0' 和 '1' 字符串。\n",
        "“扩展汉明码”包含一个额外的校验位以增强错误检测能力。\n",
        "校验位插入在每个 N 为 2 的幂的位置 N 上，另外还有一个位于位置 0 的额外校验位。\n",
        "校验位用于使一组数据中 '1' 位的总数为偶数。\n",
        "从位置 N 开始（含），位置 N 处的每个校验位交替地考虑 N 个位、忽略 N 个位。\n",
        "位置 0 的额外校验位考虑所有位，包括校验位本身。\n",
        "例如，位置 2 的校验位考虑第 2 至 3 位和第 6 至 7 位；位置 1 的校验位考虑第 1、3、5、7 位。\n",
        "校验位的字节序与数据位的字节序相反：\n",
        "数据位按最高有效位在前编码，而校验位按最低有效位在前编码。\n",
        "位置 0 的额外校验位最后设置。\n\n",
        "示例：\n\n",
        "8 的二进制是 1000，编码后为 11110000（pppdpddd - 其中 p 是校验位，d 是数据位）\n",
        "21 的二进制是 10101，编码后为 1001101011（pppdpdddpd）\n\n",
        "有关编码“规则”的更多信息，请参阅维基百科（https://wikipedia.org/wiki/Hamming_code）",
        "或 3Blue1Brown 关于汉明码的视频。（https://youtube.com/watch?v=X8jsijhllIA）\n",
        "注意：维基百科条目并未涵盖本合约使用的特定“扩展汉明码”结构。",
      ].join(" ");
    },
    generate: (): number => {
      const x = Math.pow(2, 4);
      const y = Math.pow(2, getRandomIntInclusive(1, 57));
      return getRandomIntInclusive(Math.min(x, y), Math.max(x, y));
    },
    getAnswer: (data) => {
      return HammingEncode(data);
    },
    solver: (data, answer) => {
      return hammingCode[CodingContractName.HammingCodesIntegerToEncodedBinary].getAnswer(data) === answer;
    },
    convertAnswer: (ans) => ans,
    validateAnswer: (ans): ans is string => typeof ans === "string",
  },
  [CodingContractName.HammingCodesEncodedBinaryToInteger]: {
    difficulty: 9,
    desc: (n: string): string => {
      return [
        "给你以下编码后的二进制字符串：\n",
        `'${n}' \n\n`,
        "请将其作为“扩展汉明码”解码并转换为十进制值。\n",
        "该二进制字符串可能包含前导零。\n",
        "“扩展汉明码”包含一个额外的校验位以增强错误检测能力。\n",
        "校验位插入在每个 N 为 2 的幂的位置 N 上，另外还有一个位于位置 0 的额外校验位。\n",
        "校验位用于使一组数据中 '1' 位的总数为偶数。\n",
        "从位置 N 开始（含），位置 N 处的每个校验位交替地考虑 N 个位、忽略 N 个位。\n",
        "位置 0 的额外校验位考虑所有位，包括校验位本身。\n",
        "例如，位置 2 的校验位考虑第 2 至 3 位和第 6 至 7 位；位置 1 的校验位考虑第 1、3、5、7 位。\n",
        "校验位的字节序与数据位的字节序相反：\n",
        "数据位按最高有效位在前编码，而校验位按最低有效位在前编码。\n",
        "位置 0 的额外校验位最后设置。\n",
        "在随机索引处约有 ~55% 的概率存在一位被篡改的比特。\n",
        "找出可能被篡改的位，修复它并提取出十进制值。\n\n",
        "示例：\n\n",
        "'11110000' 通过奇偶校验，其数据位为 1000，即二进制的 8。\n",
        "'1001101010' 未通过奇偶校验，需要将最后一位修正得到 '1001101011'，",
        "之后可发现其数据位为 10101，即二进制的 21。\n\n",
        "有关编码“规则”的更多信息，请参阅维基百科（https://wikipedia.org/wiki/Hamming_code）",
        "或 3Blue1Brown 关于汉明码的视频。（https://youtube.com/watch?v=X8jsijhllIA）\n",
        "注意：维基百科条目并未涵盖本合约使用的特定“扩展汉明码”结构。",
      ].join(" ");
    },
    generate: (): string => {
      const _alteredBit = Math.round(Math.random());
      const x = Math.pow(2, 4);
      const y = Math.pow(2, getRandomIntInclusive(1, 57));
      const _buildArray: string[] = HammingEncodeProperly(getRandomIntInclusive(Math.min(x, y), Math.max(x, y))).split(
        "",
      );
      if (_alteredBit) {
        const _randomIndex: number = getRandomIntInclusive(0, _buildArray.length - 1);
        _buildArray[_randomIndex] = _buildArray[_randomIndex] == "0" ? "1" : "0";
      }
      return _buildArray.join("");
    },
    getAnswer: (data) => {
      return HammingDecode(data);
    },
    solver: (data, answer) => {
      return hammingCode[CodingContractName.HammingCodesEncodedBinaryToInteger].getAnswer(data) === answer;
    },
    convertAnswer: (ans) => parseInt(ans, 10),
    validateAnswer: (ans): ans is number => typeof ans === "number",
  },
};

function HammingEncode(data: number): string {
  const enc: number[] = [0];
  const data_bits: number[] = data
    .toString(2)
    .split("")
    .reverse()
    .map((value) => parseInt(value));

  let k = data_bits.length;

  /* NOTE: writing the data like this flips the endianness, this is what the
   * original implementation by Hedrauta did so I'm keeping it like it was. */
  for (let i = 1; k > 0; i++) {
    if ((i & (i - 1)) != 0) {
      enc[i] = data_bits[--k];
    } else {
      enc[i] = 0;
    }
  }

  let parityNumber = 0;

  /* Figure out the subsection parities */
  for (let i = 0; i < enc.length; i++) {
    if (enc[i]) {
      parityNumber ^= i;
    }
  }

  const parityArray = parityNumber
    .toString(2)
    .split("")
    .reverse()
    .map((value) => parseInt(value));

  /* Set the parity bits accordingly */
  for (let i = 0; i < parityArray.length; i++) {
    enc[2 ** i] = parityArray[i] ? 1 : 0;
  }

  parityNumber = 0;
  /* Figure out the overall parity for the entire block */
  for (let i = 0; i < enc.length; i++) {
    if (enc[i]) {
      parityNumber++;
    }
  }

  /* Finally set the overall parity bit */
  enc[0] = parityNumber % 2 == 0 ? 0 : 1;

  return enc.join("");
}

function HammingEncodeProperly(data: number): string {
  /* How many bits do we need?
   * n = 2^m
   * k = 2^m - m - 1
   * where k is the number of data bits, m the number
   * of parity bits and n the number of total bits. */

  let m = 1;

  while (2 ** (2 ** m - m - 1) - 1 < data) {
    m++;
  }

  const n: number = 2 ** m;
  const k: number = 2 ** m - m - 1;

  const enc: number[] = [0];
  const data_bits: number[] = data
    .toString(2)
    .split("")
    .reverse()
    .map((value) => parseInt(value));

  /* Flip endianness as in the original implementation by Hedrauta
   * and write the data back to front
   * XXX why do we do this? */
  for (let i = 1, j = k; i < n; i++) {
    if ((i & (i - 1)) != 0) {
      enc[i] = data_bits[--j] ? data_bits[j] : 0;
    }
  }

  let parityNumber = 0;

  /* Figure out the subsection parities */
  for (let i = 0; i < n; i++) {
    if (enc[i]) {
      parityNumber ^= i;
    }
  }

  const parityArray = parityNumber
    .toString(2)
    .split("")
    .reverse()
    .map((value) => parseInt(value));

  /* Set the parity bits accordingly */
  for (let i = 0; i < m; i++) {
    enc[2 ** i] = parityArray[i] ? 1 : 0;
  }

  parityNumber = 0;
  /* Figure out the overall parity for the entire block */
  for (let i = 0; i < n; i++) {
    if (enc[i]) {
      parityNumber++;
    }
  }

  /* Finally set the overall parity bit */
  enc[0] = parityNumber % 2 == 0 ? 0 : 1;

  return enc.join("");
}

function HammingDecode(data: string): number {
  let err = 0;
  const bits: number[] = [];

  /* TODO why not just work with an array of digits from the start? */
  const bitStringArray = data.split("");
  for (let i = 0; i < bitStringArray.length; ++i) {
    const bit = parseInt(bitStringArray[i]);
    bits[i] = bit;

    if (bit) {
      err ^= +i;
    }
  }

  /* If err != 0 then it spells out the index of the bit that was flipped */
  if (err) {
    /* Flip to correct */
    bits[err] = bits[err] ? 0 : 1;
  }

  /* Now we have to read the message, bit 0 is unused (it's the overall parity bit
   * which we don't care about). Each bit at an index that is a power of 2 is
   * a parity bit and not part of the actual message. */

  let ans = "";

  for (let i = 1; i < bits.length; i++) {
    /* i is not a power of two so it's not a parity bit */
    if ((i & (i - 1)) != 0) {
      ans += bits[i];
    }
  }

  /* TODO to avoid ambiguity about endianness why not let the player return the extracted (and corrected)
   * data bits, rather than guessing at how to convert it to a decimal string? */
  return parseInt(ans, 2);
}
