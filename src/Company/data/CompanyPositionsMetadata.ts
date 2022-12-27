// Metadata used for constructing Company Positions
import { IConstructorParams } from "../CompanyPosition";
import * as posNames from "./JobTracks";

export const companyPositionMetadata: IConstructorParams[] = [
  {
    name: posNames.SoftwareCompanyPositions[0], // Software Engineering Intern
    nextPosition: posNames.SoftwareCompanyPositions[1], // Junior Software Engineer
    baseSalary: 33,
    charismaEffectiveness: 15,
    charismaExpGain: 0.02,
    hackingEffectiveness: 85,
    hackingExpGain: 0.05,
    reqdHacking: 1,
    repMultiplier: 0.9,
  },
  {
    name: posNames.SoftwareCompanyPositions[1], // Junior Software Engineer
    nextPosition: posNames.SoftwareCompanyPositions[2], // Senior Software Engineer
    baseSalary: 80,
    charismaEffectiveness: 15,
    charismaExpGain: 0.05,
    hackingEffectiveness: 85,
    hackingExpGain: 0.1,
    reqdHacking: 51,
    reqdReputation: 8e3,
    repMultiplier: 1.1,
  },
  {
    name: posNames.SoftwareCompanyPositions[2], // Senior Software Engineer
    nextPosition: posNames.SoftwareCompanyPositions[3], // Lead Software Developer
    baseSalary: 165,
    charismaEffectiveness: 20,
    charismaExpGain: 0.08,
    hackingEffectiveness: 80,
    hackingExpGain: 0.4,
    reqdCharisma: 51,
    reqdHacking: 251,
    reqdReputation: 40e3,
    repMultiplier: 1.3,
  },
  {
    name: posNames.SoftwareCompanyPositions[3], // Lead Software Developer
    nextPosition: posNames.SoftwareCompanyPositions[4], // Head of Software
    baseSalary: 500,
    charismaEffectiveness: 25,
    charismaExpGain: 0.1,
    hackingEffectiveness: 75,
    hackingExpGain: 0.8,
    reqdCharisma: 151,
    reqdHacking: 401,
    reqdReputation: 200e3,
    repMultiplier: 1.5,
  },
  {
    name: posNames.SoftwareCompanyPositions[4], // Head of Software
    nextPosition: posNames.SoftwareCompanyPositions[5], // Head of Engineering
    baseSalary: 800,
    charismaEffectiveness: 25,
    charismaExpGain: 0.5,
    hackingEffectiveness: 75,
    hackingExpGain: 1,
    reqdCharisma: 251,
    reqdHacking: 501,
    reqdReputation: 400e3,
    repMultiplier: 1.6,
  },
  {
    name: posNames.SoftwareCompanyPositions[5], // Head of Engineering
    nextPosition: posNames.SoftwareCompanyPositions[6], // Vice President of Technology
    baseSalary: 1650,
    charismaEffectiveness: 25,
    charismaExpGain: 0.5,
    hackingEffectiveness: 75,
    hackingExpGain: 1.1,
    reqdCharisma: 251,
    reqdHacking: 501,
    reqdReputation: 800e3,
    repMultiplier: 1.6,
  },
  {
    name: posNames.SoftwareCompanyPositions[6], // Vice President of Technology
    nextPosition: posNames.SoftwareCompanyPositions[7], // Chief Technology Officer
    baseSalary: 2310,
    charismaEffectiveness: 30,
    charismaExpGain: 0.6,
    hackingEffectiveness: 70,
    hackingExpGain: 1.2,
    reqdCharisma: 401,
    reqdHacking: 601,
    reqdReputation: 1.6e6,
    repMultiplier: 1.75,
  },
  {
    name: posNames.SoftwareCompanyPositions[7], // Chief Technology Officer
    nextPosition: null,
    baseSalary: 2640,
    charismaEffectiveness: 35,
    charismaExpGain: 1,
    hackingEffectiveness: 65,
    hackingExpGain: 1.5,
    reqdCharisma: 501,
    reqdHacking: 751,
    reqdReputation: 3.2e6,
    repMultiplier: 2,
  },
  {
    name: posNames.ITCompanyPositions[0], // IT Intern
    nextPosition: posNames.ITCompanyPositions[1], // IT Analyst
    baseSalary: 26,
    charismaEffectiveness: 10,
    charismaExpGain: 0.01,
    hackingEffectiveness: 90,
    hackingExpGain: 0.04,
    reqdHacking: 1,
    repMultiplier: 0.9,
  },
  {
    name: posNames.ITCompanyPositions[1], // IT Analyst
    nextPosition: posNames.ITCompanyPositions[2], // IT Manager
    baseSalary: 66,
    charismaEffectiveness: 15,
    charismaExpGain: 0.02,
    hackingEffectiveness: 85,
    hackingExpGain: 0.08,
    reqdHacking: 26,
    reqdReputation: 7e3,
    repMultiplier: 1.1,
  },
  {
    name: posNames.ITCompanyPositions[2], // IT Manager
    nextPosition: posNames.ITCompanyPositions[3], // Systems Administrator
    baseSalary: 132,
    charismaEffectiveness: 20,
    charismaExpGain: 0.1,
    hackingEffectiveness: 80,
    hackingExpGain: 0.3,
    reqdCharisma: 51,
    reqdHacking: 151,
    reqdReputation: 35e3,
    repMultiplier: 1.3,
  },
  {
    name: posNames.ITCompanyPositions[3], // Systems Administrator
    nextPosition: posNames.SoftwareCompanyPositions[5], // Head of Engineering
    baseSalary: 410,
    charismaEffectiveness: 20,
    charismaExpGain: 0.2,
    hackingEffectiveness: 80,
    hackingExpGain: 0.5,
    reqdCharisma: 76,
    reqdHacking: 251,
    reqdReputation: 175e3,
    repMultiplier: 1.4,
  },
  {
    name: posNames.SecurityEngineerCompanyPositions[0], // Security Engineer
    nextPosition: posNames.SoftwareCompanyPositions[5], // Head of Engineering
    baseSalary: 121,
    charismaEffectiveness: 15,
    charismaExpGain: 0.05,
    hackingEffectiveness: 85,
    hackingExpGain: 0.4,
    reqdCharisma: 26,
    reqdHacking: 151,
    reqdReputation: 35e3,
    repMultiplier: 1.2,
  },
  {
    name: posNames.NetworkEngineerCompanyPositions[0], // Network Engineer
    nextPosition: posNames.NetworkEngineerCompanyPositions[1], // Network Administrator
    baseSalary: 121,
    charismaEffectiveness: 15,
    charismaExpGain: 0.05,
    hackingEffectiveness: 85,
    hackingExpGain: 0.4,
    reqdCharisma: 26,
    reqdHacking: 151,
    reqdReputation: 35e3,
    repMultiplier: 1.2,
  },
  {
    name: posNames.NetworkEngineerCompanyPositions[1], // Network Administrator
    nextPosition: posNames.SoftwareCompanyPositions[5], // Head of Engineering
    baseSalary: 410,
    charismaEffectiveness: 20,
    charismaExpGain: 0.1,
    hackingEffectiveness: 80,
    hackingExpGain: 0.5,
    reqdCharisma: 76,
    reqdHacking: 251,
    reqdReputation: 175e3,
    repMultiplier: 1.3,
  },
  {
    name: posNames.BusinessCompanyPositions[0], // Business Intern
    nextPosition: posNames.BusinessCompanyPositions[1], // Business Analyst
    baseSalary: 46,
    charismaEffectiveness: 90,
    charismaExpGain: 0.08,
    hackingEffectiveness: 10,
    hackingExpGain: 0.01,
    reqdCharisma: 1,
    reqdHacking: 1,
    repMultiplier: 0.9,
  },
  {
    name: posNames.BusinessCompanyPositions[1], // Business Analyst
    nextPosition: posNames.BusinessCompanyPositions[2], // Business Manager
    baseSalary: 100,
    charismaEffectiveness: 85,
    charismaExpGain: 0.15,
    hackingEffectiveness: 15,
    hackingExpGain: 0.02,
    reqdCharisma: 51,
    reqdHacking: 6,
    reqdReputation: 8e3,
    repMultiplier: 1.1,
  },
  {
    name: posNames.BusinessCompanyPositions[2], // Business Manager
    nextPosition: posNames.BusinessCompanyPositions[3], // Operations Manager
    baseSalary: 200,
    charismaEffectiveness: 85,
    charismaExpGain: 0.3,
    hackingEffectiveness: 15,
    hackingExpGain: 0.02,
    reqdCharisma: 101,
    reqdHacking: 51,
    reqdReputation: 40e3,
    repMultiplier: 1.3,
  },
  {
    name: posNames.BusinessCompanyPositions[3], // Operations Manager
    nextPosition: posNames.BusinessCompanyPositions[4], // Chief Financial Officer
    baseSalary: 660,
    charismaEffectiveness: 85,
    charismaExpGain: 0.4,
    hackingEffectiveness: 15,
    hackingExpGain: 0.02,
    reqdCharisma: 226,
    reqdHacking: 51,
    reqdReputation: 200e3,
    repMultiplier: 1.5,
  },
  {
    name: posNames.BusinessCompanyPositions[4], // Chief Financial Officer
    nextPosition: posNames.BusinessCompanyPositions[5], // Chief Executive Officer
    baseSalary: 1950,
    charismaEffectiveness: 90,
    charismaExpGain: 1,
    hackingEffectiveness: 10,
    hackingExpGain: 0.05,
    reqdCharisma: 501,
    reqdHacking: 76,
    reqdReputation: 800e3,
    repMultiplier: 1.6,
  },
  {
    name: posNames.BusinessCompanyPositions[5], // Chief Executive Officer
    nextPosition: null,
    baseSalary: 3900,
    charismaEffectiveness: 90,
    charismaExpGain: 1.5,
    hackingEffectiveness: 10,
    hackingExpGain: 0.05,
    reqdCharisma: 751,
    reqdHacking: 101,
    reqdReputation: 3.2e6,
    repMultiplier: 1.75,
  },
  {
    name: posNames.SecurityCompanyPositions[0], // Police Officer
    nextPosition: posNames.SecurityCompanyPositions[1], // Police Chief
    baseSalary: 82,
    hackingEffectiveness: 5,
    strengthEffectiveness: 20,
    defenseEffectiveness: 20,
    dexterityEffectiveness: 20,
    agilityEffectiveness: 20,
    charismaEffectiveness: 15,
    hackingExpGain: 0.02,
    strengthExpGain: 0.08,
    defenseExpGain: 0.08,
    dexterityExpGain: 0.08,
    agilityExpGain: 0.08,
    charismaExpGain: 0.04,
    reqdHacking: 11,
    reqdStrength: 101,
    reqdDefense: 101,
    reqdDexterity: 101,
    reqdAgility: 101,
    reqdCharisma: 51,
    reqdReputation: 8e3,
    repMultiplier: 1,
  },
  {
    name: posNames.SecurityCompanyPositions[1], // Police Chief
    nextPosition: null,
    baseSalary: 460,
    hackingEffectiveness: 5,
    strengthEffectiveness: 20,
    defenseEffectiveness: 20,
    dexterityEffectiveness: 20,
    agilityEffectiveness: 20,
    charismaEffectiveness: 15,
    hackingExpGain: 0.02,
    strengthExpGain: 0.1,
    defenseExpGain: 0.1,
    dexterityExpGain: 0.1,
    agilityExpGain: 0.1,
    charismaExpGain: 0.1,
    reqdHacking: 101,
    reqdStrength: 301,
    reqdDefense: 301,
    reqdDexterity: 301,
    reqdAgility: 301,
    reqdCharisma: 151,
    reqdReputation: 36e3,
    repMultiplier: 1.25,
  },
  {
    name: posNames.SecurityCompanyPositions[2], // Security Guard
    nextPosition: posNames.SecurityCompanyPositions[3], // Security Officer
    baseSalary: 50,
    hackingEffectiveness: 5,
    strengthEffectiveness: 20,
    defenseEffectiveness: 20,
    dexterityEffectiveness: 20,
    agilityEffectiveness: 20,
    charismaEffectiveness: 15,
    hackingExpGain: 0.01,
    strengthExpGain: 0.04,
    defenseExpGain: 0.04,
    dexterityExpGain: 0.04,
    agilityExpGain: 0.04,
    charismaExpGain: 0.02,
    reqdStrength: 51,
    reqdDefense: 51,
    reqdDexterity: 51,
    reqdAgility: 51,
    reqdCharisma: 1,
    repMultiplier: 1,
  },
  {
    name: posNames.SecurityCompanyPositions[3], // Security Officer
    nextPosition: posNames.SecurityCompanyPositions[4], // Security Supervisor
    baseSalary: 195,
    hackingEffectiveness: 10,
    strengthEffectiveness: 20,
    defenseEffectiveness: 20,
    dexterityEffectiveness: 20,
    agilityEffectiveness: 20,
    charismaEffectiveness: 10,
    hackingExpGain: 0.02,
    strengthExpGain: 0.1,
    defenseExpGain: 0.1,
    dexterityExpGain: 0.1,
    agilityExpGain: 0.1,
    charismaExpGain: 0.05,
    reqdHacking: 26,
    reqdStrength: 151,
    reqdDefense: 151,
    reqdDexterity: 151,
    reqdAgility: 151,
    reqdCharisma: 51,
    reqdReputation: 8e3,
    repMultiplier: 1.1,
  },
  {
    name: posNames.SecurityCompanyPositions[4], // Security Supervisor
    nextPosition: posNames.SecurityCompanyPositions[5], // Head of Security
    baseSalary: 660,
    hackingEffectiveness: 10,
    strengthEffectiveness: 15,
    defenseEffectiveness: 15,
    dexterityEffectiveness: 15,
    agilityEffectiveness: 15,
    charismaEffectiveness: 30,
    hackingExpGain: 0.02,
    strengthExpGain: 0.12,
    defenseExpGain: 0.12,
    dexterityExpGain: 0.12,
    agilityExpGain: 0.12,
    charismaExpGain: 0.1,
    reqdHacking: 26,
    reqdStrength: 251,
    reqdDefense: 251,
    reqdDexterity: 251,
    reqdAgility: 251,
    reqdCharisma: 101,
    reqdReputation: 36e3,
    repMultiplier: 1.25,
  },
  {
    name: posNames.SecurityCompanyPositions[5], // Head of Security
    nextPosition: null,
    baseSalary: 1320,
    hackingEffectiveness: 10,
    strengthEffectiveness: 15,
    defenseEffectiveness: 15,
    dexterityEffectiveness: 15,
    agilityEffectiveness: 15,
    charismaEffectiveness: 30,
    hackingExpGain: 0.05,
    strengthExpGain: 0.15,
    defenseExpGain: 0.15,
    dexterityExpGain: 0.15,
    agilityExpGain: 0.15,
    charismaExpGain: 0.15,
    reqdHacking: 51,
    reqdStrength: 501,
    reqdDefense: 501,
    reqdDexterity: 501,
    reqdAgility: 501,
    reqdCharisma: 151,
    reqdReputation: 144e3,
    repMultiplier: 1.4,
  },
  {
    name: posNames.AgentCompanyPositions[0], // Field Agent
    nextPosition: posNames.AgentCompanyPositions[1], // Secret Agent
    baseSalary: 330,
    hackingEffectiveness: 10,
    strengthEffectiveness: 15,
    defenseEffectiveness: 15,
    dexterityEffectiveness: 20,
    agilityEffectiveness: 20,
    charismaEffectiveness: 20,
    hackingExpGain: 0.04,
    strengthExpGain: 0.08,
    defenseExpGain: 0.08,
    dexterityExpGain: 0.08,
    agilityExpGain: 0.08,
    charismaExpGain: 0.05,
    reqdHacking: 101,
    reqdStrength: 101,
    reqdDefense: 101,
    reqdDexterity: 101,
    reqdAgility: 101,
    reqdCharisma: 101,
    reqdReputation: 8e3,
    repMultiplier: 1,
  },
  {
    name: posNames.AgentCompanyPositions[1], // Secret Agent
    nextPosition: posNames.AgentCompanyPositions[2], // Special Operative
    baseSalary: 990,
    hackingEffectiveness: 15,
    strengthEffectiveness: 15,
    defenseEffectiveness: 15,
    dexterityEffectiveness: 20,
    agilityEffectiveness: 20,
    charismaEffectiveness: 15,
    hackingExpGain: 0.1,
    strengthExpGain: 0.15,
    defenseExpGain: 0.15,
    dexterityExpGain: 0.15,
    agilityExpGain: 0.15,
    charismaExpGain: 0.1,
    reqdHacking: 201,
    reqdStrength: 251,
    reqdDefense: 251,
    reqdDexterity: 251,
    reqdAgility: 251,
    reqdCharisma: 201,
    reqdReputation: 32e3,
    repMultiplier: 1.25,
  },
  {
    name: posNames.AgentCompanyPositions[2], // Special Operative
    nextPosition: null,
    baseSalary: 2000,
    hackingEffectiveness: 15,
    strengthEffectiveness: 15,
    defenseEffectiveness: 15,
    dexterityEffectiveness: 20,
    agilityEffectiveness: 20,
    charismaEffectiveness: 15,
    hackingExpGain: 0.15,
    strengthExpGain: 0.2,
    defenseExpGain: 0.2,
    dexterityExpGain: 0.2,
    agilityExpGain: 0.2,
    charismaExpGain: 0.15,
    reqdHacking: 251,
    reqdStrength: 501,
    reqdDefense: 501,
    reqdDexterity: 501,
    reqdAgility: 501,
    reqdCharisma: 251,
    reqdReputation: 162e3,
    repMultiplier: 1.5,
  },
  {
    name: posNames.MiscCompanyPositions[0], // Waiter
    nextPosition: null,
    baseSalary: 22,
    strengthEffectiveness: 10,
    dexterityEffectiveness: 10,
    agilityEffectiveness: 10,
    charismaEffectiveness: 70,
    strengthExpGain: 0.02,
    defenseExpGain: 0.02,
    dexterityExpGain: 0.02,
    agilityExpGain: 0.02,
    charismaExpGain: 0.05,
    repMultiplier: 1,
  },
  {
    name: posNames.MiscCompanyPositions[1], // Employee
    nextPosition: null,
    baseSalary: 22,
    strengthEffectiveness: 10,
    dexterityEffectiveness: 10,
    agilityEffectiveness: 10,
    charismaEffectiveness: 70,
    strengthExpGain: 0.02,
    defenseExpGain: 0.02,
    dexterityExpGain: 0.02,
    agilityExpGain: 0.02,
    charismaExpGain: 0.04,
    repMultiplier: 1,
  },
  {
    name: posNames.SoftwareConsultantCompanyPositions[0], // Software Consultant
    nextPosition: posNames.SoftwareConsultantCompanyPositions[1], // Senior Software Consultant
    baseSalary: 66,
    hackingEffectiveness: 80,
    charismaEffectiveness: 20,
    hackingExpGain: 0.08,
    charismaExpGain: 0.03,
    reqdHacking: 51,
    repMultiplier: 1,
  },
  {
    name: posNames.SoftwareConsultantCompanyPositions[1], // Senior Software Consultant
    nextPosition: null,
    baseSalary: 132,
    hackingEffectiveness: 75,
    charismaEffectiveness: 25,
    hackingExpGain: 0.25,
    charismaExpGain: 0.06,
    reqdHacking: 251,
    reqdCharisma: 51,
    repMultiplier: 1.2,
  },
  {
    name: posNames.BusinessConsultantCompanyPositions[0], // Business Consultant
    nextPosition: posNames.BusinessConsultantCompanyPositions[1], // Senior Business Consultant
    baseSalary: 66,
    hackingEffectiveness: 20,
    charismaEffectiveness: 80,
    hackingExpGain: 0.015,
    charismaExpGain: 0.15,
    reqdHacking: 6,
    reqdCharisma: 51,
    repMultiplier: 1,
  },
  {
    name: posNames.BusinessConsultantCompanyPositions[1], // Senior Business Consultant
    nextPosition: null,
    baseSalary: 525,
    hackingEffectiveness: 15,
    charismaEffectiveness: 85,
    hackingExpGain: 0.015,
    charismaExpGain: 0.3,
    reqdHacking: 51,
    reqdCharisma: 226,
    repMultiplier: 1.2,
  },
  {
    name: posNames.PartTimeCompanyPositions[0], // Part-time waiter
    nextPosition: null,
    baseSalary: 20,
    strengthEffectiveness: 10,
    dexterityEffectiveness: 10,
    agilityEffectiveness: 10,
    charismaEffectiveness: 70,
    strengthExpGain: 0.0075,
    defenseExpGain: 0.0075,
    dexterityExpGain: 0.0075,
    agilityExpGain: 0.0075,
    charismaExpGain: 0.04,
    repMultiplier: 1,
  },
  {
    name: posNames.PartTimeCompanyPositions[1], // Part-time employee
    nextPosition: null,
    baseSalary: 20,
    strengthEffectiveness: 10,
    dexterityEffectiveness: 10,
    agilityEffectiveness: 10,
    charismaEffectiveness: 70,
    strengthExpGain: 0.0075,
    defenseExpGain: 0.0075,
    dexterityExpGain: 0.0075,
    agilityExpGain: 0.0075,
    charismaExpGain: 0.03,
    repMultiplier: 1,
  },
];
