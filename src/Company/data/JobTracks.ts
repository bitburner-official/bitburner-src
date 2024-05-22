import { JobName, JobField } from "@enums";

export const JobTracks: Record<JobField, readonly JobName[]> = {
  [JobField.software]: [
    JobName.software0,
    JobName.software1,
    JobName.software2,
    JobName.software3,
    JobName.software4,
    JobName.software5,
    JobName.software6,
    JobName.software7,
  ],
  [JobField.softwareConsultant]: [JobName.softwareConsult0, JobName.softwareConsult1],
  [JobField.it]: [JobName.IT0, JobName.IT1, JobName.IT2, JobName.IT3],
  [JobField.securityEngineer]: [JobName.securityEng],
  [JobField.networkEngineer]: [JobName.networkEng0, JobName.networkEng1],
  [JobField.business]: [
    JobName.business0,
    JobName.business1,
    JobName.business2,
    JobName.business3,
    JobName.business4,
    JobName.business5,
  ],
  [JobField.businessConsultant]: [JobName.businessConsult0, JobName.businessConsult1],
  [JobField.security]: [JobName.security0, JobName.security1, JobName.security2, JobName.security3],
  [JobField.agent]: [JobName.agent0, JobName.agent1, JobName.agent2],
  [JobField.employee]: [JobName.employee],
  [JobField.partTimeEmployee]: [JobName.employeePT],
  [JobField.waiter]: [JobName.waiter],
  [JobField.partTimeWaiter]: [JobName.waiterPT],
} as const;

export const softwareJobs = JobTracks[JobField.software];
export const itJobs = JobTracks[JobField.it];
export const netEngJobs = JobTracks[JobField.networkEngineer];
export const businessJobs = JobTracks[JobField.business];
export const securityJobs = JobTracks[JobField.security];
export const agentJobs = JobTracks[JobField.agent];
export const softwareConsultJobs = JobTracks[JobField.softwareConsultant];
export const businessConsultJobs = JobTracks[JobField.businessConsultant];
