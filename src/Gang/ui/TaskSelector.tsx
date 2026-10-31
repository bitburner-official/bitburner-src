/**
 * React Component for the middle part of the gang member accordion. Contains
 * the task selector as well as some stats.
 */
import React, { useState } from "react";
import { useGang } from "./Context";
import { TaskDescription } from "./TaskDescription";

import { Box } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";

import { GangMember } from "../GangMember";
import { GangTaskNameEnum } from "../Enums";
import type { GangTaskName } from "@nsdefs";

interface IProps {
  member: GangMember;
  onTaskChange: () => void;
}

export function TaskSelector(props: IProps): React.ReactElement {
  const gang = useGang();
  const [currentTask, setCurrentTask] = useState(props.member.task);

  const contextMember = gang.members.find((member) => member.name == props.member.name);
  if (contextMember && contextMember.task != currentTask) {
    setCurrentTask(contextMember.task);
  }

  function onChange(event: SelectChangeEvent): void {
    // This assertion is safe because all Select options have valid GangTaskName values.
    const task = event.target.value as GangTaskName;
    props.member.assignToTask(task);
    setCurrentTask(task);
    props.onTaskChange();
  }

  const tasks = gang.getAllTaskNames();

  return (
    <Box>
      <Select onChange={onChange} value={currentTask} sx={{ width: "100%" }}>
        <MenuItem key={0} value={GangTaskNameEnum.Unassigned}>
          {GangTaskNameEnum.Unassigned}
        </MenuItem>
        {tasks.map((task, i) => (
          <MenuItem key={i + 1} value={task}>
            {task}
          </MenuItem>
        ))}
      </Select>
      <TaskDescription member={props.member} />
    </Box>
  );
}
