import React, {useEffect, useRef, PointerEventHandler} from "react";
import { Container, Typography } from "@mui/material";
import { DWServerComponent } from "./DWServerComponent";
import { DarkWebNetwork, populateDarkWebNetwork } from "../models/DarkWebNetwork";
import { useRerender } from "../../ui/React/hooks";

export const DW_NET_WIDTH = 2000;
export const DW_NET_HEIGHT = 4000;

export function DWNetDisplay(): React.ReactElement {

  const rerender = useRerender();
  const draggableBackground = useRef<HTMLDivElement>(null);

  useEffect(() => {
    populateDarkWebNetwork();
    rerender();
  }, [rerender]);


  const handleDragStart: PointerEventHandler<HTMLDivElement> = (pointerEvent) => {
    const target = pointerEvent.target as HTMLDivElement;
    if (target.id === "draggableBackgroundTarget") {
      draggableBackground.current?.setPointerCapture(pointerEvent.pointerId);
    }
  };

  const handleDragEnd: PointerEventHandler<HTMLDivElement> = (pointerEvent) => {
    const target = pointerEvent.target as HTMLDivElement;
    if (target.id === "draggableBackgroundTarget") {
      draggableBackground.current?.releasePointerCapture(pointerEvent.pointerId);
    }
  }

  const handleDrag: PointerEventHandler<HTMLDivElement> = (pointerEvent) => {
    if (draggableBackground.current?.hasPointerCapture(pointerEvent.pointerId)) {
      draggableBackground.current.scrollLeft -= pointerEvent.movementX;
      draggableBackground.current.scrollTop -= pointerEvent.movementY;
    }
  }


  return (
    <Container maxWidth="lg" sx={{ mx: 0 }} >
      <Typography variant={"h6"}>Dark Web</Typography>
        <div style={{width: "calc(90vw - 250px)", height: "90vh", overflow: "scroll", position: "relative", border: "solid 1px blue" }}
             ref={draggableBackground}
             onPointerDown={handleDragStart}
             onPointerUp={handleDragEnd}
             onPointerMove={handleDrag}
        >
          <div
               style={{position: "relative", width: `${DW_NET_WIDTH}px`, height: `${DW_NET_HEIGHT}px`}}
               id={"draggableBackgroundTarget"}
          >
            <canvas id="dwebCanvas" width={DW_NET_WIDTH} height={DW_NET_HEIGHT} style={{position: "absolute", zIndex: -1}}></canvas>
            {DarkWebNetwork.map((row, i) => (
                row.map((server, j) => ( server ?
                    <DWServerComponent server={server} key={`${i},${j}`}/> : ""
                ))
              )
            )}

          </div>
        </div>
    </Container>
  );
}