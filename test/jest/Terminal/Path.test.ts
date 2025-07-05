import { isBasicFilePath } from "../../../src/Paths/FilePath";
import {
  getFirstDirectoryInPath,
  isAbsolutePath,
  isDirectoryPath,
  resolveDirectory,
} from "../../../src/Paths/Directory";

const validBaseDirectory = "foo/bar/";
if (!isDirectoryPath(validBaseDirectory) || !isAbsolutePath(validBaseDirectory)) {
  throw new Error("The valid base directory was actually not valid.");
}

// Actual validation is in two separate functions as above, combining them here for simplicity in tests.
function isValidDirectory(name: string) {
  return isAbsolutePath(name) && isDirectoryPath(name);
}
function isValidFilePath(name: string) {
  return isAbsolutePath(name) && isBasicFilePath(name);
}

describe("Terminal Directory Tests", function () {
  describe("resolveDirectory()", function () {
    it("Should fail when provided multiple leading slashes", function () {
      expect(resolveDirectory("///")).toBe(null);
      expect(resolveDirectory("//foo")).toBe(null);
    });
    it("should do nothing for valid directory path", function () {
      expect(resolveDirectory("")).toBe("");
      expect(resolveDirectory("foo/bar/")).toBe("foo/bar/");
    });
    it("should provide relative pathing", function () {
      // The leading slash indicates an absolute path instead of relative.
      expect(resolveDirectory("/", validBaseDirectory)).toBe("");
      expect(resolveDirectory("./", validBaseDirectory)).toBe("foo/bar/");
      expect(resolveDirectory("../", validBaseDirectory)).toBe("foo/");
      expect(resolveDirectory("../../", validBaseDirectory)).toBe("");
      expect(resolveDirectory("../../../", validBaseDirectory)).toBe(null);
      expect(resolveDirectory("baz", validBaseDirectory)).toBe("foo/bar/baz/");
      expect(resolveDirectory("baz/", validBaseDirectory)).toBe("foo/bar/baz/");
    });
  });

  describe("isBasicFilePath()", function () {
    // Actual validation occurs in two steps, validating the filepath structure and then validating that it's not a relative path
    it("should return true for valid filenames", function () {
      expect(isBasicFilePath("test.txt")).toBe(true);
      expect(isBasicFilePath("123.script")).toBe(true);
      expect(isBasicFilePath("foo123.b")).toBe(true);
      expect(isBasicFilePath("my_script.script")).toBe(true);
      expect(isBasicFilePath("my-script.script")).toBe(true);
      expect(isBasicFilePath("_foo.lit")).toBe(true);
      expect(isBasicFilePath("mult.periods.script")).toBe(true);
      expect(isBasicFilePath("mult.per-iods.again.script")).toBe(true);
      expect(isBasicFilePath("BruteSSH.exe-50%-INC")).toBe(true);
      expect(isBasicFilePath("DeepscanV1.exe-1.01%-INC")).toBe(true);
      expect(isBasicFilePath("DeepscanV2.exe-1.00%-INC")).toBe(true);
      expect(isBasicFilePath("AutoLink.exe-1.%-INC")).toBe(true);
    });

    it("should return false for invalid filenames", function () {
      expect(isBasicFilePath("foo")).toBe(false);
      expect(isBasicFilePath("my script.script")).toBe(false);
      //expect(isBasicFilePath("a^.txt")).toBe(false);
      //expect(isBasicFilePath("b#.lit")).toBe(false);
      //expect(isBasicFilePath("lib().js")).toBe(false);
      //expect(isBasicFilePath("foo.script_")).toBe(false);
      //expect(isBasicFilePath("foo._script")).toBe(false);
      //expect(isBasicFilePath("foo.hyphened-ext")).toBe(false);
      expect(isBasicFilePath("")).toBe(false);
      //expect(isBasicFilePath("AutoLink-1.%-INC.exe")).toBe(false);
      //expect(isBasicFilePath("AutoLink.exe-1.%-INC.exe")).toBe(false);
      //expect(isBasicFilePath("foo%.exe")).toBe(false);
      //expect(isBasicFilePath("-1.00%-INC")).toBe(false);
    });
  });

  describe("isDirectoryPath()", function () {
    it("should return true for valid directory names", function () {
      expect(isValidDirectory("a/")).toBe(true);
      expect(isValidDirectory("foo/")).toBe(true);
      expect(isValidDirectory("foo-dir/")).toBe(true);
      expect(isValidDirectory("foo_dir/")).toBe(true);
      expect(isValidDirectory(".a/")).toBe(true);
      expect(isValidDirectory("1/")).toBe(true);
      expect(isValidDirectory("a1/")).toBe(true);
      expect(isValidDirectory(".a1/")).toBe(true);
      expect(isValidDirectory("._foo/")).toBe(true);
      expect(isValidDirectory("_foo/")).toBe(true);
      expect(isValidDirectory("foo.dir/")).toBe(true);
      expect(isValidDirectory("foov1.0.0.1/")).toBe(true);
      expect(isValidDirectory("foov1..0..0..1/")).toBe(true);
      expect(isValidDirectory("foov1-0-0-1/")).toBe(true);
      expect(isValidDirectory("foov1-0-0-1-/")).toBe(true);
      expect(isValidDirectory("foov1--0--0--1--/")).toBe(true);
      expect(isValidDirectory("foov1_0_0_1/")).toBe(true);
      expect(isValidDirectory("foov1_0_0_1_/")).toBe(true);
      expect(isValidDirectory("foov1__0__0__1/")).toBe(true);
    });

    it("should return false for invalid directory names", function () {
      //      expect(isValidDirectory("👨‍💻/")).toBe(false);
      //      expect(isValidDirectory("dir#/")).toBe(false);
      //      expect(isValidDirectory("dir!/")).toBe(false);
      expect(isValidDirectory("dir*/")).toBe(false);
      expect(isValidDirectory("./")).toBe(false);
      expect(isValidDirectory("../")).toBe(false);
      // expect(isValidDirectory("1./")).toBe(false);
      //expect(isValidDirectory("foo./")).toBe(false);
      //expect(isValidDirectory("foov1.0.0.1./")).toBe(false);
    });
  });

  describe("isValidDirectoryPath()", function () {
    it("should return true only for the forward slash if the string has length 1", function () {
      //expect(isValidDirectory("/")).toBe(true);
      expect(isValidDirectory(" ")).toBe(false);
      expect(isValidDirectory(".")).toBe(false);
      expect(isValidDirectory("a")).toBe(false);
    });

    it("should return true for valid directory paths", function () {
      expect(isValidDirectory("a/")).toBe(true);
      expect(isValidDirectory("dir/a/")).toBe(true);
      expect(isValidDirectory("dir/foo/")).toBe(true);
      expect(isValidDirectory(".dir/foo-dir/")).toBe(true);
      expect(isValidDirectory(".dir/foo_dir/")).toBe(true);
      expect(isValidDirectory(".dir/.a/")).toBe(true);
      expect(isValidDirectory("dir1/1/")).toBe(true);
      expect(isValidDirectory("dir1/a1/")).toBe(true);
      expect(isValidDirectory("dir1/.a1/")).toBe(true);
      expect(isValidDirectory("dir_/._foo/")).toBe(true);
      expect(isValidDirectory("dir-/_foo/")).toBe(true);
    });

    it("should return false if the path has a leading slash", function () {
      expect(isValidDirectory("/a")).toBe(false);
      expect(isValidDirectory("/dir/a")).toBe(false);
      expect(isValidDirectory("/dir/foo")).toBe(false);
      expect(isValidDirectory("/.dir/foo-dir")).toBe(false);
      expect(isValidDirectory("/.dir/foo_dir")).toBe(false);
      expect(isValidDirectory("/.dir/.a")).toBe(false);
      expect(isValidDirectory("/dir1/1")).toBe(false);
      expect(isValidDirectory("/dir1/a1")).toBe(false);
      expect(isValidDirectory("/dir1/.a1")).toBe(false);
      expect(isValidDirectory("/dir_/._foo")).toBe(false);
      expect(isValidDirectory("/dir-/_foo")).toBe(false);
    });

    it("should accept dot notation", function () {
      // These are relative paths so we will forego the absolute check
      expect(isDirectoryPath("dir/./a/")).toBe(true);
      expect(isDirectoryPath("dir/../foo/")).toBe(true);
      expect(isDirectoryPath(".dir/./foo-dir/")).toBe(true);
      expect(isDirectoryPath(".dir/../foo_dir/")).toBe(true);
      expect(isDirectoryPath(".dir/./.a/")).toBe(true);
      expect(isDirectoryPath("dir1/1/./")).toBe(true);
      expect(isDirectoryPath("dir1/a1/../")).toBe(true);
      expect(isDirectoryPath("dir1/.a1/../")).toBe(true);
      expect(isDirectoryPath("dir_/._foo/./")).toBe(true);
      expect(isDirectoryPath("./dir-/_foo/")).toBe(true);
      expect(isDirectoryPath("../dir-/_foo/")).toBe(true);
    });
  });

  describe("isValidFilePath()", function () {
    it("should return false for strings that are too short", function () {
      expect(isValidFilePath("/a")).toBe(false);
      expect(isValidFilePath("a.")).toBe(false);
      expect(isValidFilePath(".a")).toBe(false);
      expect(isValidFilePath("/.")).toBe(false);
    });

    it("should return true for arguments that are just filenames", function () {
      expect(isValidFilePath("test.txt")).toBe(true);
      expect(isValidFilePath("123.script")).toBe(true);
      expect(isValidFilePath("foo123.b")).toBe(true);
      expect(isValidFilePath("my_script.script")).toBe(true);
      expect(isValidFilePath("my-script.script")).toBe(true);
      expect(isValidFilePath("_foo.lit")).toBe(true);
      expect(isValidFilePath("mult.periods.script")).toBe(true);
      expect(isValidFilePath("mult.per-iods.again.script")).toBe(true);
    });

    it("should return true for valid filepaths", function () {
      // Some of these include relative paths, will not check absoluteness
      expect(isBasicFilePath("foo/test.txt")).toBe(true);
      expect(isBasicFilePath("../123.script")).toBe(true);
      expect(isBasicFilePath("./foo123.b")).toBe(true);
      expect(isBasicFilePath("dir/my_script.script")).toBe(true);
      expect(isBasicFilePath("dir1/dir2/dir3/my-script.script")).toBe(true);
      expect(isBasicFilePath("dir1/dir2/././../_foo.lit")).toBe(true);
      expect(isBasicFilePath(".dir1/./../.dir2/mult.periods.script")).toBe(true);
      expect(isBasicFilePath("_dir/../dir2/mult.per-iods.again.script")).toBe(true);
    });

    it("should return false for strings that begin with a slash", function () {
      expect(isValidFilePath("/foo/foo.txt")).toBe(false);
      expect(isValidFilePath("/foo.txt/bar.script")).toBe(false);
      expect(isValidFilePath("/filename.ext")).toBe(false);
      expect(isValidFilePath("/_dir/test.js")).toBe(false);
    });

    it("should return false for invalid arguments", function () {
      expect(isValidFilePath(null as unknown as string)).toBe(false);
      expect(isValidFilePath(undefined as unknown as string)).toBe(false);
      expect(isValidFilePath(5 as unknown as string)).toBe(false);
      expect(isValidFilePath({} as unknown as string)).toBe(false);
    });
  });

  describe("getFirstDirectoryInPath()", function () {
    // Strings cannot be passed in directly, so we'll wrap some typechecking
    function firstDirectory(path: string): string | null | undefined {
      if (!isAbsolutePath(path)) return undefined;
      if (!isBasicFilePath(path) && !isDirectoryPath(path)) return undefined;
      return getFirstDirectoryInPath(path);
    }

    it("should return the first parent directory in a filepath", function () {
      expect(firstDirectory("dir1/foo.txt")).toBe("dir1/");
      expect(firstDirectory("dir1/dir2/dir3/dir4/foo.txt")).toBe("dir1/");
      expect(firstDirectory("_dir1/dir2/foo.js")).toBe("_dir1/");
    });

    it("should return null if there is no first parent directory", function () {
      expect(firstDirectory("")).toBe(null);
      expect(firstDirectory(" ")).toBe(undefined); //Invalid path
      expect(firstDirectory("/")).toBe(undefined); //Invalid path
      expect(firstDirectory("//")).toBe(undefined); //Invalid path
      expect(firstDirectory("foo.script")).toBe(null);
      expect(firstDirectory("/foo.txt")).toBe(undefined); //Invalid path;
    });
  });
  /*
  describe("getAllParentDirectories()", function () {
    const getAllParentDirectories = dirHelpers.getAllParentDirectories;

    it("should return all parent directories in a filepath", function () {
      expect(getAllParentDirectories("/")).toBe("/");
      expect(getAllParentDirectories("/home/var/foo.txt")).toBe("/home/var/");
      expect(getAllParentDirectories("/home/var/")).toBe("/home/var/");
      expect(getAllParentDirectories("/home/var/test/")).toBe("/home/var/test/");
    });

    it("should return an empty string if there are no parent directories", function () {
      expect(getAllParentDirectories("foo.txt")).toBe("");
    });
  });

  describe("isInRootDirectory()", function () {
    const isInRootDirectory = dirHelpers.isInRootDirectory;

    it("should return true for filepaths that refer to a file in the root directory", function () {
      expect(isInRootDirectory("a.b")).toBe(true);
      expect(isInRootDirectory("foo.txt")).toBe(true);
      expect(isInRootDirectory("/foo.txt")).toBe(true);
    });

    it("should return false for filepaths that refer to a file that's NOT in the root directory", function () {
      expect(isInRootDirectory("/dir/foo.txt")).toBe(false);
      expect(isInRootDirectory("dir/foo.txt")).toBe(false);
      expect(isInRootDirectory("/./foo.js")).toBe(false);
      expect(isInRootDirectory("../foo.js")).toBe(false);
      expect(isInRootDirectory("/dir1/dir2/dir3/foo.txt")).toBe(false);
    });

    it("should return false for invalid inputs (inputs that aren't filepaths)", function () {
      expect(isInRootDirectory(null as unknown as string)).toBe(false);
      expect(isInRootDirectory(undefined as unknown as string)).toBe(false);
      expect(isInRootDirectory("")).toBe(false);
      expect(isInRootDirectory(" ")).toBe(false);
      expect(isInRootDirectory("a")).toBe(false);
      expect(isInRootDirectory("/dir")).toBe(false);
      expect(isInRootDirectory("/dir/")).toBe(false);
      expect(isInRootDirectory("/dir/foo")).toBe(false);
    });
  });
  */
});
