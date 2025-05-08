import React from "react";
import { SnackbarEvents } from "../../ui/React/Snackbar";
import { ToastVariant } from "@enums";
import { PasswordResponse } from "../models/DnetServerData";

export const formatToMaxDigits = (value: number, maxDigits: number): string => {
  if (value === 0) return "0";
  return parseFloat((value).toFixed(maxDigits)).toString()
}

export const copyToClipboard = (text: string): void => {
  void navigator.clipboard.writeText(text);
  SnackbarEvents.emit(`Copied "${text}" to clipboard`, ToastVariant.SUCCESS, 2000);
};

export const decolorJsonProperties = (logLine: string) => {
  let result;
  try {
    result = JSON.parse(logLine) as PasswordResponse;
  } catch (e) {
    return logLine;
  }

  return (
    <>
      <span style={{ color: "grey" }}>message: </span>
      {result?.message ?? ""}
      <br />
      {result?.data ? (
        <>
          <span style={{ color: "grey" }}>data: </span>
          {result.data}
          <br />
        </>
      ) : (
        ""
      )}
      <span style={{ color: "grey" }}>passwordAttempted: </span>
      {result?.passwordAttempted ?? ""}
      <br />
      <span style={{ color: "grey" }}>status: </span>
      {result?.status ?? ""}
      <br />
    </>
  );
};
