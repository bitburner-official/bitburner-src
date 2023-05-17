import React from "react";
import Typography from "@mui/material/Typography";

interface CustomBoundaryProps {
  children: React.ReactNode;
}
interface CustomBoundaryState {
  error?: Error;
}
/** Error boundary for custom content printed by the player using printRaw-like functions.
 * Error boundaries are required to be class components due to no hook equivalent to componentDidCatch. */
export class CustomBoundary extends React.Component<CustomBoundaryProps, CustomBoundaryState> {
  state: CustomBoundaryState;
  constructor(props: CustomBoundaryProps) {
    super(props);
    this.state = { error: undefined };
  }
  componentDidCatch(error: Error): void {
    this.setState({ error });
    console.warn("Error in custom react content:");
    console.error(error);
  }
  render(): React.ReactNode {
    if (this.state.error) {
      // Typography is used because there are no default page styles.
      // Span is used because it does not conflict with the DOM validation nesting (default Typography element of p is invalid at this location in dom tree)
      return <Typography component={"span"}>Error in custom react content. See console for details.</Typography>;
    }
    return <Typography component={"span"}>{this.props.children}</Typography>;
  }
}
