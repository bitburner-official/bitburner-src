import type { Member } from "../types";
import type { NetscriptContext } from "../Netscript/APIWrapper";

import * as allEnums from "../Enums";
import { assertString, helpers } from "../Netscript/NetscriptHelpers";
import { getRandomInt } from "./helpers/getRandomInt";

class EnumHelper<EnumObj extends object, EnumMember extends Member<EnumObj> & string> {
  name: string; // Name, for including in error text
  defaultArgName: string; // Used as default for for validating ns arg name
  valueArray: Array<EnumMember>;
  valueSet: Set<EnumMember>; // For quick isMember typecheck
  fuzzMap: Map<string, EnumMember>; // For fuzzy lookup
  constructor(obj: EnumObj, name: string) {
    this.name = name;
    this.defaultArgName = name.charAt(0).toLowerCase() + name.slice(1);
    this.valueArray = Object.values(obj);
    this.valueSet = new Set(this.valueArray);
    this.fuzzMap = new Map(this.valueArray.map((val) => [val.toLowerCase().replace(/[ -]+/g, ""), val]));
  }
  /** Provide a boolean indication for whether a  */
  isMember(toValidate: unknown): toValidate is EnumMember {
    // Asserting that Set.has actually takes in arbitrary values, which it does.
    return (this.valueSet.has as (value: unknown) => boolean)(toValidate);
  }
  /** Take an unknown input from a player script, either return an enum member or throw */
  nsGetMember(ctx: NetscriptContext, toValidate: unknown, argName = this.defaultArgName): EnumMember {
    if (this.isMember(toValidate)) return toValidate;
    // assertString is just called so if the user didn't even pass in a string, they get a different error message
    assertString(ctx, argName, toValidate);
    // Don't display all possibilities for large enums
    let allowableValues = `Allowable values: ${this.valueArray.map((val) => `"${val}"`).join(", ")}`;
    if (this.valueArray.length > 10) {
      console.warn(
        `Provided value ${toValidate} was not a valid option for enum type ${this.name}.\n${allowableValues}`,
      );
      allowableValues = `See the developer console for allowable values.`;
    }
    throw helpers.makeRuntimeErrorMsg(
      ctx,
      `Argument ${argName} should be a ${this.name} enum member.\nProvided value: "${toValidate}".\n${allowableValues}`,
    );
  }
  /** Provides case insensitivty and ignores spaces and dashes, and can always match the input */
  fuzzyGetMember(input: string): EnumMember | undefined;
  fuzzyGetMember(input: string, alwaysMatch: true): EnumMember;
  fuzzyGetMember(input: string, alwaysMatch = false) {
    const matchedValue = this.fuzzMap.get(input.toLowerCase().replace(/[ -]+/g, ""));
    if (matchedValue) {
      return matchedValue;
    }
    return alwaysMatch ? this.valueArray[0] : undefined;
  }
  /** Provide a case sensitive match, or undefined if */
  getMember(input: unknown): EnumMember | undefined {
    return this.isMember(input) ? input : undefined;
  }
  // Get a random enum member
  random() {
    const index = getRandomInt(0, this.valueArray.length - 1);
    return this.valueArray[index];
  }
}

// Creating and populating the enum helpers map

type EnumName = keyof typeof allEnums;
const enumHelpers = new Map();
// Ensure all enums get helpers assigned to them.
Object.entries(allEnums).forEach(([enumName, enumObj]) => {
  enumHelpers.set(enumName, new EnumHelper(enumObj, enumName));
});

// This function is just adding types to enumHelpers.get, and is all that gets exposed for use in other files.
export const getEnumHelper: <Name extends EnumName, Enum extends typeof allEnums[Name]>(
  name: Name,
) => EnumHelper<Enum, Member<Enum>> = enumHelpers.get.bind(enumHelpers);

export const isMember = <Name extends EnumName, Enum extends typeof allEnums[Name]>(
  name: Name,
  value: unknown,
): value is Member<Enum> => getEnumHelper(name).isMember(value);
