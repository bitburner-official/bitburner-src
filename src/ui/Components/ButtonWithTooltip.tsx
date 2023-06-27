import React from "react";
import Tooltip, { TooltipProps } from "@mui/material/Tooltip";
import Button, { ButtonProps } from "@mui/material/Button";

interface ButtonWithTooltipProps {
  /** "" if the button is not disabled. If this is truthy, the button is disabled and this tooltip is displayed. */
  disabledTooltip?: TooltipProps["title"];
  /** Text to display if button is enabled (if disabledTooltip is not provided or is "") */
  normalTooltip?: TooltipProps["title"];
  /** The onClick function */
  onClick: ButtonProps["onClick"];
  /** Button props other than "disabled" */
  buttonProps?: Omit<ButtonProps, "children" | "disabled" | "onClick">;
  /** Tooltip props other than "title" */
  tooltipProps?: Omit<TooltipProps, "children" | "title">;
  children: ButtonProps["children"];
}

/** Displays a tooltip on a button when the button is disabled, to explain why it is disabled */
export function ButtonWithTooltip({
  disabledTooltip,
  normalTooltip,
  onClick,
  buttonProps,
  tooltipProps,
  children,
}: ButtonWithTooltipProps) {
  buttonProps ??= {};
  tooltipProps ??= {};
  const tooltipText = (disabledTooltip || normalTooltip) ?? "";
  const disabled = !!disabledTooltip;
  return (
    <Tooltip {...tooltipProps} title={tooltipText}>
      <span>
        <Button {...buttonProps} disabled={disabled} onClick={onClick}>
          {children}
        </Button>
      </span>
    </Tooltip>
  );
}
