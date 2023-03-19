import type { Member } from "../../types";
import { NetscriptContext } from "../../Netscript/APIWrapper";
import { assertString, helpers } from "../../Netscript/NetscriptHelpers";
import { getRandomInt } from "./getRandomInt";

import * as baseEnums from "../../data/Enums";
import * as bladeEnums from "../../Bladeburner/data/Enums";
import * as corpEnums from "../../Corporation/data/Enums";
import * as factionEnums from "../../Faction/data/Enums";
import * as gangEnums from "../../Gang/data/Enums";
import * as hiddenEnums from "../../data/HiddenEnums";
const allEnums = {
  ...baseEnums,
  ...bladeEnums,
  ...corpEnums,
  ...factionEnums,
  ...gangEnums,
  ...hiddenEnums,
};

class EnumHelper<EnumObj extends object, EnumMember extends Member<EnumObj> & string> {
  name: string; // Name, for including in error text
  valueArray: Array<EnumMember>;
  valueSet: Set<EnumMember>; // For quick isMember typecheck
  fuzzMap: Map<string, EnumMember>; // For fuzzy lookup
  constructor(obj: EnumObj, name: string) {
    this.name = name;
    this.valueArray = Object.values(obj);
    this.valueSet = new Set(this.valueArray);
    this.fuzzMap = new Map(this.valueArray.map((val) => [val.toLowerCase().replace(/[ -]+/g, ""), val]));
  }
  // Check if a provided input is a valid enum member
  isMember(toValidate: unknown): toValidate is EnumMember {
    // Asserting that Set.has actually takes in arbitrary values, which it does.
    return (this.valueSet.has as (value: unknown) => boolean)(toValidate);
  }
  nsGetMember(ctx: NetscriptContext, argName: string, toValidate: unknown): EnumMember {
    if (this.isMember(toValidate)) return toValidate;
    assertString(ctx, argName, toValidate);
    throw helpers.makeRuntimeErrorMsg(
      ctx,
      `Argument ${argName} should be a ${
        this.name
      } enum member.\nProvided value: "${toValidate}".\nAllowable values: ${this.valueArray
        .map((val) => `"${val}"`)
        .join(", ")}`,
    );
  }
  match(input: unknown): EnumMember | undefined {
    return this.isMember(input) ? input : undefined;
  }
  // For safe-loading a potential API break name change, always provides a valid enum member.
  fuzzyMatch(input: string): EnumMember {
    return this.fuzzMap.get(input.toLowerCase().replace(/[ -]+/g, "")) ?? this.valueArray[0];
  }
  // Get a random enum member
  random() {
    const index = getRandomInt(0, this.valueArray.length - 1);
    return this.valueArray[index];
  }
}

const enumHelpers = new Map();
// Ensure all enums get helpers assigned to them.
Object.entries(allEnums).forEach(([enumName, enumObj]) => {
  enumHelpers.set(enumObj, new EnumHelper(enumObj, enumName));
});

// This function is just adding types to enumHelpers.get
export const getEnumHelper: <EnumObj extends object, EnumMember extends Member<EnumObj> & string>(
  // This type for obj ensures a compiletime error if we try getting a helper for an enum that's not part of allEnums.
  obj: EnumObj & Member<typeof allEnums>,
) => EnumHelper<EnumObj, EnumMember> = enumHelpers.get.bind(enumHelpers);
