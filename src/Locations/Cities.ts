import { City } from "./City";
import { CityNameEnum } from "@enums";
import { createEnumKeyedRecord } from "../Types/Record";

export const Cities = createEnumKeyedRecord(CityNameEnum, (name) => new City(name));
