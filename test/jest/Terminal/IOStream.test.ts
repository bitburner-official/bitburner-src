import { IOStream } from "../../../src/Terminal/StdIO/IOStream";
import { Settings } from "../../../src/Settings/Settings";
import { NetscriptPorts } from "../../../src/NetscriptPort";

function fillStream(stream: IOStream, count: number) {
  for (let i = 0; i < count; i++) stream.write(i);
}

describe("IOStream", () => {
  describe("capacity", () => {
    it("keeps every item past the player port capacity and the old 1000-item cap", () => {
      const count = Math.max(Settings.MaxPortCapacity, 1000) + 500;
      const stream = new IOStream();
      fillStream(stream, count);

      expect(stream.full()).toBe(false);
      expect(stream.tryWrite("x")).toBe(true);
      expect(stream.write("y")).toBe(null);
      for (let i = 0; i < count; i++) expect(stream.read()).toBe(i);
      expect(stream.read()).toBe("x");
      expect(stream.read()).toBe("y");
    });

    it("keeps the first item when a large stream is closed", () => {
      const stream = new IOStream();
      fillStream(stream, 1000);
      stream.close();

      expect(stream.read()).toBe(0);
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

    it("keeps returning null from read and peek after the end of input", () => {
      const stream = new IOStream();
      stream.write("a");
      stream.close();

      expect(stream.read()).toBe("a");
      expect(stream.read()).toBe(null);
      expect(stream.read()).toBe(null);
      expect(stream.peek()).toBe(null);
      expect(stream.isExhausted).toBe(true);
    });

    it("still ends with null after clear() removes the buffered end of input", () => {
      const stream = new IOStream();
      stream.write("a");
      stream.close();
      stream.clear();

      expect(stream.empty()).toBe(true);
      expect(stream.read()).toBe(null);
      expect(stream.peek()).toBe(null);
    });

    it("lets the documented read loop finish when it runs again after the end of input", async () => {
      const stream = new IOStream();
      stream.write("a");
      stream.close();

      const readAll = async () => {
        const received: unknown[] = [];
        // Fails instead of freezing if the loop never sees null
        for (let i = 0; i < 100; i++) {
          if (stream.empty()) await stream.nextWrite();
          const data = stream.read();
          if (data === null) return received;
          received.push(data);
        }
        throw new Error("read loop never reached the end of input");
      };

      expect(await readAll()).toEqual(["a"]);
      expect(await readAll()).toEqual([]);
      stream.clear();
      expect(await readAll()).toEqual([]);
    });
  });

  describe("closing from the reading side", () => {
    it("frees unread data and ends the stream", () => {
      const before = NetscriptPorts.size;
      const stream = new IOStream();
      fillStream(stream, 3);
      expect(NetscriptPorts.size).toBe(before + 1);

      stream.close(true);

      expect(NetscriptPorts.size).toBe(before);
      expect(stream.isExhausted).toBe(true);
      expect(stream.read()).toBe(null);
    });

    it("ignores writes after the reader closes it, without recreating the port", () => {
      const before = NetscriptPorts.size;
      const stream = new IOStream();
      stream.close(true);

      expect(stream.tryWrite("a")).toBe(false);
      stream.write("b");
      stream.close();
      expect(NetscriptPorts.size).toBe(before);
    });

    it("wakes a reader waiting on nextWrite", async () => {
      const stream = new IOStream();
      const waiting = stream.nextWrite();

      stream.close(true);

      await expect(waiting).resolves.toBeUndefined();
      expect(stream.isExhausted).toBe(true);
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
