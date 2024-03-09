import { gangMemberTasksMetadata } from "./data/tasks";
import { GangMemberTask } from "./GangMemberTask";

export const GangMemberTasks: Record<string, GangMemberTask> = {};

(function () {
  gangMemberTasksMetadata.forEach((e) => {
    GangMemberTasks[e.name] = new GangMemberTask(e.name, e.desc, e.allowHackers, e.allowEnforcers, e.params);
  });
})();
