import { Meeting, MeetingTitle, MeetingFixedBreaks } from "@nsdefs";
import { MAX_SIMULTANEOUS_MEETINGS, RoundState } from "./meetingRound";
import { generateMeetingID, generateRandomTitle } from "./createNewMeeting";

type IStartEndTimes = Pick<Meeting, "startTime" | "finishTime">;
type Candidates = { start: number; freeSpots: number };
/** 15min increments (60/4) */
const BLOCKS_PER_HOUR = 4;
/** Possible meeting durations and their relative likelihood. */
const DURATION_WEIGHTS: { duration: number; weight: number }[] = [
  { duration: 4, weight: 1 },
  { duration: 3, weight: 2 },
  { duration: 2, weight: 4 },
  { duration: 1.5, weight: 3 },
  { duration: 1.25, weight: 6 },
  { duration: 1, weight: 5 },
  { duration: 0.75, weight: 5 },
  { duration: 0.5, weight: 6 },
  { duration: 0.25, weight: 10 },
];

/**
 * Min/max duration times for every title that is not a fixed break. In hour-decimals
 */
export const MEETING_DURATION_RANGES: Record<
  Exclude<MeetingTitle, MeetingFixedBreaks>,
  { min: number; max: number }
> = {
  "Slide Presentation": { min: 0.5, max: 2 },
  "Daily Standup": { min: 0.25, max: 0.5 },
  "Compliance Training": { min: 1, max: 2 },
  "Check Email": { min: 0.25, max: 0.5 },
  "Group Brainstorm Session": { min: 0.5, max: 1.5 },
  "Outline New Initiative": { min: 0.5, max: 1 },
  "Candidate Interview": { min: 0.5, max: 1 },
  "Software Demo": { min: 0.5, max: 1.5 },
};

/**
 * Fixed breaks durations. See {@link MEETING_DURATION_RANGES} as well.
 */
export const FIXED_BREAK_DURATIONS: Record<MeetingFixedBreaks, number> = {
  Lunch: 1,
  Recess: 0.25,
};

/**
 * The base multiplier for attendanceMults and nonAttendanceMults. Referenced as `k` param.
 */
export const BASE_MULTS_MULTIPLIER = 0.3;

/**
 * Draws a random meeting duration weighted by DURATION_WEIGHTS. Depends on the range as well.
 *
 * @param range - the range the duration is bound to
 * @returns a duration in hours (e.g. 0.25, 1.5, 3)
 */
export function drawDuration(range: { min: number; max: number }): number {
  const validDurations = DURATION_WEIGHTS.filter((w) => w.duration >= range.min && w.duration <= range.max);

  const sum = validDurations.reduce((acc, w) => acc + w.weight, 0);
  const randomPoint = Math.random() * sum;

  let cumulative = 0;
  for (const d of validDurations) {
    cumulative += d.weight;
    if (randomPoint < cumulative) {
      return d.duration;
    }
  }
  // Keep linter from complaining
  return 0;
}

/**
 * Draws a random start time, on a quarter
 *
 * @param rangeStart - the time when the range starts
 * @param rangeEnd - the time when the range ends
 * @returns the random start time
 */
export function drawStartTime(rangeStart: number, rangeEnd: number): number {
  const availableBlocks = BLOCKS_PER_HOUR * (rangeEnd - rangeStart);
  const randomBlock = Math.floor(Math.random() * availableBlocks);
  return rangeStart + randomBlock / BLOCKS_PER_HOUR;
}

/**
 * Check how much meetings overlap in a single span
 *
 * @param meetings - the meetings to check for overlap
 * @returns the maximum overlap in this span
 */
export function getMaxOverlapInSpan(meetings: IStartEndTimes[]): number {
  const events: { time: number; delta: 1 | -1 }[] = [];
  for (const meeting of meetings) {
    events.push({ time: meeting.startTime, delta: 1 }, { time: meeting.finishTime, delta: -1 });
  }
  // Sort events by time, on a tie use -1 first
  events.sort((a, b) => {
    if (a.time !== b.time) return a.time - b.time; // earlier time first
    return a.delta - b.delta; // endings before starts
  });

  let current = 0;
  let max = 0;
  for (const e of events) {
    current += e.delta;
    if (current > max) max = current;
  }
  return max;
}

/**
 * Find viable candidates to place meetings. See {@link pickRerollSpot} as well.
 *
 * @param meetings - the meetings to check for overlap
 * @param duration - duration of the meeting
 * @param rangeStart - the workday start
 * @param rangeEnd - the workday end
 * @returns all the avaliable candidates given the meeting's duration
 */
export function findRerollCandidates(
  meetings: Meeting[],
  duration: number,
  rangeStart: number,
  rangeEnd: number,
): Candidates[] {
  const availableBlocks = BLOCKS_PER_HOUR * (rangeEnd - rangeStart);
  const candidates: Candidates[] = [];
  for (let block = 0; block < availableBlocks; block++) {
    const candidateStart = rangeStart + block / BLOCKS_PER_HOUR;
    const candidateFinish = candidateStart + duration;
    const hypothetical: IStartEndTimes = { startTime: candidateStart, finishTime: candidateFinish };
    const overlap = getMaxOverlapInSpan([...meetings, hypothetical]);
    const freeSpots = MAX_SIMULTANEOUS_MEETINGS - overlap;
    if (freeSpots >= 1) candidates.push({ start: candidateStart, freeSpots });
  }
  return candidates;
}

