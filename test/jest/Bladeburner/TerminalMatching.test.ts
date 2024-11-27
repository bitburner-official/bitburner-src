import { autoCompleteTypeShorthand, TerminalShorthands } from "../../../src/Bladeburner/utils/terminalShorthands";
import {
  BladeburnerActionType,
  BladeburnerBlackOpName,
  BladeburnerContractName,
  BladeburnerGeneralActionName,
  BladeburnerOperationName,
} from "@enums";

const ShorthandCases = (type: keyof typeof TerminalShorthands) => <string[][]>TerminalShorthands[type].map(Array);

describe("Bladeburner Actions", () => {
  const EXAMPLES = [
    [BladeburnerActionType.General, BladeburnerGeneralActionName.Diplomacy],
    [BladeburnerActionType.BlackOp, BladeburnerBlackOpName.OperationTyphoon],
    [BladeburnerActionType.Contract, BladeburnerContractName.BountyHunter],
    [BladeburnerActionType.Operation, BladeburnerOperationName.Assassination],
  ] as const;

  describe("May be described with shorthands", () => {
    describe.each(EXAMPLES)("Type: %s", (type, name) => {
      it.each(ShorthandCases(type))("%s", (shorthand) => {
        const action = autoCompleteTypeShorthand(shorthand, name);
        expect(action).toMatchObject({ type, name });
      });
    });
  });

  it("Does not match for existing action where type differs", () => {
    const action = autoCompleteTypeShorthand(BladeburnerActionType.Contract, BladeburnerOperationName.Assassination);
    expect(action).toBeNull();
  });

  it("Does not match for undocumented shorthands", () => {
    const action = autoCompleteTypeShorthand("blackoperations", BladeburnerOperationName.Assassination);
    expect(action).toBeNull();
  });
});
