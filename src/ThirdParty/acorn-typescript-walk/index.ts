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
}
