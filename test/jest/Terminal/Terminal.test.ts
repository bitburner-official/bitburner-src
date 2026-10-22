import { Terminal } from "../../../src/Terminal";
import { Output } from "../../../src/Terminal/OutputTypes";

describe("Terminal timedAction", () => {
  beforeEach(() => {
    jest.useFakeTimers(), Terminal.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("prints 100% completed progress bar when onDone is called", async () => {
    const onDone = jest.fn();
    const action = Terminal.timedAction(1, "hack", onDone);

    jest.advanceTimersByTime(1000);
    await action.finished;

    expect(onDone).toHaveBeenCalledTimes(1);

    const lastOutput = Terminal.outputHistory[Terminal.outputHistory.length - 1] as Output;
    expect(lastOutput.text).toBe(`[${"|".repeat(50)}]`);
  });

  test("prints 100% completed progress bar when onDone is called even with timer jitter", async () => {
    const onDone = jest.fn();
    const action = Terminal.timedAction(1, "hack", onDone);

    jest.spyOn(performance, "now").mockReturnValueOnce(999);
    jest.advanceTimersByTime(1000);
    await action.finished;

    const lastOutput = Terminal.outputHistory[Terminal.outputHistory.length - 1] as Output;
    expect(lastOutput.text).toBe(`[${"|".repeat(50)}]`);
  });

  test("does not run onDone and reports cancellation when cancelled", async () => {
    const onDone = jest.fn();
    const action = Terminal.timedAction(10, "hack", onDone);

    jest.advanceTimersByTime(5000);
    action.cancel();
    await expect(action.finished).rejects.toThrow();
    expect(onDone).not.toHaveBeenCalled();

    const progressBarOutput = Terminal.outputHistory[Terminal.outputHistory.length - 2] as Output;
    expect(progressBarOutput.text).toBe(`[${"|".repeat(25)}${"-".repeat(25)}]`);

    const lastOutput = Terminal.outputHistory[Terminal.outputHistory.length - 1] as Output;
    expect(lastOutput.text).toContain("Cancelled hack");
  });
});
