import { buildObjectEnum, ListEnum } from "../../utils/helpers/enum";

const industryType = {
  Energy: "Energy",
  Utilities: "Water Utilities",
  Agriculture: "Agriculture",
  Fishing: "Fishing",
  Mining: "Mining",
  Food: "Food",
  Tobacco: "Tobacco",
  Chemical: "Chemical",
  Pharmaceutical: "Pharmaceutical",
  Computers: "Computer Hardware",
  Robotics: "Robotics",
  Software: "Software",
  Healthcare: "Healthcare",
  RealEstate: "Real Estate",
} as const;

export type IndustryType = typeof industryType[keyof typeof industryType];
export const IndustryTypes = buildObjectEnum<typeof industryType, IndustryType>(industryType);

export type EmployeePosition =
  | "Operations"
  | "Engineer"
  | "Business"
  | "Management"
  | "Research & Development"
  | "Training"
  | "Unassigned";

export const EmployeePositions = new ListEnum<EmployeePosition>([
  "Operations",
  "Engineer",
  "Business",
  "Management",
  "Research & Development",
  "Training",
  "Unassigned",
]);
