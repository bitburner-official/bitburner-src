import { GangMemberTask } from "./GangMemberTask";
import { gangMemberTasksMetadata } from "./data/tasks";

export const GangMemberTasks: Record<string, GangMemberTask> = {};

(function () {
  gangMemberTasksMetadata.forEach((e) => {
    GangMemberTasks[e.name] = new GangMemberTask(e.name, e.desc, e.isHacking, e.isCombat, e.params);
  });
})();
