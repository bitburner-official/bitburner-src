export enum FactionWorkType {
  hacking = "hacking",
  field = "field",
  security = "security",
}

export enum UniversityClassType {
  computerScience = "Computer Science",
  dataStructures = "Data Structures",
  networks = "Networks",
  algorithms = "Algorithms",
  management = "Management",
  leadership = "Leadership",
}

//Uses skill short codes to allow easier fuzzy matching with player input
export enum GymType {
  strength = "str",
  defense = "def",
  dexterity = "dex",
  agility = "agi",
}

export type ClassType = UniversityClassType | GymType;
export const ClassType: typeof UniversityClassType & typeof GymType = { ...UniversityClassType, ...GymType };

// Can split this later
export enum JobName {
  software0 = "Software Engineering Intern",
  software1 = "Junior Software Engineer",
  software2 = "Senior Software Engineer",
  software3 = "Lead Software Developer",
  software4 = "Head of Software",
  software5 = "Head of Engineering",
  software6 = "Vice President of Technology",
  software7 = "Chief Technology Officer",
  IT0 = "IT Intern",
  IT1 = "IT Analyst",
  IT2 = "IT Manager",
  IT3 = "Systems Administrator",
  securityEng = "Security Engineer",
  networkEng0 = "Network Engineer",
  networkEng1 = "Network Administrator",
  business0 = "Business Intern",
  business1 = "Business Analyst",
  business2 = "Business Manager",
  business3 = "Operations Manager",
  business4 = "Chief Financial Officer",
  business5 = "Chief Executive Officer",
  security0 = "Security Guard",
  security1 = "Security Officer",
  security2 = "Security Supervisor",
  security3 = "Head of Security",
  agent0 = "Field Agent",
  agent1 = "Secret Agent",
  agent2 = "Special Operative",
  employee = "Employee",
  employeePT = "Part-time Employee",
  waiter = "Waiter",
  waiterPT = "Part-time Waiter",
  softwareConsult0 = "Software Consultant",
  softwareConsult1 = "Senior Software Consultant",
  businessConsult0 = "Business Consultant",
  businessConsult1 = "Senior Business Consultant",
}

export enum JobField {
  software = "Software",
  softwareConsultant = "Software Consultant",
  it = "IT",
  securityEngineer = "Security Engineer",
  networkEngineer = "Network Engineer",
  business = "Business",
  businessConsultant = "Business Consultant",
  security = "Security",
  agent = "Agent",
  employee = "Employee",
  partTimeEmployee = "Part-time Employee",
  waiter = "Waiter",
  partTimeWaiter = "Part-time Waiter",
}
