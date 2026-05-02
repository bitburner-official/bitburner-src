import { checkForMessagesToSend } from "../../../src/Message/MessageHelpers";
import * as dialogBoxCreate from "../../../src/ui/React/DialogBox";
import { Player } from "@player";
import { Router } from "../../../src/ui/GameRoot";
import { AugmentationName, MessageFilename } from "@enums";
import { installAugmentations } from "../../../src/Augmentation/AugmentationHelpers";
import { initGameEnvironment, setupBasicTestingEnvironment } from "../Utilities";
import prettyFormat from "pretty-format";

initGameEnvironment();

/**
 * Router.hidingMessages returns true by default. It's only initialized after the first render of GameRoot, but it won't
 * happen in Jest tests. If Router.hidingMessages returns true, checkForMessagesToSend will return immediately, so we
 * need to override it.
 */
Router.hidingMessages = () => false;

beforeEach(() => {
  setupBasicTestingEnvironment();
});

/**
 * Ideally, we should spy on sendMessage/showMessage and check its string param (the message file's name). However,
 * they are in the same module of checkForMessagesToSend, so expect().toHaveBeenCalledTimes() does not work as expected.
 * For more information, please check https://github.com/jestjs/jest/issues/936.
 */
let spiedDialogBoxCreate: jest.Spied<typeof dialogBoxCreate.dialogBoxCreate>;

function expectLastCallShowingMessageFile(name: MessageFilename): void {
  /**
   * showMessage passes a React element containing the message file's name. "prettyFormat" (a Jest's dependency) helps
   * us convert this element to a string that can be checked by toContain.
   */
  expect(prettyFormat(spiedDialogBoxCreate.mock.lastCall?.[0])).toContain(name);
}

describe("MessageHelpers tests", () => {
  beforeEach(() => {
    spiedDialogBoxCreate = jest.spyOn(dialogBoxCreate, "dialogBoxCreate");
  });
  afterEach(() => {
    spiedDialogBoxCreate.mockRestore();
  });

  it("Should repeatedly send the Icarus message on the player's first BitNode", () => {
    /**
     * In the first BitNode, the player does not have any SF, but setupBasicTestingEnvironment adds SF4, so we need to
     * clear Player.sourceFiles.
     */
    Player.sourceFiles.clear();

    // Queue and install TRP.
    expect(Player.augmentations.length).toStrictEqual(0);
    Player.queueAugmentation(AugmentationName.TheRedPill);
    expect(spiedDialogBoxCreate).toHaveBeenCalledTimes(0);
    installAugmentations();
    expect(spiedDialogBoxCreate).toHaveBeenCalledTimes(1);
    expect(Player.augmentations[0].name).toStrictEqual(AugmentationName.TheRedPill);
    // Get tons of hacking exp to make sure Player.skills.hacking is greater than worldDaemon.requiredHackingSkill
    Player.gainHackingExp(2 ** 200);

    // Receive the icarus message.
    checkForMessagesToSend();
    expect(spiedDialogBoxCreate).toHaveBeenCalledTimes(2);
    expectLastCallShowingMessageFile(MessageFilename.RedPill);
    // Receive the icarus message again.
    checkForMessagesToSend();
    expect(spiedDialogBoxCreate).toHaveBeenCalledTimes(3);
    expectLastCallShowingMessageFile(MessageFilename.RedPill);
  });

  it("Should not repeatedly send the Icarus message after the player's first BitNode completion", () => {
    /**
     * After the player completes their first BitNode, they will have SF1.1. In theory, we don't have to do this because
     * setupBasicTestingEnvironment already adds SF4. However, we still should set SF1, just in case we change how
     * setupBasicTestingEnvironment works.
     */
    Player.sourceFiles.set(1, 1);

    // Queue and install TRP.
    expect(Player.augmentations.length).toStrictEqual(0);
    Player.queueAugmentation(AugmentationName.TheRedPill);
    expect(spiedDialogBoxCreate).toHaveBeenCalledTimes(0);
    installAugmentations();
    expect(spiedDialogBoxCreate).toHaveBeenCalledTimes(1);
    expect(Player.augmentations[0].name).toStrictEqual(AugmentationName.TheRedPill);
    // Get tons of hacking exp to make sure Player.skills.hacking is greater than worldDaemon.requiredHackingSkill
    Player.gainHackingExp(2 ** 200);

    // Receive the icarus message.
    checkForMessagesToSend();
    expect(spiedDialogBoxCreate).toHaveBeenCalledTimes(2);
    expectLastCallShowingMessageFile(MessageFilename.RedPill);
    // Receive the truthgazer message.
    checkForMessagesToSend();
    expect(spiedDialogBoxCreate).toHaveBeenCalledTimes(3);
    expectLastCallShowingMessageFile(MessageFilename.TruthGazer);

    // Not receive any more messages.
    checkForMessagesToSend();
    expect(spiedDialogBoxCreate).toHaveBeenCalledTimes(3);
    expectLastCallShowingMessageFile(MessageFilename.TruthGazer);
    checkForMessagesToSend();
    expect(spiedDialogBoxCreate).toHaveBeenCalledTimes(3);
    expectLastCallShowingMessageFile(MessageFilename.TruthGazer);
  });
});
