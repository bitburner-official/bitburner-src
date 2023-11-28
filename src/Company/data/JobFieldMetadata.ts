import { JobName, JobField } from "@enums";

interface IJobFieldMetadataProps {
  entryPosName: JobName;
}

export const JobFieldMetadata: Record<JobField, IJobFieldMetadataProps> = {
  [JobField.software]: {
    entryPosName: JobName.software0,
  },
  [JobField.softwareConsultant]: {
    entryPosName: JobName.softwareConsult0,
  },
  [JobField.it]: {
    entryPosName: JobName.IT0,
  },
  [JobField.securityEngineer]: {
    entryPosName: JobName.securityEng,
  },
  [JobField.networkEngineer]: {
    entryPosName: JobName.networkEng0,
  },
  [JobField.business]: {
    entryPosName: JobName.business0,
  },
  [JobField.businessConsultant]: {
    entryPosName: JobName.businessConsult0,
  },
  [JobField.security]: {
    entryPosName: JobName.security0,
  },
  [JobField.agent]: {
    entryPosName: JobName.agent0,
  },
  [JobField.employee]: {
    entryPosName: JobName.employee,
  },
  [JobField.partTimeEmployee]: {
    entryPosName: JobName.employeePT,
  },
  [JobField.waiter]: {
    entryPosName: JobName.waiter,
  },
  [JobField.partTimeWaiter]: {
    entryPosName: JobName.waiterPT,
  },
};
