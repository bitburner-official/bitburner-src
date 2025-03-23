import { SourceFile } from "./SourceFile";
import { BitNodes, initBitNodes } from "../BitNode/BitNode";

export const SourceFiles: Record<string, SourceFile> = {};
/** Engine initializer for SourceFiles, BitNodes, and BitNodeMultipliers. Run once at engine load. */
export function initSourceFiles() {
  initBitNodes();
  SourceFiles.SourceFile1 = new SourceFile(1, BitNodes.BitNode1.sfDescription);
  SourceFiles.SourceFile2 = new SourceFile(2, BitNodes.BitNode2.sfDescription);
  SourceFiles.SourceFile3 = new SourceFile(3, BitNodes.BitNode3.sfDescription);
  SourceFiles.SourceFile4 = new SourceFile(4, BitNodes.BitNode4.sfDescription);
  SourceFiles.SourceFile5 = new SourceFile(5, BitNodes.BitNode5.sfDescription);
  SourceFiles.SourceFile6 = new SourceFile(6, BitNodes.BitNode6.sfDescription);
  SourceFiles.SourceFile7 = new SourceFile(7, BitNodes.BitNode7.sfDescription);
  SourceFiles.SourceFile8 = new SourceFile(8, BitNodes.BitNode8.sfDescription);
  SourceFiles.SourceFile9 = new SourceFile(9, BitNodes.BitNode9.sfDescription);
  SourceFiles.SourceFile10 = new SourceFile(10, BitNodes.BitNode10.sfDescription);
  SourceFiles.SourceFile11 = new SourceFile(11, BitNodes.BitNode11.sfDescription);
  SourceFiles.SourceFile12 = new SourceFile(12, BitNodes.BitNode12.sfDescription);
  SourceFiles.SourceFile13 = new SourceFile(13, BitNodes.BitNode13.sfDescription);
  SourceFiles.SourceFile14 = new SourceFile(14, BitNodes.BitNode14.sfDescription);
}
