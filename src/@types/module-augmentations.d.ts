declare module "monaco-editor" {
  // Use namespace syntax to augment the existing `languages` namespace.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace languages {
    interface ILanguageExtensionPoint {
      /**
       * "loader" is not exposed in the public API.
       */
      loader: () => Promise<{
        language: {
          tokenizer: {
            root: any[];
          };
        };
      }>;
    }
  }
}

export {};
