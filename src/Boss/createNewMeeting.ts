import { MeetingTitle } from "@nsdefs";
import { MeetingTitleEnum } from "./Enums";

/**
 * Generates a new 8-digit ID that is used to reference the meetings
 *
 * @returns an 8-digit ID
 */
export function generateMeetingID(): number {
  return Math.floor(10000000 + Math.random() * 90000000);
}

/**
 * Generate a random title from the predefined set
 *
 * @returns a random title
 */
export function generateRandomTitle(): MeetingTitle {
  return Object.values(MeetingTitleEnum)[Math.floor(Math.random() * Object.values(MeetingTitleEnum).length)];
}
