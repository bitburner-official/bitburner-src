import { checkForMessagesToSend } from "../../../src/Message/MessageHelpers";
import * as dialogBoxCreate from "../../../src/ui/React/DialogBox";
import { Player } from "@player";
import "../../../src/ui/GameRoot";
import { AugmentationName } from "@enums";
import { AddToAllServers } from "../../../src/Server/AllServers";
import { Server } from "../../../src/Server/Server";
import { installAugmentations } from "../../../src/Augmentation/AugmentationHelpers";
import { initSourceFiles } from "../../../src/SourceFile/SourceFiles";

jest.mock("../../../src/ui/GameRoot", () => ({
  Router: {
    page: () => ({}),
    toPage: () => ({}),
  },
}));

jest.mock("../../../src/ui/React/DialogBox", () => ({
  dialogBoxCreate: jest.fn(),
}));

AddToAllServers(new Server({ hostname: "home" }));

describe("MessageHelpers tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should repeatedly send the Icarus message on the player's first bitnode", () => {
    Player.queueAugmentation(AugmentationName.TheRedPill);
    installAugmentations();
    Player.gainHackingExp(2 ** 200);

    const showMessageSpy = jest.spyOn(dialogBoxCreate, "dialogBoxCreate");

    checkForMessagesToSend();
    checkForMessagesToSend();

    // Called once for installing augmentations, and once for each
    // checkForMessagesToSend() sending an Icarus message
    expect(showMessageSpy).toHaveBeenCalledTimes(3);
  });

  it("Should not repeatedly send the Icarus message after the player's first bitnode completion", () => {
    initSourceFiles();
    Player.sourceFiles.set(1, 1);
    jest.spyOn(console, "warn").mockImplementation(() => {}); // Prevent test spam
    Player.queueAugmentation(AugmentationName.TheRedPill);
    installAugmentations();
    Player.gainHackingExp(2 ** 200);

    const showMessageSpy = jest.spyOn(dialogBoxCreate, "dialogBoxCreate");

    checkForMessagesToSend();
    checkForMessagesToSend();
    checkForMessagesToSend();
    checkForMessagesToSend();

    // Called once for installing augmentations, and only once for  any number of
    // checkForMessagesToSend() ( sending an Icarus message only the first time)
    expect(showMessageSpy).toHaveBeenCalledTimes(2);
  });
});
