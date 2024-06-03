import { Button, Input, MenuItem, Select, Switch, Typography } from "@mui/material";
import React, { useMemo, useState } from "react";
import { NumberInput } from "../../ui/React/NumberInput";

type Question = {
  visual: () => JSX.Element;
  text: string;
  explanation: string;
  answer: string;
} & (
  | {
      type: "number" | "truthy" | "text";
    }
  | {
      type: "choice";
      choices: string[];
    }
);

interface IProps {
  questions: Question[];
}

export function WormQuiz({ questions }: IProps) {
  const [stage, setStage] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [guess, setGuess] = useState("");

  const currentQuestion = useMemo(() => questions[stage], [questions, stage]);
  const VisualElement = React.memo(useMemo(() => currentQuestion.visual, [currentQuestion]));

  return (
    <div>
      <VisualElement />
      {isDone && (
        <Typography>
          {guess === currentQuestion.answer ? "Correct!" : "Wrong."} {currentQuestion.explanation}
        </Typography>
      )}
      {!isDone && <Typography>{currentQuestion.text}</Typography>}
      {!isDone && currentQuestion.type === "text" && (
        <Input onChange={(event) => setGuess(event.target.value)} placeholder="ABCD" />
      )}
      {!isDone && currentQuestion.type === "number" && (
        <NumberInput onChange={(n) => setGuess(n.toString())} placeholder="1234" />
      )}
      {!isDone && currentQuestion.type === "truthy" && (
        <Switch onChange={(event) => setGuess(event.target.value ? "true" : "false")} />
      )}
      {!isDone && currentQuestion.type === "choice" && (
        <Select<string>
          onChange={(event) => setGuess(event.target.value)}
          defaultValue={currentQuestion.choices[0]}
          sx={{ mr: 1, minWidth: 200 }}
        >
          {currentQuestion.choices.map((state) => (
            <MenuItem key={state} value={state}>
              {state}
            </MenuItem>
          ))}
        </Select>
      )}
      {isDone && (
        <Button
          onClick={() => {
            const nextQuestion = questions[(stage + 1) % questions.length];
            let newDefaultGuess = "";
            if (nextQuestion.type === "choice") newDefaultGuess = nextQuestion.choices[0];
            if (nextQuestion.type === "truthy") newDefaultGuess = "false";

            setGuess(newDefaultGuess);
            setStage((current) => (current + 1) % questions.length);
            setIsDone(false);
          }}
        >
          {stage + 1 === questions.length ? "Reset" : "Continue"}
        </Button>
      )}
      {!isDone && <Button onClick={() => setIsDone(true)}>Submit</Button>}
    </div>
  );
}
