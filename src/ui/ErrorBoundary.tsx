import React, { type ErrorInfo } from "react";

import { type CrashReport, getCrashReport } from "../utils/ErrorHelper";
import { RecoveryRoot } from "./React/RecoveryRoot";
import type { Page } from "./Router";
import { Router } from "./GameRoot";

type ErrorBoundaryProps = {
  softReset: () => void;
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  error?: Error;
  reactErrorInfo?: ErrorInfo;
  page?: Page;
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  reset(): void {
    this.setState({ hasError: false });
  }

  componentDidCatch(error: Error, reactErrorInfo: ErrorInfo): void {
    this.setState({
      reactErrorInfo: reactErrorInfo,
      page: Router.page(),
    });
    console.error(error, reactErrorInfo);
  }

  /**
   * When an error is thrown, this function is called twice and renders RecoveryRoot with two different crashReport,
   * even when there is only one error. The flow is roughly like this:
   * - The error is thrown.
   * - getDerivedStateFromError() -> Set hasError and error
   * - render() -> Render RecoveryRoot with crashReport1, which does not contain reactErrorInfo and page
   * - componentDidCatch() -> Set reactErrorInfo and page
   * - render() -> Render RecoveryRoot with crashReport2, which contains reactErrorInfo and page
   *
   * This means that if we use useEffect(()=>{}, [crashReport]) in RecoveryRoot, that hook will be called twice with 2
   * different crashReport. The second crashReport, which contains reactErrorInfo and page, is the "final" value that is
   * shown on the recovery screen.
   */
  render(): React.ReactNode {
    if (this.state.hasError) {
      let crashReport: CrashReport | undefined;
      if (this.state.error) {
        try {
          // We don't want recursive errors, so in case this fails, it's in a try catch.
          crashReport = getCrashReport(this.state.error, this.state.reactErrorInfo, this.state.page);
        } catch (ex) {
          console.error(ex);
        }
      }

      return (
        <RecoveryRoot softReset={this.props.softReset} crashReport={crashReport} resetError={() => this.reset()} />
      );
    }
    return this.props.children;
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
}
