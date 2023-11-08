import { charityVolunteerTasksMetadata } from "./data/tasks";
import { CharityVolunteerTask } from "./CharityVolunteerTask";

export const CharityVolunteerTasks: Record<string, CharityVolunteerTask> = {};

(function () {
  charityVolunteerTasksMetadata.forEach((e) => {
    CharityVolunteerTasks[e.name] = new CharityVolunteerTask(e.name, e.desc, e.isSpending, e.params);
  });
})();
