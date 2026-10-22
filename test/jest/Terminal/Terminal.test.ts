import { Terminal } from "../../../src/Terminal";
import { Output } from "../../../src/Terminal/OutputTypes";

describe("Terminal timedAction", () => {
  beforeEach(() => {
    jest.useFakeTimers(), Terminal.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should print 100% completed progress bar when onDone is called", async () => {
    const onDone = jest.fn();
    const action = Terminal.timedAction(1, "hack", onDone);

    jest.advanceTimersByTime(1000);
    await action.finished;

    expect(onDone).toHaveBeenCalledTimes(1);

    const lastOutput = Terminal.outputHistory[Terminal.outputHistory.length - 1] as Output;
    expect(lastOutput.text).toBe(`[${"|".repeat(50)}]`);
  });
});
