import { comprGenChar, comprLZDecode, comprLZEncode, comprLZGenerate } from "../../utils/CompressionContracts";
import { CodingContractTypes } from "../ContractTypes";
import { CodingContractName } from "@enums";

export const compression: Pick<
  CodingContractTypes,
  | CodingContractName.CompressionIRLECompression
  | CodingContractName.CompressionIILZDecompression
  | CodingContractName.CompressionIIILZCompression
> = {
  [CodingContractName.CompressionIRLECompression]: {
    difficulty: 2,
    desc: (plaintext: string): string => {
      return [
        "Run-length encoding (RLE) is a data compression technique which encodes data as a series of runs of",
        "a repeated single character. Runs are encoded as a length, followed by the character itself. Lengths",
        "are encoded as a single ASCII digit; runs of 10 characters or more are encoded by splitting them",
        "into multiple runs.\n\n",
        "You are given the following input string:\n",
        `\u00A0 \u00A0 ${plaintext}\n`,
        "Encode it using run-length encoding with the minimum possible output length.\n\n",
        "Examples:\n\n",
        "\u00A0 \u00A0 aaaaabccc \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0-> \u00A05a1b3c\n",
        "\u00A0 \u00A0 aAaAaA \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 -> \u00A01a1A1a1A1a1A\n",
        "\u00A0 \u00A0 111112333 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0-> \u00A0511233\n",
        "\u00A0 \u00A0 zzzzzzzzzzzzzzzzzzz \u00A0-> \u00A09z9z1z \u00A0(or 9z8z2z, etc.)",
      ].join(" ");
    },
    generate: (): string => {
      const length = 50 + Math.floor(25 * (Math.random() + Math.random()));
      let plain = "";

      while (plain.length < length) {
        const r = Math.random();

        let n = 1;
        if (r < 0.3) {
          n = 1;
        } else if (r < 0.6) {
          n = 2;
        } else if (r < 0.9) {
          n = Math.floor(10 * Math.random());
        } else {
          n = 10 + Math.floor(5 * Math.random());
        }

        const c = comprGenChar();
        plain += c.repeat(n);
      }

      return plain.substring(0, length);
    },
    solver: (plain, answer) => {
      if (plain.length === 0) return answer === "";

      let out = "";
      let count = 1;
      for (let i = 1; i < plain.length; i++) {
        if (count < 9 && plain[i] === plain[i - 1]) {
          count++;
          continue;
        }
        out += count + plain[i - 1];
        count = 1;
      }
      out += count + plain[plain.length - 1];
      return out === answer;
    },
    convertAnswer: (ans) => ans.replace(/\s/g, ""),
    validateAnswer: (ans): ans is string => typeof ans === "string",
  },
  [CodingContractName.CompressionIILZDecompression]: {
    difficulty: 4,
    desc: (compressed: string): string => {
      return [
        "Lempel-Ziv (LZ) compression is a data compression technique which encodes data using references to",
        "earlier parts of the data. In this variant of LZ, data is encoded in two types of chunk. Each chunk",
        "begins with a length L, encoded as a single ASCII digit from 1 to 9, followed by the chunk data,",
        "which is either:\n\n",
        "1. Exactly L characters, which are to be copied directly into the uncompressed data.\n",
        "2. A reference to an earlier part of the uncompressed data. To do this, the length is followed",
        "by a second ASCII digit X: each of the L output characters is a copy of the character X",
        "places before it in the uncompressed data.\n\n",
        "For both chunk types, a length of 0 instead means the chunk ends immediately, and the next character",
        "is the start of a new chunk. The two chunk types alternate, starting with type 1, and the final",
        "chunk may be of either type.\n\n",
        "You are given the following LZ-encoded string:\n",
        `\u00A0 \u00A0 ${compressed}\n`,
        "Decode it and output the original string.\n\n",
        "Example: decoding '5aaabb450723abb' chunk-by-chunk\n\n",
        "\u00A0 \u00A0 5aaabb \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 -> \u00A0aaabb\n",
        "\u00A0 \u00A0 5aaabb45 \u00A0 \u00A0 \u00A0 \u00A0 -> \u00A0aaabbaaab\n",
        "\u00A0 \u00A0 5aaabb450 \u00A0 \u00A0 \u00A0 \u00A0-> \u00A0aaabbaaab\n",
        "\u00A0 \u00A0 5aaabb45072 \u00A0 \u00A0 \u00A0-> \u00A0aaabbaaababababa\n",
        "\u00A0 \u00A0 5aaabb450723abb \u00A0-> \u00A0aaabbaaababababaabb",
      ].join(" ");
    },
    generate: (): string => {
      return comprLZEncode(comprLZGenerate());
    },
    solver: (compr, answer) => {
      return (comprLZDecode(compr) ?? "") === answer;
    },
    convertAnswer: (ans) => ans.replace(/\s/g, ""),
    validateAnswer: (ans): ans is string => typeof ans === "string",
  },
  [CodingContractName.CompressionIIILZCompression]: {
    difficulty: 10,
    desc: (plaintext: string): string => {
      return [
        "Lempel-Ziv (LZ) compression is a data compression technique which encodes data using references to",
        "earlier parts of the data. In this variant of LZ, data is encoded in two types of chunk. Each chunk",
        "begins with a length L, encoded as a single ASCII digit from 1 to 9, followed by the chunk data,",
        "which is either:\n\n",
        "1. Exactly L characters, which are to be copied directly into the uncompressed data.\n",
        "2. A reference to an earlier part of the uncompressed data. To do this, the length is followed",
        "by a second ASCII digit X: each of the L output characters is a copy of the character X",
        "places before it in the uncompressed data.\n\n",
        "For both chunk types, a length of 0 instead means the chunk ends immediately, and the next character",
        "is the start of a new chunk. The two chunk types alternate, starting with type 1, and the final",
        "chunk may be of either type.\n\n",
        "You are given the following input string:\n",
        `\u00A0 \u00A0 ${plaintext}\n`,
        "Encode it using Lempel-Ziv encoding with the minimum possible output length.\n\n",
        "Examples (some have other possible encodings of minimal length):\n",
        "\u00A0 \u00A0 abracadabra \u00A0 \u00A0 -> \u00A07abracad47\n",
        "\u00A0 \u00A0 mississippi \u00A0 \u00A0 -> \u00A04miss433ppi\n",
        "\u00A0 \u00A0 aAAaAAaAaAA \u00A0 \u00A0 -> \u00A03aAA53035\n",
        "\u00A0 \u00A0 2718281828 \u00A0 \u00A0 \u00A0-> \u00A0627182844\n",
        "\u00A0 \u00A0 abcdefghijk \u00A0 \u00A0 -> \u00A09abcdefghi02jk\n",
        "\u00A0 \u00A0 aaaaaaaaaaaa \u00A0 \u00A0-> \u00A03aaa91\n",
        "\u00A0 \u00A0 aaaaaaaaaaaaa \u00A0 -> \u00A01a91031\n",
        "\u00A0 \u00A0 aaaaaaaaaaaaaa \u00A0-> \u00A01a91041",
      ].join(" ");
    },
    generate: (): string => {
      return comprLZGenerate();
    },
    solver: (plain, answer) => {
      return answer.length <= comprLZEncode(plain).length && comprLZDecode(answer) === plain;
    },
    convertAnswer: (ans) => ans.replace(/\s/g, ""),
    validateAnswer: (ans): ans is string => typeof ans === "string",
  },
};
