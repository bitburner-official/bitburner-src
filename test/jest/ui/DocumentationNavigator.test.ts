import { asFilePath } from "../../../src/Paths/FilePath";
import { convertNavigatorHref, defaultNsApiPage, defaultPage } from "../../../src/ui/React/Documentation";

describe("convertNavigatorHref", () => {
  describe("Valid href", () => {
    test("Relative URL from non-NS docs pointing to markdown folder 1", () => {
      const { path, forceOpenExternally } = convertNavigatorHref("../../../../markdown/bitburner.ns.md", defaultPage);
      expect(path).toStrictEqual("nsDoc/bitburner.ns.md");
      expect(forceOpenExternally).toStrictEqual(false);
    });
    test("Relative URL from non-NS docs pointing to markdown folder 2", () => {
      const { path, forceOpenExternally } = convertNavigatorHref(
        "../../../../../markdown/bitburner.ns.flags.md",
        asFilePath("basic/scripts.md"),
      );
      expect(path).toStrictEqual("nsDoc/bitburner.ns.flags.md");
      expect(forceOpenExternally).toStrictEqual(false);
    });

    test("Relative URL from NS docs to other NS docs", () => {
      const { path, forceOpenExternally } = convertNavigatorHref("./bitburner.ns.cloud.md", defaultNsApiPage);
      expect(path).toStrictEqual("nsDoc/bitburner.ns.cloud.md");
      expect(forceOpenExternally).toStrictEqual(false);
    });

    test("Internal NS docs 1", () => {
      const { path, forceOpenExternally } = convertNavigatorHref("help/getting_started.md", defaultPage);
      expect(path).toStrictEqual("help/getting_started.md");
      expect(forceOpenExternally).toStrictEqual(false);
    });
    test("Internal NS docs 2", () => {
      const { path, forceOpenExternally } = convertNavigatorHref(
        "../basic/scripts.md",
        asFilePath("help/getting_started.md"),
      );
      expect(path).toStrictEqual("basic/scripts.md");
      expect(forceOpenExternally).toStrictEqual(false);
    });
    test("Internal NS docs 3", () => {
      const { path, forceOpenExternally } = convertNavigatorHref("./faq.md", asFilePath("help/getting_started.md"));
      expect(path).toStrictEqual("help/faq.md");
      expect(forceOpenExternally).toStrictEqual(false);
    });
    test("Internal NS docs 4", () => {
      const { path, forceOpenExternally } = convertNavigatorHref("faq.md", asFilePath("help/getting_started.md"));
      expect(path).toStrictEqual("help/faq.md");
      expect(forceOpenExternally).toStrictEqual(false);
    });

    test("HTTP/HTTPS URL", () => {
      const { path, forceOpenExternally } = convertNavigatorHref("https://bitburner-official.github.io", defaultPage);
      expect(path).toStrictEqual("https://bitburner-official.github.io");
      expect(forceOpenExternally).toStrictEqual(true);
    });
  });

  describe("Invalid href", () => {
    test("Relative URL from non-NS docs not pointing to markdown folder", () => {
      const { path, forceOpenExternally } = convertNavigatorHref("../../../markdown/bitburner.ns.md", defaultPage);
      expect(path).toStrictEqual(null);
      expect(forceOpenExternally).toStrictEqual(false);
    });

    test("Relative URL from NS docs to other NS docs", () => {
      // The path is always "./bitburner.foo.md". It never starts with "../".
      const { path, forceOpenExternally } = convertNavigatorHref("../bitburner.ns.cloud.md", defaultNsApiPage);
      // This is an invalid path. Technically, it's a valid file path, but there is no doc file with this path. The path
      // of NS docs is always prefixed with "nsDoc/".
      expect(path).toStrictEqual("bitburner.ns.cloud.md");
      expect(forceOpenExternally).toStrictEqual(false);
    });
  });
});