/**
 * From the available candidates, pick one based on the remaining free zones in the span, i.e.
 * the less populated zones are much more likely to be selected. Using 2^freeSpots as formula.
 *
 * {@link findRerollCandidates} chooses the candidates avaliable, which are taken by this function and weighted.
 *
 * If candidates is an empty array, throws.
 *
 * @param candidates - the candidates to randomize
 * @returns a new meeting start time
 */
export function pickRerollSpot(candidates: Candidates[]): number {
  if (candidates.length === 0) throw new Error("Cannot pick a reroll spot with an empty candidates array.");
  const sum = candidates.reduce((acc, c) => acc + 2 ** c.freeSpots, 0);
  const randPoint = Math.random() * sum;
  let cumulative = 0;
  for (const c of candidates) {
    cumulative += 2 ** c.freeSpots;
    if (randPoint < cumulative) return c.start;
  }
  // Keep linter from complaining
  return 0;
}

/**
 * Computes the per-hour multiplier scale (k) used for attendanceMults/
 * nonAttendanceMults, derived from dayStart and dayEnd.
 *
 * The formula is k = 0.3 / (dayEnd - dayStart - 1).
 *
 * @param dayStart - the day start
 * @param dayEnd - the day end
 * @returns the multiplier scale
 */
export function computeMultiplierScale(dayStart: number, dayEnd: number): number {
  const workingHoursEstimate = dayEnd - dayStart - 1;
  return BASE_MULTS_MULTIPLIER / workingHoursEstimate;
}

/**
 * Creates a Meeting with the provided props
 *
 * @param options - Basic meeting options.
 * @param options.id - Optional meeting ID. Defaults to a random-generated ID.
 * @param options.title - Optional meeting title. Defaults to a random-generated title.
 *
 * @param times - Meeting time range.
 * @param times.startTime - Start time of the meeting.
 * @param times.finishTime - End time of the meeting.
 *
 * @param multipliers - Attendance multipliers.
 * @param multipliers.attendanceMults - Multiplier applied for attendance.
 * @param multipliers.nonAttendanceMults - Optional multiplier applied for non-attendance.
 *
 * @returns The constructed Meeting
 */

export function createMeeting(
  { id = generateMeetingID(), title = generateRandomTitle() }: { id?: number; title?: MeetingTitle },
  { startTime, finishTime }: IStartEndTimes,
  k: number,
): Meeting {
  const duration = finishTime - startTime;
  return {
    id,
    title,
    startTime,
    finishTime,
    attendanceMults: duration * k,
    nonAttendanceMults: duration * (k / 2), // 2:1 ratio
  };
}

/**
 * Checks whether two meetings' time spans overlap at all.
 *
 * @param a - first meeting
 * @param b - second meeting
 * @returns true if any instant of a's span coincides with b's span
 */
function doMeetingsOverlap(a: Meeting, b: Meeting): boolean {
  return a.finishTime > b.startTime && a.startTime < b.finishTime;
}

/**
 * Given the RoundState and a meeting ID, toggles attendance for that meeting.
 *
 * @param roundState - the current RoundState
 * @param meetingID - the meeting ID
 */
export function toggleMeeting(roundState: RoundState, meetingID: number): RoundState {
  let newAttendance: number[];
  if (isMeetingAttended(roundState, meetingID)) {
    newAttendance = roundState.attendance.filter((m) => m != meetingID);
  } else {
    const meeting = roundState.meetings.find((m) => m.id === meetingID);
    if (!meeting)
      throw new Error(
        `Invalid ID to toggle for: ${meetingID}, given the current RoundState: ${JSON.stringify(roundState)}`,
      );
    const nonConflicting = roundState.attendance.filter((id) => {
      const attendedMeeting = roundState.meetings.find((m) => m.id === id);
      if (!attendedMeeting) {
        throw new Error(
          `Attendance references a meeting id not present in this round: ${id}, ${JSON.stringify(
            roundState.attendance,
          )}`,
        );
      }
      return !doMeetingsOverlap(meeting, attendedMeeting);
    });

    newAttendance = [...nonConflicting, meetingID];
  }
  return { ...roundState, attendance: newAttendance };
}

/**
 * Returns true if the meeting is attended, false otherwise.
 *
 * @param roundState - the current {@link RoundState}
 * @param meetingID - the meeting ID
 */
export function isMeetingAttended(roundState: RoundState, meetingID: number): boolean {
  return roundState.attendance.includes(meetingID);
}

/**
 * Updates the round multiplier
 *
 * @param roundState - the current {@link RoundState}
 * @returns the updated RoundState
 */
export function getRewards(roundState: RoundState): RoundState {
  const [attendedMeetings, nonAttendedMeetings] = roundState.meetings.reduce<[Meeting[], Meeting[]]>(
    ([g, r], e) => {
      (isMeetingAttended(roundState, e.id) ? g : r).push(e);
      return [g, r];
    },
    [[], []],
  );

  const attendedSum = attendedMeetings.reduce((acc, m) => acc + m.attendanceMults, 0);
  const nonAttendedSum = nonAttendedMeetings.reduce((acc, m) => acc + (m.nonAttendanceMults ?? 0), 0);

  const mults = 1 + attendedSum - nonAttendedSum;

  return { ...roundState, mults };
}

/**
 * Somehow fixes no-unsafe-assignment
 *
 * @param title - the meeting title to check
 * @returns a narrowed type (still don't understand how)
 */
export function isFixedBreak(title: MeetingTitle): title is MeetingFixedBreaks {
  return title in FIXED_BREAK_DURATIONS;
}
