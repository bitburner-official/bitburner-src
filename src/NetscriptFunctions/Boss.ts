import { Boss as BossAPI, Meeting } from "@nsdefs";
import { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";
import { helpers } from "../Netscript/NetscriptHelpers";
import { getEnumHelper } from "../utils/EnumHelper";
import { attendMeeting, getCurrentRound, removeMeetingAttendance } from "../Boss/round";
import { isMeetingAttended } from "../Boss/placeMeeting";

export function NetscriptBoss(): InternalAPI<BossAPI> {
  return {
    solvePuzzle: (ctx: NetscriptContext, _puzzleID, _solution): string => {
      // Lorem ipsum, no logic... yet.
    },
    changeFixedSchedule: (ctx: NetscriptContext, _fixedBreak, _timezone): void => {
      const fixedBreak = getEnumHelper("MeetingFixedBreaks").nsGetMember(ctx, _fixedBreak);
      // Change fixed schedule logic
    },
    addBreakTime: (ctx: NetscriptContext, _timezone): void => {
      // Adding break time logic
    },
    hasAccess: (ctx: NetscriptContext): boolean => {
      return helpers.checkBossAPIAccess();
    },
    nextUpdate: (ctx: NetscriptContext): number => {
      // Next update logic
      return 0;
    },
    calendar: {
      getAppointments: (ctx: NetscriptContext): Meeting[] => {
        return getCurrentRound().meetings;
      },
      rsvp: (ctx: NetscriptContext, _meetingID): void => {
        const meetingID = helpers.number(ctx, "meetingID", _meetingID);
        attendMeeting(meetingID); // catch the updated RoundState
      },
      cancelMeetingAttendance: (ctx: NetscriptContext, _meetingID): void => {
        const meetingID = helpers.number(ctx, "meetingID", _meetingID);
        removeMeetingAttendance(meetingID); // catch the updated RoundState
      },
      getRsvps: (ctx: NetscriptContext): number[] => {
        return getCurrentRound().attendance;
      },
      isMeetingAttended: (ctx: NetscriptContext, _meetingID): boolean => {
        const meetingID = helpers.number(ctx, "meetingID", _meetingID);
        return isMeetingAttended(getCurrentRound(), meetingID);
      },
    },
    agent: {
      getNumAgents: (ctx: NetscriptContext): number => {
        // Return the number of agents
        return 0;
      },
      hireAgent: (ctx: NetscriptContext): void => {
        // Hire an agent here
      },
    },
  };
}
