import React, {useEffect} from "react";
import { Container, Typography } from "@mui/material";
import { DWServerComponent } from "./DWServerComponent";
import { DarkWebNetwork, populateDarkWebNetwork } from "../models/DarkWebNetwork";
import { useRerender } from "../../ui/React/hooks";
import { DWSpacerComponent } from "./DWSpacerComponent";

export function DWNetDisplay(): React.ReactElement {

  const rerender = useRerender();

  useEffect(() => {
    populateDarkWebNetwork();
    rerender();
  }, [rerender]);


  return (
    <Container maxWidth="lg" sx={{ mx: 0 }}>
      <Typography variant={"h6"}>Dark Web</Typography>
      <Container maxWidth="lg" sx={{ mx: 0, position: "relative" }}>
        {DarkWebNetwork.map((row, i) => (
          <Container key={i} sx={{ display: "flex", flexDirection: "row", justifyContent: "center" }} disableGutters>
            {row.map((server, j) => ( server ?
              <DWServerComponent server={server} key={`${i},${j}`} /> :
              <DWSpacerComponent key={`${i},${j}`}/>
              ))}
          </Container>
        )
        )}
      </Container>
    </Container>
  );
}