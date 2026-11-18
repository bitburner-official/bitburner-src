import { parseCommand, parseCommands } from "../../../src/Terminal/Parser";
import { getCommandAfterLastPipe } from "../../../src/Terminal/StdIO/utils";
test("parseCommand Tests", () => {
  const expectedParsings = {
    // A quoted string that is not the entire argument should retain the quotes
    'alias -g n00dles="home;connect n00dles"': ["alias", "-g", 'n00dles="home;connect n00dles"'],
    // Normal quoted string handling
    'alias -g "n00dles=home;connect n00dles"': ["alias", "-g", "n00dles=home;connect n00dles"],
    // Check parsing even if quoted section appears within another quoted section, with differing whitespace between args and in quotes
    'run myScript.js  "" " " "  " hello   \' whoa" " \'': ["run", "myScript.js", "", " ", "  ", "hello", ' whoa" " '],
    // extra whitespace at start and end of string are ignored
    '  run myScript.js "" " " "  " hello \' whoa" " \'  ': ["run", "myScript.js", "", " ", "  ", "hello", ' whoa" " '],
  };
  for (const [commandString, expectedArray] of Object.entries(expectedParsings)) {
    expect(parseCommand(commandString)).toEqual(expectedArray);
  }
});

describe("parseCommands with pipe symbols that have no spaces around them", () => {
  it.each([
    ["echo 1|grep 1", ["echo", "1", "|", "grep", "1"]],
    ["echo hi>o.txt", ["echo", "hi", ">", "o.txt"]],
    ["echo hi>>o.txt", ["echo", "hi", ">>", "o.txt"]],
    ["cat<in.txt|grep x", ["cat", "<", "in.txt", "|", "grep", "x"]],
    ['echo "a|b">o.txt', ["echo", '"a|b"', ">", "o.txt"]],
    ["echo 'a>b'|cat", ["echo", "'a>b'", "|", "cat"]],
    ['echo "a|b', ["echo", '"a|b']],
  ])("splits '%s' outside quotes", (command, expected) => {
    const commands = parseCommands(command);
    expect(commands.length).toBe(1);
    expect(parseCommand(commands[0], false)).toEqual(expected);
  });

  it("still splits commands on ;", () => {
    expect(parseCommands("echo a|cat;ls>o.txt").map((command) => parseCommand(command, false))).toEqual([
      ["echo", "a", "|", "cat"],
      ["ls", ">", "o.txt"],
    ]);
  });
});

describe("getCommandAfterLastPipe", () => {
  it.each([
    ["run x", "run x"],
    ["ls | cat ", " cat "],
    ["ls >> o", " o"],
    ['ls | cat "a|b" ', ' cat "a|b" '],
    ["ls; echo hi | cat ", " cat "],
    ['echo "a;b" | cat ', " cat "],
    ['ls | cat "a;b|c" ', ' cat "a;b|c" '],
    ['ls; echo "x | y; z" | cat ', " cat "],
    ["ls|cat ", "cat "],
    ["ls>>o", "o"],
    ['ls|cat "a|b"', 'cat "a|b"'],
  ])("returns the text after the last pipe in '%s'", (command, expected) => {
    expect(getCommandAfterLastPipe(command)).toBe(expected);
  });

  it.each(["ls | cat; run ", "ls | cat ; run x", "ls | cat;"])(
    "returns the whole string when the pipe belongs to an earlier command in '%s'",
    (command) => {
      expect(getCommandAfterLastPipe(command)).toBe(command);
    },
  );
});
