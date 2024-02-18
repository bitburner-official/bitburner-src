import { clampNumber } from "../../utils/helpers/clampNumber";

/**
 * Given an experience amount and stat multiplier, calculates the
 * stat level. Stat-agnostic (same formula for every stat)
 */
export function calculateSkill(exp: number, mult = 1): number {
  const value = Math.floor(mult * (32 * Math.log(exp + 534.6) - 200));
  return clampNumber(value, 1, Number.MAX_VALUE);
}

export function calculateExp(skill: number, mult = 1): number {
  const value = Math.exp((skill / mult + 200) / 32) - 534.6;
  return clampNumber(value, 0, Number.MAX_VALUE);
}

export function calculateSkillProgress(exp: number, mult = 1): ISkillProgress {
  const currentSkill = calculateSkill(exp, mult);
  const nextSkill = currentSkill + 1;

  const baseExperience = calculateExp(currentSkill, mult);
  const nextExperience = calculateExp(nextSkill, mult);

  const normalize = (value: number): number => ((value - baseExperience) * 100) / (nextExperience - baseExperience);

  const rawProgress = nextExperience - baseExperience !== 0 ? normalize(exp) : 99.99;
  const progress = clampNumber(rawProgress, 0, 100);

  const currentExperience = clampNumber(exp - baseExperience, 0);
  const remainingExperience = clampNumber(nextExperience - exp, 0);

  return {
    currentSkill,
    nextSkill,
    baseExperience,
    experience: exp,
    nextExperience,
    currentExperience,
    remainingExperience,
    progress,
  };
}

export interface ISkillProgress {
  currentSkill: number;
  nextSkill: number;
  baseExperience: number;
  experience: number;
  nextExperience: number;
  currentExperience: number;
  remainingExperience: number;
  progress: number;
}

export function getEmptySkillProgress(): ISkillProgress {
  return {
    currentSkill: 0,
    nextSkill: 0,
    baseExperience: 0,
    experience: 0,
    nextExperience: 0,
    currentExperience: 0,
    remainingExperience: 0,
    progress: 0,
  };
}
