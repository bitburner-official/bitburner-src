import type { GangTaskName } from "@nsdefs";
import { gangMemberTasksMetadata } from "./data/tasks";
import { GangMemberTask } from "./GangMemberTask";

// This assertion is safe because this map is populated with data from gangMemberTasksMetadata, which contains all
// GangTaskName entries. We have to use "as" because TS complains about the initialization object
// not containing all properties of GangTaskName.
export const GangMemberTasks = {} as Record<GangTaskName, GangMemberTask>;

(function () {
  gangMemberTasksMetadata.forEach((e) => {
    GangMemberTasks[e.name] = new GangMemberTask(e.name, e.desc, e.isHacking, e.isCombat, e.params);
  });
})();
