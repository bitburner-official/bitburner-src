Implementation of all Person-type objects, including but not limited to
the "PlayerObject" and Sleeves.

Person.ts:
Person.ts serves as a foundational piece for modeling characters within the system, 
providing a structure for defining their attributes, skills, and behavior.

A Person contains the following main attibutes: 
hp, skill levels, experience levels, multipliers (derived from experience / skill), queuedAugmentations (ones being installed), and current city

The Person class has the following methods defined in Person.ts:
resetMultipliers, takeDamage, whoAmI (returns string representation of person), toJSON

PersonMethods.ts
A Person has the following methods:
gain___Exp (one method for each skill), regenerateHp, queryStatsFromString, gainStats (all stats gain same amount), updateSkillLevels, hasAugmentation
