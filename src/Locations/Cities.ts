import { City } from "./City";
import { CityName, CityNames } from "../Enums";

export const Cities: Record<CityName, City> = {
  [CityNames.Aevum]: new City(CityNames.Aevum),
  [CityNames.Chongqing]: new City(CityNames.Chongqing),
  [CityNames.Ishima]: new City(CityNames.Ishima),
  [CityNames.NewTokyo]: new City(CityNames.NewTokyo),
  [CityNames.Sector12]: new City(CityNames.Sector12),
  [CityNames.Volhaven]: new City(CityNames.Volhaven),
};
