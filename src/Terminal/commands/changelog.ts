import { CONSTANTS } from "../../Constants";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
export const changelog = () => (dialogBoxCreate("最新更新日志信息：\n\n" + CONSTANTS.LatestUpdate), undefined);
