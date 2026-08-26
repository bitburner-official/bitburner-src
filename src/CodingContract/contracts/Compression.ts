import { CodingContractTypes } from "../ContractTypes";
import { exceptionAlert } from "../../utils/helpers/exceptionAlert";
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
        "游程编码（RLE）是一种数据压缩技术，它将数据编码为一系列",
        "重复单个字符的游程。每个游程编码为一个长度，后跟字符本身。长度",
        "用一个 ASCII 数字编码；长度为 10 个或更多字符的游程会被拆分成",
        "多个游程。\n\n",
        "给你以下输入字符串：\n",
        `    ${plaintext}\n`,
        "请使用游程编码对其进行编码，使输出长度尽可能短。\n\n",
        "示例：\n\n",
        "    aaaaabccc            ->  5a1b3c\n",
        "    aAaAaA               ->  1a1A1a1A1a1A\n",
        "    111112333            ->  511233\n",
        "    zzzzzzzzzzzzzzzzzzz  ->  9z9z1z  （或 9z8z2z 等）",
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
    getAnswer: (plain) => {
      if (plain.length === 0) return "";

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
      return out;
    },
    solver: (plain, answer) => {
      return compression[CodingContractName.CompressionIRLECompression].getAnswer(plain) === answer;
    },
    convertAnswer: (ans) => ans.replace(/\s/g, ""),
    validateAnswer: (ans): ans is string => typeof ans === "string",
  },
  [CodingContractName.CompressionIILZDecompression]: {
    difficulty: 4,
    desc: (compressed: string): string => {
      return [
        "Lempel-Ziv（LZ）压缩是一种数据压缩技术，它通过对数据较早部分的引用来编码数据。",
        "在 LZ 的这个变体中，数据以两种类型的块进行编码。每个块",
        "以一个长度 L 开头（L 用 1 到 9 的单个 ASCII 数字编码），后跟块数据，",
        "块数据是以下二者之一：\n\n",
        "1. 恰好 L 个字符，这些字符将被直接复制到未压缩的数据中。\n",
        "2. 对未压缩数据较早部分的一个引用。为此，长度后面跟着",
        "第二个 ASCII 数字 X：L 个输出字符中的每一个都是未压缩数据中",
        "位于它前面 X 个位置的那个字符的副本。\n\n",
        "对于这两种块类型，长度为 0 都意味着该块立即结束，下一个字符",
        "是新块的开始。这两种块类型交替出现，从类型 1 开始，最后的",
        "一块可以是任一类型。\n\n",
        "给你以下 LZ 编码的字符串：\n",
        `    ${compressed}\n`,
        "请将其解码并输出原始字符串。\n\n",
        "示例：逐块解码 '5aaabb450723abb'\n\n",
        "    5aaabb           ->  aaabb\n",
        "    5aaabb45         ->  aaabbaaab\n",
        "    5aaabb450        ->  aaabbaaab\n",
        "    5aaabb45072      ->  aaabbaaababababa\n",
        "    5aaabb450723abb  ->  aaabbaaababababaabb",
      ].join(" ");
    },
    generate: (): string => {
      return comprLZEncode(comprLZGenerate());
    },
    getAnswer: (compr) => {
      return comprLZDecode(compr) ?? "";
    },
    solver: (compr, answer) => {
      return compression[CodingContractName.CompressionIILZDecompression].getAnswer(compr) === answer;
    },
    convertAnswer: (ans) => ans.replace(/\s/g, ""),
    validateAnswer: (ans): ans is string => typeof ans === "string",
  },
  [CodingContractName.CompressionIIILZCompression]: {
    difficulty: 10,
    desc: (plaintext: string): string => {
      return [
        "Lempel-Ziv（LZ）压缩是一种数据压缩技术，它通过对数据较早部分的引用来编码数据。",
        "在 LZ 的这个变体中，数据以两种类型的块进行编码。每个块",
        "以一个长度 L 开头（L 用 1 到 9 的单个 ASCII 数字编码），后跟块数据，",
        "块数据是以下二者之一：\n\n",
        "1. 恰好 L 个字符，这些字符将被直接复制到未压缩的数据中。\n",
        "2. 对未压缩数据较早部分的一个引用。为此，长度后面跟着",
        "第二个 ASCII 数字 X：L 个输出字符中的每一个都是未压缩数据中",
        "位于它前面 X 个位置的那个字符的副本。\n\n",
        "对于这两种块类型，长度为 0 都意味着该块立即结束，下一个字符",
        "是新块的开始。这两种块类型交替出现，从类型 1 开始，最后的",
        "一块可以是任一类型。\n\n",
        "给你以下输入字符串：\n",
        `    ${plaintext}\n`,
        "请使用 Lempel-Ziv 编码对其进行编码，使输出长度尽可能短。\n\n",
        "示例（部分示例还有其他最短长度的可行编码）：\n",
        "    abracadabra     ->  7abracad47\n",
        "    mississippi     ->  4miss433ppi\n",
        "    aAAaAAaAaAA     ->  3aAA53035\n",
        "    2718281828      ->  627182844\n",
        "    abcdefghijk     ->  9abcdefghi02jk\n",
        "    aaaaaaaaaaaa    ->  3aaa91\n",
        "    aaaaaaaaaaaaa   ->  1a91031\n",
        "    aaaaaaaaaaaaaa  ->  1a91041",
      ].join(" ");
    },
    generate: (): string => {
      return comprLZGenerate();
    },
    getAnswer: (plain) => {
      return comprLZEncode(plain);
    },
    solver: (plain, answer) => {
      const encoded = compression[CodingContractName.CompressionIIILZCompression].getAnswer(plain);
      if (encoded === null) {
        exceptionAlert(
          new Error(
            `Unexpected null when calculating the answer for ${CodingContractName.CompressionIIILZCompression} contract. Data: ${plain}`,
          ),
        );
        return false;
      }
      return answer.length <= encoded.length && comprLZDecode(answer) === plain;
    },
    convertAnswer: (ans) => ans.replace(/\s/g, ""),
    validateAnswer: (ans): ans is string => typeof ans === "string",
  },
};

