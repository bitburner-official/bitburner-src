import type { Port as IPort } from "@nsdefs";
import { InternalAPI } from "src/Netscript/APIWrapper";
import { helpers } from "../Netscript/NetscriptHelpers";

export function NetscriptPort(): InternalAPI<IPort> {
  return {
    getHandle: (ctx, _portNumber) => {
      const portHandle = helpers.portHandle(ctx, _portNumber);
      return portHandle;
    },
    isEmpty: (ctx, _portNumber) => {
      const portHandle = helpers.portHandle(ctx, _portNumber);
      return portHandle.empty();
    },
    isFull: (ctx, _portNumber) => {
      const portHandle = helpers.portHandle(ctx, _portNumber);
      return portHandle.full();
    },
    peek: (ctx, _portNumber) => {
      const portHandle = helpers.portHandle(ctx, _portNumber);
      return portHandle.peek();
    },
    read: (ctx, _portNumber) => {
      const portHandle = helpers.portHandle(ctx, _portNumber);
      return portHandle.read();
    },
    write: (ctx, _portNumber, data) => {
      const portHandle = helpers.portHandle(ctx, _portNumber);
      return portHandle.write(data);
    },
    tryWrite: (ctx, _portNumber, data) => {
      const portHandle = helpers.portHandle(ctx, _portNumber);
      return portHandle.tryWrite(data);
    },
    nextWrite: (ctx, _portNumber) => {
      const portHandle = helpers.portHandle(ctx, _portNumber);
      return portHandle.nextWrite();
    },
    clear: (ctx, _portNumber) => {
      const portHandle = helpers.portHandle(ctx, _portNumber);
      return portHandle.clear();
    },
  };
}
