import { Terminal } from "../Terminal";

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
    Terminal.warn(`访问了已弃用的函数或属性：${identifier}`);
    Terminal.warn(`此用法已不再受支持，并将在之后的版本中被移除。`);
    Terminal.warn(message);
    Terminal.info(`当遍历对象的值时，对象属性也可能出现此消息。`);
    Terminal.info(`每个被访问的弃用项在本次游戏会话中只会显示一次此消息。`);
  }
}
