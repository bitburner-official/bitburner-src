// Minimal type information
export declare function createPlugin(
  createRenderer: () => {
    render: (value: string, { display }: { display: boolean }) => any[];
  },
): () => (tree: any, file: any) => void;
