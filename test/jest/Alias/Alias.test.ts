import { substituteAliases, parseAliasDeclaration } from "../../../src/Alias";
describe("substituteAliases Tests", () => {
  it("Should gracefully handle recursive local aliases", () => {
    parseAliasDeclaration("recursiveAlias=b");
    parseAliasDeclaration("b=c");
    parseAliasDeclaration("c=d");
    parseAliasDeclaration("d=recursiveAlias");

    const result = substituteAliases("recursiveAlias");
    expect(result).toEqual("recursiveAlias");
  });

  it("Should gracefully handle recursive global aliases", () => {
    parseAliasDeclaration("recursiveAlias=b", true);
    parseAliasDeclaration("b=c", true);
    parseAliasDeclaration("c=d", true);
    parseAliasDeclaration("d=recursiveAlias", true);

    const result = substituteAliases("recursiveAlias");
    expect(result).toEqual("recursiveAlias");
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

  it("Should replace chained aliases only up to the maxDepth", () => {
    parseAliasDeclaration("a=b", true);
    parseAliasDeclaration("b=c", true);
    parseAliasDeclaration("c=d", true);
    parseAliasDeclaration("d=e", true);

    const result = substituteAliases("a", 2);
    expect(result).toEqual("c");
  });
});
