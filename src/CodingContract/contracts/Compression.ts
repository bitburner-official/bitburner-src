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
        `    ${plaintext}\n`,
        "Encode it using run-length encoding with the minimum possible output length.\n\n",
        "Examples:\n\n",
        "    aaaaabccc            ->  5a1b3c\n",
        "    aAaAaA               ->  1a1A1a1A1a1A\n",
        "    111112333            ->  511233\n",
        "    zzzzzzzzzzzzzzzzzzz  ->  9z9z1z  (or 9z8z2z, etc.)",
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
        `    ${compressed}\n`,
        "Decode it and output the original string.\n\n",
        "Example: decoding '5aaabb450723abb' chunk-by-chunk\n\n",
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
        `    ${plaintext}\n`,
        "Encode it using Lempel-Ziv encoding with the minimum possible output length.\n\n",
        "Examples (some have other possible encodings of minimal length):\n",
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
    solver: (plain, answer) => {
      return answer.length <= comprLZEncode(plain).length && comprLZDecode(answer) === plain;
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
