import React, { useContext } from "react";
import { Corporation } from "../Corporation";
import { Division } from "../Division";

export const Context = {
  Corporation: React.createContext<Corporation>({} as Corporation),
  Division: React.createContext<Division>({} as Division),
};

export const useCorporation = (): Corporation => useContext(Context.Corporation);
export const useDivision = (): Division => useContext(Context.Division);
