import * as React from "react";

export function trusted(f: () => void): (event: React.MouseEvent<HTMLElement>) => void {
  return function (event: React.MouseEvent<HTMLElement>): void {
    if (!event.isTrusted) return;
    f();
  };
}
