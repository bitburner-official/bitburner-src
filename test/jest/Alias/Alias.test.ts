import { substituteAliases, parseAliasDeclaration, clearAliases } from "../../../src/Alias";
describe("substituteAliases Tests", () => {
  beforeEach(() => {
    clearAliases();
  });
  it("Should gracefully handle recursive local aliases I", () => {
    parseAliasDeclaration("recursiveAlias=b");
    parseAliasDeclaration("b=c");
    parseAliasDeclaration("c=d");
    parseAliasDeclaration("d=recursiveAlias");

    const result = substituteAliases("recursiveAlias");
    expect(result).toEqual("recursiveAlias");
  });

  it("Should gracefully handle recursive local aliases II", () => {
    parseAliasDeclaration("recursiveAlias=recursiveAlias");
    const result = substituteAliases("recursiveAlias");
    expect(result).toEqual("recursiveAlias");
  });

  it("Should gracefully handle recursive local aliases III", () => {
    parseAliasDeclaration('recursiveAlias="recursiveAlias"');
    const result = substituteAliases("recursiveAlias");
    expect(result).toEqual("recursiveAlias");
  });

  it("Should gracefully handle recursive local aliases IV", () => {
    parseAliasDeclaration('recursiveAlias="recursiveAlias -l"');
    const result = substituteAliases("recursiveAlias");
    expect(result).toEqual("recursiveAlias -l");
  });

  it("Should not substitute quoted commands I", () => {
    parseAliasDeclaration("a=b");
    const result = substituteAliases('"a"');
    expect(result).toEqual('"a"');
  });

  it("Should not substitute quoted commands II", () => {
    parseAliasDeclaration("a=b");
    const result = substituteAliases("'a'");
    expect(result).toEqual("'a'");
  });

  it.skip("Should not substitute quoted commands III", () => {
    parseAliasDeclaration("a=b");
    parseAliasDeclaration("b='c'");
    parseAliasDeclaration("c=d");
    const result = substituteAliases("a");
    expect(result).toEqual("'c'");
  });

  it.skip("Should not substitute quoted commands IV", () => {
    parseAliasDeclaration("a=b");
    parseAliasDeclaration('b="c"');
    parseAliasDeclaration("c=d");
    const result = substituteAliases("a");
    expect(result).toEqual('"c"');
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
});
