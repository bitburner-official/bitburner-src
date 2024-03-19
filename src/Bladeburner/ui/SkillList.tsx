import * as React from "react";
import { SkillElem } from "./SkillElem";
import { Skills } from "../data/Skills";
import { Bladeburner } from "../Bladeburner";

interface SkillListProps {
  bladeburner: Bladeburner;
  onUpgrade: () => void;
}

export function SkillList({ bladeburner, onUpgrade }: SkillListProps): React.ReactElement {
  return (
    <>
      {Object.values(Skills).map((skill) => (
        <SkillElem key={skill.name} bladeburner={bladeburner} skill={skill} onUpgrade={onUpgrade} />
      ))}
    </>
  );
}
