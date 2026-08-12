import { Meeting } from "@nsdefs";
import {
  createMeeting,
  drawDuration,
  drawStartTime,
  findRerollCandidates,
  FIXED_BREAK_DURATIONS,
  getMaxOverlapInSpan,
  pickRerollSpot,
  MEETING_DURATION_RANGES,
  isFixedBreak,
  computeMultiplierScale,
} from "./placeMeeting";
import { generateMeetingID, generateRandomTitle } from "./createNewMeeting";
/**
 * The full state of a single meeting round
 */
export interface RoundState {
  /** Every meeting generated for this round */
  meetings: Meeting[];
  /** IDs of meetings the player has selected to attend */
  attendance: number[];
  /** The time when the day starts */
  dayStart: number;
  /** The time when the day ends */
  dayEnd: number;
  /** Multipliers for this round */
  mults: number;
}

/** Hard cap: no more than this many meetings overlap at any time */
export const MAX_SIMULTANEOUS_MEETINGS = 6;

/**
 * Generates a fresh RoundState: a full day of randomly-placed meetings.
 * Hard cap enforced here.
 *
 * @param dayStart start of the day
 * @param dayEnd end of the day
 * @param meetingCount how many meetings to attempt to place this round
 * @returns a new RoundState with empty attendance
 */
export function generateMeetingsDay(dayStart: number, dayEnd: number, meetingCount: number): RoundState {
  const meetings: Meeting[] = [];
  const k = computeMultiplierScale(dayStart, dayEnd);

  for (let i = 0; i < meetingCount; i++) {
    const { id: meetingID, title: meetingTitle } = { id: generateMeetingID(), title: generateRandomTitle() };

    const duration = isFixedBreak(meetingTitle)
      ? FIXED_BREAK_DURATIONS[meetingTitle]
      : drawDuration(MEETING_DURATION_RANGES[meetingTitle]);

    const startTime = drawStartTime(dayStart, dayEnd - duration);
    meetings.push(
      createMeeting(
        { id: meetingID, title: meetingTitle },
        { startTime: startTime, finishTime: startTime + duration },
        k,
      ),
    );
    if (getMaxOverlapInSpan(meetings) <= MAX_SIMULTANEOUS_MEETINGS) continue;
    meetings.pop(); // remove the last candidate, it was invalid

    try {
      const spot = pickRerollSpot(findRerollCandidates(meetings, duration, dayStart, dayEnd - duration));
      meetings.push(
        createMeeting({ id: meetingID, title: meetingTitle }, { startTime: spot, finishTime: spot + duration }, k),
      );
    } catch {
      // candidates was an empty array
    }
  }

  return {
    meetings,
    attendance: [], // a fresh round always starts with nobody attending
    dayStart,
    dayEnd,
    mults: 1,
  };
}
