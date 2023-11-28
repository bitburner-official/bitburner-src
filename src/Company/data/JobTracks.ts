import { JobName, JobField } from "@enums";

interface IJobTrackProps {
  entryPosName: JobName;
  track: JobName[];
}

export const JobTracks: Record<JobField, IJobTrackProps> = {
  [JobField.software]: {
    entryPosName: JobName.software0,
    track: [
      JobName.software0,
      JobName.software1,
      JobName.software2,
      JobName.software3,
      JobName.software4,
      JobName.software5,
      JobName.software6,
      JobName.software7,
    ],
  },
  [JobField.softwareConsultant]: {
    entryPosName: JobName.softwareConsult0,
    track: [JobName.softwareConsult0, JobName.softwareConsult1],
  },
  [JobField.it]: {
    entryPosName: JobName.IT0,
    track: [JobName.IT0, JobName.IT1, JobName.IT2, JobName.IT3],
  },
  [JobField.securityEngineer]: {
    entryPosName: JobName.securityEng,
    track: [JobName.securityEng],
  },
  [JobField.networkEngineer]: {
    entryPosName: JobName.networkEng0,
    track: [JobName.networkEng0, JobName.networkEng1],
  },
  [JobField.business]: {
    entryPosName: JobName.business0,
    track: [
      JobName.business0,
      JobName.business1,
      JobName.business2,
      JobName.business3,
      JobName.business4,
      JobName.business5,
    ],
  },
  [JobField.businessConsultant]: {
    entryPosName: JobName.businessConsult0,
    track: [JobName.businessConsult0, JobName.businessConsult1],
  },
  [JobField.security]: {
    entryPosName: JobName.security0,
    track: [JobName.security0, JobName.security1, JobName.security2, JobName.security3],
  },
  [JobField.agent]: {
    entryPosName: JobName.agent0,
    track: [JobName.agent0, JobName.agent1, JobName.agent2],
  },
  [JobField.employee]: {
    entryPosName: JobName.employee,
    track: [JobName.employee],
  },
  [JobField.partTimeEmployee]: {
    entryPosName: JobName.employeePT,
    track: [JobName.employeePT],
  },
  [JobField.waiter]: {
    entryPosName: JobName.waiter,
    track: [JobName.waiter],
  },
  [JobField.partTimeWaiter]: {
    entryPosName: JobName.waiterPT,
    track: [JobName.waiterPT],
  },
};

export const softwareJobs = JobTracks[JobField.software].track;
export const itJobs = JobTracks[JobField.it].track;
export const netEngJobs = JobTracks[JobField.networkEngineer].track;
export const businessJobs = JobTracks[JobField.business].track;
export const securityJobs = JobTracks[JobField.security].track;
export const agentJobs = JobTracks[JobField.agent].track;
export const softwareConsultJobs = JobTracks[JobField.softwareConsultant].track;
export const businessConsultJobs = JobTracks[JobField.businessConsultant].track;

export const allTechJobs: JobName[] = [...softwareJobs, ...itJobs, ...netEngJobs, JobName.securityEng];
export const partTimeJobs: JobName[] = [JobName.employeePT, JobName.waiterPT];
