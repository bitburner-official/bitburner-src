import { buildEnum } from "../../utils/helpers/enum";

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
export const IndustryTypes = buildEnum<typeof industryType, IndustryType>(industryType);

const employeePositions = {
  Operations: "Operations",
  Engineer: "Engineer",
  Business: "Business",
  Management: "Management",
  RandD: "Research & Development",
  Training: "Training",
  Unassigned: "Unassigned",
} as const;

export type EmployeePosition = typeof employeePositions[keyof typeof employeePositions];
export const EmployeePositions = buildEnum<typeof employeePositions, EmployeePosition>(employeePositions);
