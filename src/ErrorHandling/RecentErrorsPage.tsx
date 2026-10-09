import React, { useEffect } from "react";
import { type ErrorRecord, ErrorState } from "./ErrorState";
import { useRerender } from "../ui/React/hooks";
import { Box, Typography, Tooltip } from "@mui/material";

const cellTextSx = {
  verticalAlign: "top",
  padding: "4px",
  textAlign: "left",
};

const TDXSmall = ({ children }: { children: React.ReactNode }): React.ReactElement => (
  <Box component="td" sx={cellTextSx}>
    <Box component="div" sx={{ maxWidth: "110px", fontSize: "14px", lineHeight: 1.2 }}>
      {children}
    </Box>
  </Box>
);

export function RecentErrorsPage(): React.ReactElement {
  const rerender = useRerender();
  React.useEffect(() => {
    const clearSubscription = ErrorState.ErrorUpdate.subscribe(rerender);
    ErrorState.UnreadErrors = 0;
    return () => {
      clearSubscription();
      ErrorState.UnreadErrors = 0;
    };
  }, [rerender]);

  useEffect(() => {
    ErrorState.Errors.forEach((error) => {
      error.unread = false; // Mark all errors as read when the page is loaded
    });
  }, []);

  const showError = (error: ErrorRecord): void => {
    ErrorState.ErrorUpdate.emit({ ...error, force: true });
  };

  const formatMessage = (message: string): string => {
    /**
     * - Add a zero-width space after each slash to allow clean wrapping.
     * - Replace 2+ newline characters with only 1 newline character to reduce the number of empty lines.
     */
    return message.replaceAll("/", "/\u200B").replaceAll(/\n{2,}/g, "\n");
  };

  return (
    <div>
      <Typography component="div" sx={{ height: "100vh", overflowY: "auto", scrollbarWidth: "thin" }}>
        <Box component="table" sx={{ width: "100%", maxWidth: "100%", borderCollapse: "collapse" }}>
          <Box component="thead">
            <Box component="tr">
              <Box component="th" sx={cellTextSx}>
                Count
              </Box>
              <Box component="th" sx={cellTextSx}>
                Type
              </Box>
              <Box component="th" sx={cellTextSx}>
                Message
              </Box>
              <Box component="th" sx={cellTextSx}>
                Script
              </Box>
              <Box component="th" sx={cellTextSx}>
                Time
              </Box>
            </Box>
          </Box>
          <Box component="tbody">
            {ErrorState.Errors.map((e, i) => (
              <Box
                component="tr"
                key={i}
                sx={(theme) => ({
                  borderTop: `1px solid ${theme.colors.button}`,
                  "&:hover": { backgroundColor: theme.colors.button },
                  cursor: "pointer",
                })}
                onClick={() => showError(e)}
              >
                <TDXSmall>{e.occurrences}</TDXSmall>
                <TDXSmall>{e.errorType}</TDXSmall>
                <Box component="td">
                  <Box
                    component="div"
                    sx={{
                      margin: "4px",
                      color: "primary.main",
                      textOverflow: "ellipsis",
                      whiteSpace: "pre-wrap",
                      lineClamp: "6", // Needs webkit stuff, otherwise not an actual property. Also conflicts with overflowX: "auto" and maxHeight.
                      lineHeight: 1.1,
                      overflowX: "auto",
                      maxHeight: "200px",
                    }}
                    key={i}
                  >
                    {formatMessage(e.message)}
                  </Box>
                </Box>
                <Box component="td" sx={cellTextSx}>
                  <Box component="div" sx={{ maxWidth: "200px" }}>
                    <Tooltip title={<>{formatMessage(e.scriptName)}</>}>
                      <Box component="div" sx={{ textOverflow: "ellipsis", overflow: "auto" }}>
                        {formatMessage(e.scriptName)}
                      </Box>
                    </Tooltip>
                  </Box>
                </Box>
                <TDXSmall>{e.time.toLocaleString()}</TDXSmall>
              </Box>
            ))}
          </Box>
        </Box>
      </Typography>
    </div>
  );
}
