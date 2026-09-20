import React from "react";
import { SnackbarEvents } from "../../ui/React/Snackbar";
import { ToastVariant } from "@enums";
import { DWServerLogStyles } from "./dnetStyles";
import { Settings } from "../../Settings/Settings";

export const formatToMaxDigits = (value: number, maxDigits: number): string => {
  if (value === 0) return "0";
  return parseFloat(value.toFixed(maxDigits)).toString();
};

export const copyToClipboard = (text: string): void => {
  navigator.clipboard.writeText(text).catch((error) => console.error(error));
  SnackbarEvents.emit(`Copied "${text}" to clipboard`, ToastVariant.SUCCESS, 2000);
};

export const formatObjectWithColoredKeys = (obj: Record<string, unknown>, filteredKeys?: string[]) => {
  const filteredObject: Record<string, unknown> = {};
  if (filteredKeys) {
    for (const key of filteredKeys) {
      if (key in obj) {
        filteredObject[key] = obj[key];
      }
    }
  } else {
    Object.assign(filteredObject, obj);
  }
  return (
    <span style={DWServerLogStyles}>
      {Object.entries(filteredObject).map(([key, value]) => {
        return (
          <React.Fragment key={key}>
            <span style={{ color: Settings.theme.secondary }}>{key}: </span>
            {/* React does not render null, undefined, and boolean values */}
            {typeof value !== "boolean" ? value : String(value)}
            <br />
          </React.Fragment>
        );
      })}
    </span>
  );
};
