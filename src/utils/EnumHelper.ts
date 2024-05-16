import type { Member } from "../types";
import type { NetscriptContext } from "../Netscript/APIWrapper";

import * as allEnums from "../Enums";
import { assertString } from "../Netscript/TypeAssertion";
import { errorMessage } from "../Netscript/ErrorMessages";
import { getRandomIntInclusive } from "./helpers/getRandomIntInclusive";

interface GetMemberOptions {
  /** Whether to use fuzzy matching on the input (case insensitive, ignore spaces and dashes) */
  fuzzy?: boolean;
  /** Whether to always return an enum member, even if there was no match. Will attempt fuzzy match before returning a default match. */
  alwaysMatch?: boolean;
}

class EnumHelper<EnumObj extends object, EnumMember extends Member<EnumObj> & string> {
  name: string; // Name, for including in error text
  defaultArgName: string; // Used as default for validating ns arg name
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
  nsGetMember(
    ctx: NetscriptContext,
    toValidate: unknown,
    argName = this.defaultArgName,
    options?: GetMemberOptions,
  ): EnumMember {
    const match = this.getMember(toValidate, options);
    if (match) return match;

    // No match found, create error message
    assertString(ctx, argName, toValidate);
    let allowableValues = `Allowable values: ${this.valueArray.map((val) => `"${val}"`).join(", ")}`;
    // Don't display all possibilities for large enums
    if (this.valueArray.length > 10) {
      console.warn(
        `Provided value ${toValidate} was not a valid option for enum type ${this.name}.\n${allowableValues}`,
      );
      allowableValues = `See the developer console for allowable values.`;
    }
    throw errorMessage(
      ctx,
      `Argument ${argName} should be a ${this.name} enum member.\nProvided value: "${toValidate}".\n${allowableValues}`,
    );
  }
  getMember(input: unknown, options: { alwaysMatch: true }): EnumMember;
  getMember(input: unknown, options?: GetMemberOptions): EnumMember | undefined;
  getMember(input: unknown, options?: GetMemberOptions): EnumMember | undefined {
    if (this.isMember(input)) return input;
    if (typeof input !== "string") return options?.alwaysMatch ? this.valueArray[0] : undefined;
    if (options?.fuzzy || options?.alwaysMatch) {
      const fuzzMatch = this.fuzzMap.get(input.toLowerCase().replace(/[ -]+/g, ""));
      if (fuzzMatch) return fuzzMatch;
    }
    return undefined;
  }
  // Get a random enum member
  random() {
    const index = getRandomIntInclusive(0, this.valueArray.length - 1);
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
export const getEnumHelper: <Name extends EnumName, Enum extends (typeof allEnums)[Name]>(
  name: Name,
) => EnumHelper<Enum, Member<Enum>> = enumHelpers.get.bind(enumHelpers);

export const isMember = <Name extends EnumName, Enum extends (typeof allEnums)[Name]>(
  name: Name,
  value: unknown,
): value is Member<Enum> => getEnumHelper(name).isMember(value);
