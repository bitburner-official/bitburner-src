export const MeetingTitleEnum = {
  DailyStandup: "Daily Standup",
  ComplianceTraining: "Compliance Training",
  CheckEmail: "Check Email",
  Brainstorm: "Group Brainstorm Session",
  NewInitiative: "Outline New Initiative",
  Interview: "Candidate Interview",
  Presentation: "Slide Presentation",
  SoftwareDemo: "Software Demo",
  Lunch: "Lunch",
  Recess: "Recess",
} as const;

export const MeetingFixedBreaks = {
  Lunch: MeetingTitleEnum.Lunch,
  Recess: MeetingTitleEnum.Recess,
} as const;
