import { parseCommand } from "../../../src/Terminal/Parser";
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
