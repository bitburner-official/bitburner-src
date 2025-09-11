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
        "You are given the following decimal value: \n",
        `${n} \n\n`,
        "Convert it to a binary representation and encode it as an 'extended Hamming code'.\n ",
        "The number should be converted to a string of '0' and '1' with no leading zeroes.\n",
        "An 'extended Hamming code' has an additional parity bit to enhance error detection.\n",
        "A parity bit is inserted at every position N where N is a power of 2, with the additional parity bit at position 0.\n",
        "Parity bits are used to make the total number of '1' bits in a given set of data even.\n",
        "Each parity bit at position N alternately considers N bits then ignores N bits, starting at and including position N.\n",
        "The additional parity bit at position 0 considers all bits including parity bits.\n",
        "For example, the parity bit at position 2 considers bits 2 to 3 and 6 to 7. The parity bit at position 1 considers bits 1, 3, 5 and 7.\n",
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
    difficulty: 9,
    desc: (n: string): string => {
      return [
        "You are given the following encoded binary string: \n",
        `'${n}' \n\n`,
        "Decode it as an 'extended Hamming code' and convert it to a decimal value.\n",
        "The binary string may include leading zeroes.\n",
        "An 'extended Hamming code' has an additional parity bit to enhance error detection.\n",
        "A parity bit is inserted at every position N where N is a power of 2, with the additional parity bit at position 0.\n",
        "Parity bits are used to make the total number of '1' bits in a given set of data even.\n",
        "Each parity bit at position N alternately considers N bits then ignores N bits, starting at and including position N.\n",
        "The additional parity bit at position 0 considers all bits including parity bits.\n",
        "For example, the parity bit at position 2 considers bits 2 to 3 and 6 to 7. The parity bit at position 1 considers bits 1, 3, 5 and 7.\n",
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