// choose random characters for generating plaintext to compress
function comprGenChar(): string {
  const r = Math.random();
  if (r < 0.4) {
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(26 * Math.random())];
  } else if (r < 0.8) {
    return "abcdefghijklmnopqrstuvwxyz"[Math.floor(26 * Math.random())];
  } else {
    return "01234567689"[Math.floor(10 * Math.random())];
  }
}

// generate plaintext which is amenable to LZ encoding
function comprLZGenerate(): string {
  const length = 50 + Math.floor(25 * (Math.random() + Math.random()));
  let plain = "";

  while (plain.length < length) {
    if (Math.random() < 0.8) {
      plain += comprGenChar();
    } else {
      const length = 1 + Math.floor(9 * Math.random());
      const offset = 1 + Math.floor(9 * Math.random());
      if (offset > plain.length) {
        continue;
      }

      for (let i = 0; i < length; ++i) {
        plain += plain[plain.length - offset];
      }
    }
  }

  return plain.substring(0, length);
}

// compress plaintext string
function comprLZEncode(plain: string): string {
  // for state[i][j]:
  //      if i is 0, we're adding a literal of length j
  //      else, we're adding a backreference of offset i and length j
  let cur_state: (string | null)[][] = Array.from(Array(10), () => Array<string | null>(10).fill(null));
  let new_state: (string | null)[][] = Array.from(Array(10), () => Array<string | null>(10));

  function set(state: (string | null)[][], i: number, j: number, str: string): void {
    const current = state[i][j];
    if (current == null || str.length < current.length) {
      state[i][j] = str;
    } else if (str.length === current.length && Math.random() < 0.5) {
      // if two strings are the same length, pick randomly so that
      // we generate more possible inputs to Compression II
      state[i][j] = str;
    }
  }

  // initial state is a literal of length 1
  cur_state[0][1] = "";

  for (let i = 1; i < plain.length; ++i) {
    for (const row of new_state) {
      row.fill(null);
    }
    const c = plain[i];

    // handle literals
    for (let length = 1; length <= 9; ++length) {
      const string = cur_state[0][length];
      if (string == null) {
        continue;
      }

      if (length < 9) {
        // extend current literal
        set(new_state, 0, length + 1, string);
      } else {
        // start new literal
        set(new_state, 0, 1, string + "9" + plain.substring(i - 9, i) + "0");
      }

      for (let offset = 1; offset <= Math.min(9, i); ++offset) {
        if (plain[i - offset] === c) {
          // start new backreference
          set(new_state, offset, 1, string + String(length) + plain.substring(i - length, i));
        }
      }
    }

    // handle backreferences
    for (let offset = 1; offset <= 9; ++offset) {
      for (let length = 1; length <= 9; ++length) {
        const string = cur_state[offset][length];
        if (string == null) {
          continue;
        }

        if (plain[i - offset] === c) {
          if (length < 9) {
            // extend current backreference
            set(new_state, offset, length + 1, string);
          } else {
            // start new backreference
            set(new_state, offset, 1, string + "9" + String(offset) + "0");
          }
        }

        // start new literal
        set(new_state, 0, 1, string + String(length) + String(offset));

        // end current backreference and start new backreference
        for (let new_offset = 1; new_offset <= Math.min(9, i); ++new_offset) {
          if (plain[i - new_offset] === c) {
            set(new_state, new_offset, 1, string + String(length) + String(offset) + "0");
          }
        }
      }
    }

    const tmp_state = new_state;
    new_state = cur_state;
    cur_state = tmp_state;
  }

  let result = null;

  for (let len = 1; len <= 9; ++len) {
    let string = cur_state[0][len];
    if (string == null) {
      continue;
    }

    string += String(len) + plain.substring(plain.length - len, plain.length);
    if (result == null || string.length < result.length) {
      result = string;
    } else if (string.length == result.length && Math.random() < 0.5) {
      result = string;
    }
  }

  for (let offset = 1; offset <= 9; ++offset) {
    for (let len = 1; len <= 9; ++len) {
      let string = cur_state[offset][len];
      if (string == null) {
        continue;
      }

      string += String(len) + "" + String(offset);
      if (result == null || string.length < result.length) {
        result = string;
      } else if (string.length == result.length && Math.random() < 0.5) {
        result = string;
      }
    }
  }

  return result ?? "";
}

// decompress LZ-compressed string, or return null if input is invalid
function comprLZDecode(compr: string): string | null {
  let plain = "";

  for (let i = 0; i < compr.length; ) {
    const literal_length = compr.charCodeAt(i) - 0x30;

    if (literal_length < 0 || literal_length > 9 || i + 1 + literal_length > compr.length) {
      return null;
    }

    plain += compr.substring(i + 1, i + 1 + literal_length);
    i += 1 + literal_length;

    if (i >= compr.length) {
      break;
    }
    const backref_length = compr.charCodeAt(i) - 0x30;

    if (backref_length < 0 || backref_length > 9) {
      return null;
    } else if (backref_length === 0) {
      ++i;
    } else {
      if (i + 1 >= compr.length) {
        return null;
      }

      const backref_offset = compr.charCodeAt(i + 1) - 0x30;
      if ((backref_length > 0 && (backref_offset < 1 || backref_offset > 9)) || backref_offset > plain.length) {
        return null;
      }

      for (let j = 0; j < backref_length; ++j) {
        plain += plain[plain.length - backref_offset];
      }

      i += 2;
    }
  }

  return plain;
}
