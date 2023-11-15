import React, { useContext } from "react";
import { CharityORG } from "../CharityORG";

export const Context = {
  CharityORG: React.createContext<CharityORG>({} as CharityORG),
};

export const useCharityORG = (): CharityORG => useContext(Context.CharityORG);
