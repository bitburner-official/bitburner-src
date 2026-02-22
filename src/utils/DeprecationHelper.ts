import { Terminal } from "../Terminal";
import { getTerminalStdIO } from "../Terminal/StdIO/RedirectIO";

const deprecatedWarningsGiven = new Set();
export function setDeprecatedProperties(
  obj: object,
  properties: Record<string, { identifier: string; message: string; value: unknown }>,
) {
  for (const [name, info] of Object.entries(properties)) {
    Object.defineProperty(obj, name, {
      get: () => {
        deprecationWarning(info.identifier, info.message);
        return info.value;
      },
      set: (value: unknown) => (info.value = value),
      enumerable: true,
    });
  }
}
export function deprecationWarning(identifier: string, message: string) {
  if (!deprecatedWarningsGiven.has(identifier)) {
    deprecatedWarningsGiven.add(identifier);
    const stdio = getTerminalStdIO();
    Terminal.warn(`Accessed deprecated function or property: ${identifier}`, stdio);
    Terminal.warn(`This is no longer supported usage and will be removed in a later version.`, stdio);
    Terminal.warn(message, stdio);
    Terminal.info(`This message can also appear for object properties when the object's values are iterated.`, stdio);
    Terminal.info(`This message will only be shown once per game session for each deprecated item accessed.`, stdio);
  }
}
