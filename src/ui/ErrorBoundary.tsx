import React, { ErrorInfo } from "react";

import { IErrorData, getErrorForDisplay } from "../utils/ErrorHelper";
import { RecoveryRoot } from "./React/RecoveryRoot";
import { Page } from "./Router";
import { Router } from "./GameRoot";

type ErrorBoundaryProps = {
  softReset: () => void;
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  error?: Error;
  errorInfo?: React.ErrorInfo;
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

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      errorInfo,
      page: Router.page(),
    });
    console.error(error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      let errorData: IErrorData | undefined;
      if (this.state.error) {
        try {
          // We don't want recursive errors, so in case this fails, it's in a try catch.
          errorData = getErrorForDisplay(this.state.error, this.state.errorInfo, this.state.page);
        } catch (ex) {
          console.error(ex);
        }
      }

      return <RecoveryRoot softReset={this.props.softReset} errorData={errorData} resetError={() => this.reset()} />;
    }
    return this.props.children;
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
}
