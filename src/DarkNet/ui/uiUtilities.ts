import { SnackbarEvents } from "../../ui/React/Snackbar";
import { ToastVariant } from "@enums";

export const formatToMaxDigits = (value: number, maxDigits: number): string => {
  if (value === 0) return "0";
  return parseFloat(value.toFixed(maxDigits)).toString();
};

export const copyToClipboard = (text: string): void => {
  navigator.clipboard.writeText(text).catch((error) => console.error(error));
  SnackbarEvents.emit(`Copied "${text}" to clipboard`, ToastVariant.SUCCESS, 2000);
};
