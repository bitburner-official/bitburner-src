import { Aliases, GlobalAliases, substituteAliases, parseAliasDeclaration } from "../../../src/Alias";
import { parseCommand, parseCommands } from "../../../src/Terminal/Parser";

const parseTokens = (command: string) => parseCommands(command).map((c) => parseCommand(c, false));
describe("substituteAliases Tests", () => {
  beforeEach(() => {
    Aliases.clear();
    GlobalAliases.clear();
  });

  it("Should not infinitely recurse when alias value contains the alias name", () => {
    parseAliasDeclaration("buy=buy -l");
    const result = substituteAliases("buy");
    expect(result).toEqual("buy -l");
  });

  it("Should not infinitely recurse when global alias value contains the alias name", () => {
    parseAliasDeclaration("scan=scan -d 5", true);
    const result = substituteAliases("scan");
    expect(result).toEqual("scan -d 5");
  });

  it("Should gracefully handle recursive local aliases", () => {
    parseAliasDeclaration("recursiveAlias=b");
    parseAliasDeclaration("b=c");
    parseAliasDeclaration("c=d");
    parseAliasDeclaration("d=recursiveAlias");

    const result = substituteAliases("recursiveAlias");
    expect(result).toEqual("recursiveAlias");
  });

  it("Should only change local aliases if they are the start of the command", () => {
    parseAliasDeclaration("a=b");
    parseAliasDeclaration("b=c");
    parseAliasDeclaration("c=d");
    parseAliasDeclaration("d=e");

    const result = substituteAliases("a b c d");
    expect(result).toEqual("e b c d");
  });

  it("Should gracefully handle recursive global aliases", () => {
    parseAliasDeclaration("a=b", true);
    parseAliasDeclaration("b=c", true);
    parseAliasDeclaration("c=d", true);
    parseAliasDeclaration("d=a", true);

    const result = substituteAliases("a b c d");
    expect(result).toEqual("a b c d");
  });

  it("Should gracefully handle recursive mixed local and global aliases", () => {
    parseAliasDeclaration("recursiveAlias=b", true);
    parseAliasDeclaration("b=c", false);
    parseAliasDeclaration("c=d", true);
    parseAliasDeclaration("d=recursiveAlias", false);

    const result = substituteAliases("recursiveAlias");
    expect(result).toEqual("recursiveAlias");
  });

  it("Should replace chained aliases", () => {
    parseAliasDeclaration("a=b", true);
    parseAliasDeclaration("b=c", true);
    parseAliasDeclaration("c=d", true);
    parseAliasDeclaration("d=e", true);

    const result = substituteAliases("a");
    expect(result).toEqual("e");
  });

  describe("with pipes and redirects", () => {
    beforeEach(() => {
      parseAliasDeclaration('g="grep foo"');
    });

    it("Should apply local aliases to the command after a pipe", () => {
      expect(substituteAliases("ls | g")).toEqual("ls | grep foo");
    });

    it.each(["ls > g", "ls >> g", "cat < g"])("Should not apply local aliases to the file in '%s'", (command) => {
      expect(substituteAliases(command)).toEqual(command);
    });

    it("Should apply local aliases next to a pipe with no spaces around it", () => {
      parseAliasDeclaration('l="ls -l"');
      expect(parseTokens("l|g")).toEqual([["ls", "-l", "|", "grep", "foo"]]);
    });

    it("Should split an alias value's own pipe with no spaces around it", () => {
      parseAliasDeclaration('lg="ls|grep x"');
      expect(parseTokens("lg")).toEqual([["ls", "|", "grep", "x"]]);
    });

    it("Should not apply local aliases after a quoted pipe", () => {
      expect(substituteAliases('echo "a | g b"')).toEqual('echo "a | g b"');
    });

    it("Should keep quoted arguments in an alias value whole", () => {
      parseAliasDeclaration(`q="grep 'a | g'"`);
      expect(substituteAliases("ls | q")).toEqual("ls | grep 'a | g'");
    });

    it("Should not expand an alias twice when another alias's value contains it after a pipe", () => {
      parseAliasDeclaration('c="cat | ls"');
      parseAliasDeclaration('ls="ls -l"');
      expect(substituteAliases("c")).toEqual("cat | ls -l");
      expect(substituteAliases("echo x | c")).toEqual("echo x | cat | ls -l");
    });
  });
});
