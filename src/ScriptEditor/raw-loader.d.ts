declare module "*?raw" {
  const contents: string;
  export default contents;
}

declare module "*.md" {
  const jsonHast: any;
  export default jsonHast;
}
