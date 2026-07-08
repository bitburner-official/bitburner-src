import { ZorkDialog } from "../../../src/Arcade/Zork/ZorkDialog";

describe("ZorkDialog", () => {
  beforeEach(() => localStorage.clear());

  it("round-trips binary save data through localStorage", () => {
    const dialog = new ZorkDialog("zork1");
    const ref = dialog.file_construct_ref("slot1", "save", "");
    expect(dialog.file_ref_exists(ref)).toBe(false);
    const bytes = [0, 1, 2, 127, 128, 255, 66];
    expect(dialog.file_write(ref, bytes, true)).toBe(true);
    expect(dialog.file_ref_exists(ref)).toBe(true);
    expect(dialog.file_read(ref, true)).toEqual(bytes);
    expect(localStorage.getItem("zork.zork1.save.slot1")).not.toBeNull();
  });

  it("keeps games separate and removes refs", () => {
    const d1 = new ZorkDialog("zork1");
    const d2 = new ZorkDialog("zork2");
    const ref = d1.file_construct_ref("slot1", "save", "");
    d1.file_write(ref, [1], true);
    expect(d2.file_ref_exists(d2.file_construct_ref("slot1", "save", ""))).toBe(false);
    d1.file_remove_ref(ref);
    expect(d1.file_ref_exists(ref)).toBe(false);
    expect(d1.file_read(ref, true)).toBeNull();
  });

  it("cleans fixed names and constructs temp refs", () => {
    const d = new ZorkDialog("zork1");
    expect(d.file_clean_fixed_name('a/b\\c:d"e', "save")).toBe("abcde");
    const temp = d.file_construct_temp_ref("data");
    expect(temp.filename.startsWith("_temp")).toBe(true);
  });
});
