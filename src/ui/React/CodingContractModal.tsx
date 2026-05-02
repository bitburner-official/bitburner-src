import React, { useState, useEffect, useCallback } from "react";
import { KEY } from "../../utils/KeyboardEventKey";

import { CodingContractTypes } from "../../CodingContract/ContractTypes";
import { CopyableText } from "./CopyableText";
import { Modal } from "./Modal";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { pluralize } from "../../utils/I18nUtils";
import {
  type CodingContractEventData,
  CodingContractEventEmitter,
} from "../../CodingContract/CodingContractEventEmitter";

export function CodingContractModal(): React.ReactElement {
  const [eventData, setEventData] = useState<CodingContractEventData | null>(null);
  const [answer, setAnswer] = useState("");

  const close = useCallback(() => {
    setEventData((old) => {
      old?.onClose();
      return null;
    });
  }, []);

  useEffect(
    () =>
      CodingContractEventEmitter.subscribe((event) => {
        switch (event.type) {
          case "run":
            setEventData(event.data);
            break;
          case "close":
            close();
            break;
        }
      }),
    [close],
  );
  useEffect(() => {
    return () => {
      eventData?.onClose();
    };
  }, [eventData]);

  if (eventData === null) {
    return <></>;
  }

  function onChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setAnswer(event.target.value);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (eventData === null) {
      return;
    }
    const value = event.currentTarget.value;

    if (event.key === KEY.ENTER && value !== "") {
      event.preventDefault();
      eventData.onAttempt(answer);
      setAnswer("");
      close();
    }
  }

  const contractType = CodingContractTypes[eventData.codingContract.type];
  const description = [];
  for (const [i, value] of contractType.desc(eventData.codingContract.getData()).split("\n").entries()) {
    description.push(
      <span key={i} style={{ whiteSpace: "pre-wrap" }}>
        {value} <br />
      </span>,
    );
  }
  return (
    <Modal open={eventData !== null} onClose={close}>
      <CopyableText variant="h4" value={eventData.codingContract.type} />
      <Typography>
        You are attempting to solve a Coding Contract. You have{" "}
        {pluralize(eventData.codingContract.getMaxNumTries() - eventData.codingContract.tries, "try", "tries")}{" "}
        remaining, after which the contract will self-destruct.
      </Typography>
      <br />
      <Typography>{description}</Typography>
      <br />
      <Typography>
        If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
      </Typography>
      <br />
      <TextField
        autoFocus
        placeholder="Enter Solution here"
        value={answer}
        onChange={onChange}
        onKeyDown={onKeyDown}
        InputProps={{
          endAdornment: (
            <Button
              onClick={() => {
                eventData.onAttempt(answer);
                setAnswer("");
                close();
              }}
            >
              Solve
            </Button>
          ),
        }}
      />
    </Modal>
  );
}
