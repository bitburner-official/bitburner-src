/**
 * From isTypeScript()
 *
 * https://github.com/babel/babel/blob/main/packages/babel-types/src/validators/generated/index.ts
 */
const typescriptNodeTypes = [
  "TSParameterProperty",
  "TSDeclareFunction",
  "TSDeclareMethod",
  "TSQualifiedName",
  "TSCallSignatureDeclaration",
  "TSConstructSignatureDeclaration",
  "TSPropertySignature",
  "TSMethodSignature",
  "TSIndexSignature",
  "TSAnyKeyword",
  "TSBooleanKeyword",
  "TSBigIntKeyword",
  "TSIntrinsicKeyword",
  "TSNeverKeyword",
  "TSNullKeyword",
  "TSNumberKeyword",
  "TSObjectKeyword",
  "TSStringKeyword",
  "TSSymbolKeyword",
  "TSUndefinedKeyword",
  "TSUnknownKeyword",
  "TSVoidKeyword",
  "TSThisType",
  "TSFunctionType",
  "TSConstructorType",
  "TSTypeReference",
  "TSTypePredicate",
  "TSTypeQuery",
  "TSTypeLiteral",
  "TSArrayType",
  "TSTupleType",
  "TSOptionalType",
  "TSRestType",
  "TSNamedTupleMember",
  "TSUnionType",
  "TSIntersectionType",
  "TSConditionalType",
  "TSInferType",
  "TSParenthesizedType",
  "TSTypeOperator",
  "TSIndexedAccessType",
  "TSMappedType",
  "TSLiteralType",
  "TSExpressionWithTypeArguments",
  "TSInterfaceDeclaration",
  "TSInterfaceBody",
  "TSTypeAliasDeclaration",
  "TSInstantiationExpression",
  "TSAsExpression",
  "TSSatisfiesExpression",
  "TSTypeAssertion",
  "TSEnumDeclaration",
  "TSEnumMember",
  "TSModuleDeclaration",
  "TSModuleBlock",
  "TSImportType",
  "TSImportEqualsDeclaration",
  "TSExternalModuleReference",
  "TSNonNullExpression",
  "TSExportAssignment",
  "TSNamespaceExportDeclaration",
  "TSTypeAnnotation",
  "TSTypeParameterInstantiation",
  "TSTypeParameterDeclaration",
  "TSTypeParameter",
];

export function extendAcornWalkForTypeScriptNodes(base: any) {
  // By default, we ignore all TypeScript nodes.
  for (const nodeType of typescriptNodeTypes) {
    if (base[nodeType]) {
      continue;
    }
    base[nodeType] = base.EmptyStatement;
  }
  // Only walk relevant TypeScript nodes.
  base.TSModuleBlock = base.BlockStatement;
  base.TSAsExpression = base.TSNonNullExpression = base.ExpressionStatement;
  base.TSModuleDeclaration = (node: any, state: any, callback: any) => {
    callback(node.body, state);
  };
  /**
   * Override the behavior of acorn-walk. When parsing a function, the function body is expected. However, the function
   * body may not exist in TypeScript code (e.g., abstract methods within an abstract class).
   *
   * The following code was copied from acorn-walk. There are 2 changes:
   * - Use const instead of let in the loop.
   * - Check node.body before using it.
   *
   * Ref: https://github.com/acornjs/acorn/blob/a707bfefd73515efd759b7638c30281d775cd043/acorn-walk/src/index.js#L262
   */
  base.Function = (node: any, st: any, c: any) => {
    if (node.id) {
      c(node.id, st, "Pattern");
    }
    for (const param of node.params) {
      c(param, st, "Pattern");
    }
    if (node.body) {
      c(node.body, st, node.expression ? "Expression" : "Statement");
    }
  };
}
