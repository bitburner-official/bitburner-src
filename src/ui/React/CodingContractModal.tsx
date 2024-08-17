import React, { useState, useEffect } from "react";
import { KEY } from "../../utils/helpers/keyCodes";

import { CodingContract, CodingContractTypes } from "../../CodingContracts";
import { CopyableText } from "./CopyableText";
import { Modal } from "./Modal";
import { EventEmitter } from "../../utils/EventEmitter";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

interface CodingContractProps {
  c: CodingContract;
  onClose: () => void;
  onAttempt: (answer: string) => void;
}

export const CodingContractEvent = new EventEmitter<[CodingContractProps]>();

export function CodingContractModal(): React.ReactElement {
  const [contract, setContract] = useState<CodingContractProps | null>(null);
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    CodingContractEvent.subscribe((props) => setContract(props));
  });
  useEffect(() => {
    return () => {
      contract?.onClose();
    };
  }, [contract]);

  if (contract === null) return <></>;

  function onChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setAnswer(event.target.value);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (contract === null) return;
    const value = event.currentTarget.value;

    if (event.key === KEY.ENTER && value !== "") {
      event.preventDefault();
      contract.onAttempt(answer);
      setAnswer("");
      close();
    }
  }

  function close(): void {
    if (contract === null) return;
    contract.onClose();
    setContract(null);
  }

  const contractType = CodingContractTypes[contract.c.type];
  const description = [];
  for (const [i, value] of contractType.desc(contract.c.data).split("\n").entries())
    description.push(<span key={i} dangerouslySetInnerHTML={{ __html: value + "<br />" }}></span>);
  return (
    <Modal open={contract !== null} onClose={close}>
      <CopyableText variant="h4" value={contract.c.type} />
      <Typography>
        You are attempting to solve a Coding Contract. You have {contract.c.getMaxNumTries() - contract.c.tries} tries
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
                contract.onAttempt(answer);
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
