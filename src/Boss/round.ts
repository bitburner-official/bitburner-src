import { DAY_END, DAY_START, MEETINGS_PER_LEVEL } from "./Constants";
import { generateMeetingsDay, RoundState } from "./meetingRound";
import { getRewards, isMeetingAttended, toggleMeeting } from "./placeMeeting";

let currentRound: RoundState = newRound();

/**
 * Returns the current RoundState
 */
export function getCurrentRound(): RoundState {
  return currentRound;
}

/**
 * Attend a meeting. Throws if it was already attended.
 *
 * @param meetingID - the meeting ID
 * @returns the updated {@link RoundState}
 */
export function attendMeeting(meetingID: number): RoundState {
  if (isMeetingAttended(currentRound, meetingID)) throw new Error(`Cannot attend an already-attended meeting.`);
  currentRound = toggleMeeting(currentRound, meetingID);
  return currentRound;
}

/**
 * Removes the meeting attendance. Throw if it was not attended.
 *
 * @param meetingID - the meeting ID
 * @returns the updated {@link RoundState}
 */
export function removeMeetingAttendance(meetingID: number): RoundState {
  if (!isMeetingAttended(currentRound, meetingID))
    throw new Error(`Cannot remove attendance if meeting is not attended.`);
  currentRound = toggleMeeting(currentRound, meetingID);
  return currentRound;
}

/**
 * Recalculate the round rewards via {@link getRewards}
 *
 * @returns the updated {@link RoundState}
 */
export function recalcRewards(): RoundState {
  currentRound = getRewards(currentRound);
  return currentRound;
}

export function newRound(): RoundState {
  const roundState = generateMeetingsDay(DAY_START, DAY_END, MEETINGS_PER_LEVEL);
  return roundState;
}
