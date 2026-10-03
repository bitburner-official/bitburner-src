import React, { useEffect } from "react";
import { type ErrorRecord, ErrorState } from "./ErrorState";
import { useRerender } from "../ui/React/hooks";
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography, Tooltip } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";

const cellTextSx = {
  verticalAlign: "top",
  padding: "4px",
  textAlign: "left",
} satisfies SxProps<Theme>;

const TableCellXSmall = styled(TableCell)({
  ...cellTextSx,
  maxWidth: "110px",
  fontSize: "14px",
  lineHeight: 1.2,
});

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
          <TableHead>
            <TableRow>
              <TableCell component="th" sx={cellTextSx}>
                Count
              </TableCell>
              <TableCell component="th" sx={cellTextSx}>
                Type
              </TableCell>
              <TableCell component="th" sx={cellTextSx}>
                Message
              </TableCell>
              <TableCell component="th" sx={cellTextSx}>
                Script
              </TableCell>
              <TableCell component="th" sx={cellTextSx}>
                Time
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ErrorState.Errors.map((e, i) => (
              <TableRow
                key={i}
                sx={(theme) => ({
                  borderTop: `1px solid ${theme.colors.button}`,
                  "&:hover": { backgroundColor: theme.colors.button },
                  cursor: "pointer",
                })}
                onClick={() => showError(e)}
              >
                <TableCellXSmall>{e.occurrences}</TableCellXSmall>
                <TableCellXSmall>{e.errorType}</TableCellXSmall>
                <TableCell>
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
                </TableCell>
                <TableCell sx={cellTextSx}>
                  <Box component="div" sx={{ maxWidth: "200px" }}>
                    <Tooltip title={<>{formatMessage(e.scriptName)}</>}>
                      <Box component="div" sx={{ textOverflow: "ellipsis", overflow: "auto" }}>
                        {formatMessage(e.scriptName)}
                      </Box>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCellXSmall>{e.time.toLocaleString()}</TableCellXSmall>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Typography>
    </div>
  );
}
