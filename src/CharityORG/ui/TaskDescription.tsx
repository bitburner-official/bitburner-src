/**
 * React Component for left side of the gang member accordion, contains the
 * description of the task that member is currently doing.
 */
import React from "react";
import { CharityVolunteerTasks } from "../CharityVolunteerTasks";
import { CharityEventTasks } from "../CharityORG";
import { CharityVolunteer } from "../CharityVolunteer";
import Typography from "@mui/material/Typography";

interface IProps {
  member: CharityVolunteer;
}

export function TaskDescription(props: IProps): React.ReactElement {
  const task = CharityVolunteerTasks[props.member.task]
    ? CharityVolunteerTasks[props.member.task]
    : CharityEventTasks[props.member.task];
  const desc = task ? task.desc : CharityVolunteerTasks.Unassigned.desc;

  return <Typography dangerouslySetInnerHTML={{ __html: desc }} />;
}
