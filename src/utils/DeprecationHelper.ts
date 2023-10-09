import { Terminal } from "../Terminal";

const deprecatedWarningsGiven = new Set();
export function setDeprecatedProperties(
  obj: object,
  properties: Record<string, { identifier: string; message: string; value: any }>,
) {
  for (const [name, info] of Object.entries(properties)) {
    Object.defineProperty(obj, name, {
      get: () => {
        deprecationWarning(info.identifier, info.message);
        return info.value;
      },
      set: (value: any) => (info.value = value),
      enumerable: true,
    });
  }
}
export function deprecationWarning(identifier: string, message: string) {
  if (!deprecatedWarningsGiven.has(identifier)) {
    deprecatedWarningsGiven.add(identifier);
    Terminal.warn(`Accessed deprecated function or property: ${identifier}`);
    Terminal.warn(`This is no longer supported usage and will be removed in a later version.`);
    Terminal.warn(message);
    Terminal.info(`This message can also appear for object properties when the object's values are iterated.`);
    Terminal.info(`This message will only be shown once per game session for each deprecated item accessed.`);
  }
}
