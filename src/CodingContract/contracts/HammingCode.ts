import { HammingDecode, HammingEncode, HammingEncodeProperly } from "../../utils/HammingCodeTools";
import { getRandomIntInclusive } from "../../utils/helpers/getRandomIntInclusive";
import { CodingContractTypes } from "../ContractTypes";
import { CodingContractName } from "@enums";

export const hammingCode: Pick<
  CodingContractTypes,
  CodingContractName.HammingCodesEncodedBinaryToInteger | CodingContractName.HammingCodesIntegerToEncodedBinary
> = {
  [CodingContractName.HammingCodesIntegerToEncodedBinary]: {
    difficulty: 5,
    desc: (n: number): string => {
      return [
        "You are given the following decimal value: \n",
        `${n} \n\n`,
        "Convert it to a binary representation and encode it as an 'extended Hamming code'.\n ",
        "The number should be converted to a string of '0' and '1' with no leading zeroes.\n",
        "An 'extended Hamming code' has an additional parity bit to enhance error detection.\n",
        "A parity bit is inserted at every position N where N is a power of 2, with the additional parity bit at position 0.\n",
        "Parity bits are used to make the total number of '1' bits in a given set of data even.\n",
        "Each parity bit at position 2^N alternately considers N bits then ignores N bits, starting at position 2^N.\n",
        "The additional parity bit at position 0 considers all bits including parity bits.\n",
        "The endianness of the parity bits is reversed compared to the endianness of the data bits:\n",
        "Data bits are encoded most significant bit first and the parity bits encoded least significant bit first.\n",
        "The additional parity bit at position 0 is set last.\n\n",
        "Examples:\n\n",
        "8 in binary is 1000, and encodes to 11110000 (pppdpddd - where p is a parity bit and d is a data bit)\n",
        "21 in binary is 10101, and encodes to 1001101011 (pppdpdddpd)\n\n",
        "For more information on the 'rule' of encoding, refer to Wikipedia (https://wikipedia.org/wiki/Hamming_code)",
        "or the 3Blue1Brown videos on Hamming Codes. (https://youtube.com/watch?v=X8jsijhllIA)\n",
        "NOTE: The wikipedia entry does not cover the specific 'extended Hamming code' structure used in this contract.",
      ].join(" ");
    },
    generate: (): number => {
      const x = Math.pow(2, 4);
      const y = Math.pow(2, getRandomIntInclusive(1, 57));
      return getRandomIntInclusive(Math.min(x, y), Math.max(x, y));
    },
    solver: (data, answer) => {
      return HammingEncode(data) === answer;
    },
    convertAnswer: (ans) => ans,
    validateAnswer: (ans): ans is string => typeof ans === "string",
  },
  [CodingContractName.HammingCodesEncodedBinaryToInteger]: {
    difficulty: 8,
    desc: (n: string): string => {
      return [
        "You are given the following encoded binary string: \n",
        `'${n}' \n\n`,
        "Decode it as an 'extended Hamming code' and convert it to a decimal value.\n",
        "The binary string may include leading zeroes.\n",
        "An 'extended Hamming code' has an additional parity bit to enhance error detection.\n",
        "A parity bit is inserted at every position N where N is a power of 2, with the additional parity bit at position 0.\n",
        "Parity bits are used to make the total number of '1' bits in a given set of data even.\n",
        "Each parity bit at position 2^N alternately considers 2^N bits then ignores 2^N bits, starting at position 2^N.\n",
        "The additional parity bit at position 0 considers all bits including parity bits.\n",
        "The endianness of the parity bits is reversed compared to the endianness of the data bits:\n",
        "Data bits are encoded most significant bit first and the parity bits encoded least significant bit first.\n",
        "The additional parity bit at position 0 is set last.\n",
        "There is a ~55% chance for an altered bit at a random index.\n",
        "Find the possible altered bit, fix it and extract the decimal value.\n\n",
        "Examples:\n\n",
        "'11110000' passes the parity checks and has data bits of 1000, which is 8 in binary.\n",
        "'1001101010' fails the parity checks and needs the last bit to be corrected to get '1001101011',",
        "after which the data bits are found to be 10101, which is 21 in binary.\n\n",
        "For more information on the 'rule' of encoding, refer to Wikipedia (https://wikipedia.org/wiki/Hamming_code)",
        "or the 3Blue1Brown videos on Hamming Codes. (https://youtube.com/watch?v=X8jsijhllIA)\n",
        "NOTE: The wikipedia entry does not cover the specific 'extended Hamming code' structure used in this contract.",
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
    solver: (data, answer) => {
      return HammingDecode(data) === answer;
    },
    convertAnswer: (ans) => parseInt(ans, 10),
    validateAnswer: (ans): ans is number => typeof ans === "number",
  },
};
