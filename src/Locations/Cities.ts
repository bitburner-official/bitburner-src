import { City } from "./City";
import { CityName } from "@enums";
import { createEnumKeyedRecord } from "../Types/Record";

export const Cities = createEnumKeyedRecord(CityName, (name) => new City(name));
