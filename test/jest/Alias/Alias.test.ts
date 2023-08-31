import { substituteAliases, parseAliasDeclaration } from "../../../src/Alias";
describe("substituteAliases Tests", () => {
  it("Should gracefully handle recursive local aliases", () => {
    parseAliasDeclaration("recursiveAlias=b");
    parseAliasDeclaration("b=c");
    parseAliasDeclaration("c=d");
    parseAliasDeclaration("d=recursiveAlias");

    const result = substituteAliases("recursiveAlias");
    expect(result).toEqual("d");
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
    expect(result).toEqual("d a b c");
  });

  it("Should gracefully handle recursive mixed local and global aliases", () => {
    parseAliasDeclaration("recursiveAlias=b", true);
    parseAliasDeclaration("b=c", false);
    parseAliasDeclaration("c=d", true);
    parseAliasDeclaration("d=recursiveAlias", false);

    const result = substituteAliases("recursiveAlias");
    expect(result).toEqual("d");
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
