// Defines a "Research Tree"
// Each Industry has a unique Research Tree
// Each Node in the Research Trees only holds the name(s) of Research,
// not an actual Research object. The name can be used to obtain a reference
// to the corresponding Research object using the ResearchMap
import { CorpResearchName } from "@nsdefs";
import { Research } from "./Research";
import { ResearchMap } from "./ResearchMap";

interface IConstructorParams {
  children?: Node[];
  cost: number;
  researchName: CorpResearchName;
  parent?: Node | null;
}

export class Node {
  // All child Nodes in the tree
  // The Research held in this Node is a prerequisite for all Research in
  // child Nodes
  children: Node[] = [];

  // How much Scientific Research is needed for this
  // Necessary to show it on the UI
  cost = 0;

  // Whether or not this Research has been unlocked
  researched = false;

  // Parent node in the tree
  // The parent node defines the prerequisite Research (there can only be one)
  // Set as null for no prerequisites
  parent: Node | null = null;

  // Name of the Research held in this Node
  researchName: CorpResearchName;

  constructor(p: IConstructorParams) {
    this.researchName = p.researchName;
    this.cost = p.cost;

    if (p.children && p.children.length > 0) {
      this.children = p.children;
    }

    if (p.parent != null) {
      this.parent = p.parent;
    }
  }

  addChild(n: Node): void {
    this.children.push(n);
    n.parent = this;
  }

  // Recursive function for finding a Node with the specified text
  findNode(name: CorpResearchName): Node | null {
    // Is this the Node?
    if (this.researchName === name) {
      return this;
    }

    // Recursively search children
    let res = null;
    for (let i = 0; i < this.children.length; ++i) {
      res = this.children[i].findNode(name);
      if (res != null) {
        return res;
      }
    }

    return null;
  }

  setParent(n: Node): void {
    this.parent = n;
  }
}

// A ResearchTree defines all available Research in an Industry
// The root node in a Research Tree must always be the "Hi-Tech R&D Laboratory"
export class ResearchTree {
  // Object containing names of all acquired Research by name
  researched = new Set<CorpResearchName>();

  // Root Node
  root: Node | null = null;

  // Gets an array with the 'text' values of ALL Nodes in the Research Tree
  getAllNodes(): CorpResearchName[] {
    const res: CorpResearchName[] = [];
    const queue: Node[] = [];

    if (this.root == null) {
      return res;
    }

    queue.push(this.root);
    while (queue.length !== 0) {
      const node: Node | undefined = queue.shift();
      if (node == null) {
        continue;
      }

      res.push(node.researchName);
      for (let i = 0; i < node.children.length; ++i) {
        queue.push(node.children[i]);
      }
    }

    return res;
  }

  // Get total multipliers from this Research Tree
  getAdvertisingMultiplier(): number {
    return this.getMultiplierHelper("advertisingMult");
  }

  getEmployeeChaMultiplier(): number {
    return this.getMultiplierHelper("employeeChaMult");
  }

  getEmployeeCreMultiplier(): number {
    return this.getMultiplierHelper("employeeCreMult");
  }

  getEmployeeEffMultiplier(): number {
    return this.getMultiplierHelper("employeeEffMult");
  }

  getEmployeeIntMultiplier(): number {
    return this.getMultiplierHelper("employeeIntMult");
  }

  getProductionMultiplier(): number {
    return this.getMultiplierHelper("productionMult");
  }

  getProductProductionMultiplier(): number {
    return this.getMultiplierHelper("productProductionMult");
  }

  getSalesMultiplier(): number {
    return this.getMultiplierHelper("salesMult");
  }

  getScientificResearchMultiplier(): number {
    return this.getMultiplierHelper("sciResearchMult");
  }

  getStorageMultiplier(): number {
    return this.getMultiplierHelper("storageMult");
  }

  // Helper function for all the multiplier getter fns
  getMultiplierHelper(propName: string): number {
    let res = 1;
    if (this.root == null) {
      return res;
    }

    const queue: Node[] = [];
    queue.push(this.root);
    while (queue.length !== 0) {
      const node: Node | undefined = queue.shift();

      // If the Node has not been researched, there's no need to
      // process it or its children
      if (node == null || !node.researched) {
        continue;
      }

      const research: Research | null = ResearchMap[node.researchName];

      // Safety checks
      if (research == null) {
        console.warn(`Invalid Research name in node: ${node.researchName}`);
        continue;
      }

      const mult =
        {
          advertisingMult: research.advertisingMult,
          employeeChaMult: research.employeeChaMult,
          employeeCreMult: research.employeeCreMult,
          employeeEffMult: research.employeeEffMult,
          employeeIntMult: research.employeeIntMult,
          productionMult: research.productionMult,
          productProductionMult: research.productProductionMult,
          salesMult: research.salesMult,
          sciResearchMult: research.sciResearchMult,
          storageMult: research.storageMult,
        }[propName] ?? null;

      if (mult === null) {
        console.warn(`Invalid propName specified in ResearchTree.getMultiplierHelper: ${propName}`);
        continue;
      }

      res *= mult;
      for (let i = 0; i < node.children.length; ++i) {
        queue.push(node.children[i]);
      }
    }

    return res;
  }

  // Search for a Node with the given name ('text' property on the Node)
  // Returns 'null' if it cannot be found
  findNode(name: CorpResearchName): Node | null {
    if (this.root == null) {
      return null;
    }
    return this.root.findNode(name);
  }

  // Marks a Node as researched
  research(name: CorpResearchName): void {
    if (!this.root || this.researched.has(name)) return;

    const queue: Node[] = [];
    queue.push(this.root);
    while (queue.length !== 0) {
      const node: Node | undefined = queue.shift();
      if (!node) continue;

      if (node.researchName === name) {
        node.researched = true;
        this.researched.add(name);
        return;
      }

      queue.push(...node.children);
    }

    console.warn(`ResearchTree.research() did not find the specified Research node for: ${name}`);
  }

  // Set the tree's Root Node
  setRoot(root: Node): void {
    this.root = root;
  }
}
