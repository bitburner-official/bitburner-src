Implementation of all Person-type objects, including but not limited to
the "PlayerObject" and Sleeves.

Person.ts:
Person.ts serves as a foundational piece for modeling characters within the system, 
providing a structure for defining their attributes, skills, and behavior.

A Person contains the following main attibutes: 
-hp or health points
-skills which contains a skill level for all skill types
-exp which contains the experience level in all skill types
-mults which contains multipliers that represent the effect of each skill on the actions of that person
-queuedAugmentations which represents the augmentations queued for installation
-city which represents the current city of that person.

The Person class has the following methods defined in Person.ts:
-resetMultipliers which resets all multipliers in mults
-takeDamage which decrements damage by a specific amount
-whoAmI which returns a string representing that person
-toJSON which serializes the person to a JSON object

PersonMethods.ts
A Person has the following methods:
-gain___Exp (one for each of the 7 skils) which increments that particular skill for that person
-regenerateHp which regenerates a specific amount of hp
-queryStatFromString given a string such as str or strength, returns the value of that skill in this person object
-gainStats increments ALL stats' experience level by a given amount
-updateSkillLevels updates all skill levels based on experience
-hasAugmentation checks if that person has a specific augment, with the ability to ignore ones that are not yet installed