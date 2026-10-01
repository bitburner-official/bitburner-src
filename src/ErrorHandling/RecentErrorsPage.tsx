import React, { useEffect } from "react";
import { type ErrorRecord, ErrorState } from "./ErrorState";
import { useRerender } from "../ui/React/hooks";
import { Box, Table, TableCell, TableRow, Typography, Tooltip } from "@mui/material";

const cellText = {
  verticalAlign: "top",
  padding: "4px",
  textAlign: "left",
};

const xsmall = {
  maxWidth: "110px",
  fontSize: "14px",
  lineHeight: 1.2,
};

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
        <Table sx={{ width: "100%", maxWidth: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <TableCell component="th" sx={cellText}>
                Count
              </TableCell>
              <TableCell component="th" sx={cellText}>
                Type
              </TableCell>
              <TableCell component="th" sx={cellText}>
                Message
              </TableCell>
              <TableCell component="th" sx={cellText}>
                Script
              </TableCell>
              <TableCell component="th" sx={cellText}>
                Time
              </TableCell>
            </tr>
          </thead>
          <tbody>
            {ErrorState.Errors.map((e, i) => (
              <TableRow
                key={i}
                sx={(theme) => ({
                  errorRow: {
                    borderTop: `1px solid ${theme.colors.button}`,
                    "&:hover": {
                      backgroundColor: theme.colors.button,
                    },
                  },
                })}
                onClick={() => showError(e)}
              >
                <TableCell sx={cellText}>
                  <Box component="div" sx={xsmall}>
                    {e.occurrences}
                  </Box>
                </TableCell>
                <TableCell sx={cellText}>
                  <Box component="div" sx={xsmall}>
                    {e.errorType}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box
                    component="div"
                    sx={{
                      margin: "4px",
                      color: "primary",
                      textOverflow: "ellipsis",
                      whiteSpace: "pre-wrap",
                      lineClamp: "6",
                      lineHeight: 1.1,
                      overflowX: "auto",
                      maxHeight: "200px",
                    }}
                    key={i}
                  >
                    {formatMessage(e.message)}
                  </Box>
                </TableCell>
                <TableCell sx={cellText}>
                  <Box component="div" sx={{ maxWidth: "200px" }}>
                    <Tooltip title={<>{formatMessage(e.scriptName)}</>}>
                      <div style={{ textOverflow: "ellipsis", overflow: "auto" }}>{formatMessage(e.scriptName)}</div>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell sx={cellText}>
                  <Box component="div" sx={xsmall}>
                    {e.time.toLocaleString()}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </Typography>
    </div>
  );
}
