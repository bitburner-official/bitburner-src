import "i18next";
// import all namespaces (for the default language, only)
import common from "../../locales/en/common.json";
import corp from "../../locales/en/corp.json";

declare module "i18next" {
  // Extend CustomTypeOptions
  interface CustomTypeOptions {
    // custom resources type
    resources: {
      common: typeof common;
      corp: typeof corp;
    };
  }
}
