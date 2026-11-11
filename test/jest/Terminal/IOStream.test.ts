import { IOStream } from "../../../src/Terminal/StdIO/IOStream";
import { Settings } from "../../../src/Settings/Settings";

const pipeSize = 1000;

function fillStream(stream: IOStream, count: number) {
  for (let i = 0; i < count; i++) stream.write(i);
}

describe("IOStream", () => {
  describe("capacity", () => {
    it("is not full at the player port capacity", () => {
      const stream = new IOStream();
      fillStream(stream, Settings.MaxPortCapacity);

      expect(stream.full()).toBe(false);
      expect(stream.tryWrite("x")).toBe(true);
    });

    it("is full once it holds 1000 items", () => {
      const stream = new IOStream();
      fillStream(stream, pipeSize - 1);
      expect(stream.full()).toBe(false);

      stream.write(pipeSize - 1);
      expect(stream.full()).toBe(true);
    });

    it("refuses tryWrite when full, without dropping data", () => {
      const stream = new IOStream();
      fillStream(stream, pipeSize);

      expect(stream.tryWrite("x")).toBe(false);
      expect(stream.read()).toBe(0);
    });

    it("drops the oldest item when write is called while full", () => {
      const stream = new IOStream();
      fillStream(stream, pipeSize);

      expect(stream.write("x")).toBe(0);
      expect(stream.read()).toBe(1);
    });

    it("is not full before anything is written", () => {
      expect(new IOStream().full()).toBe(false);
    });
  });

  describe("closing", () => {
    it("marks the stream closed and ends it with null", () => {
      const stream = new IOStream();
      stream.write("a");
      stream.close();

      expect(stream.isClosed).toBe(true);
      expect(stream.read()).toBe("a");
      expect(stream.read()).toBe(null);
    });

    it("ignores writes after closing", () => {
      const stream = new IOStream();
      stream.close();

      expect(stream.tryWrite("a")).toBe(false);
      stream.write("b");
      expect(stream.read()).toBe(null);
      expect(stream.empty()).toBe(true);
    });
  });

  describe("internal state a script can't change", () => {
    it("does not expose its port handle", () => {
      const stream = new IOStream();

      expect(Object.keys(stream)).toEqual([]);
      expect((stream as unknown as Record<string, unknown>).handle).toBeUndefined();
    });

    it("can't be reopened by setting isClosed", () => {
      const stream = new IOStream();
      stream.close();

      expect(Reflect.set(stream, "isClosed", false)).toBe(false);
      expect(stream.isClosed).toBe(true);
      expect(stream.tryWrite("a")).toBe(false);
    });
  });
});
