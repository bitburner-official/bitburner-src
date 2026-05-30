type FormulaNode =
  | { type: "number"; value: number }
  | { type: "variable"; name: string }
  | { type: "unary"; operator: "+" | "-"; value: FormulaNode }
  | { type: "binary"; operator: "+" | "-" | "*" | "/" | "**"; left: FormulaNode; right: FormulaNode };

const formulaCache = new Map<string, FormulaNode>();
const maxFormulaCacheEntries = 512;

export function evaluateCorpFormula(formula: string, variables: Readonly<Record<string, number>>): number {
  const result = evaluateFormulaNode(getFormulaNode(formula), variables);
  if (!Number.isFinite(result)) {
    throw new Error(`Evaluated value is not a valid number: ${result}`);
  }
  return result;
}

function getFormulaNode(formula: string): FormulaNode {
  const cached = formulaCache.get(formula);
  if (cached) return cached;

  const parsed = new FormulaParser(formula).parse();
  if (formulaCache.size >= maxFormulaCacheEntries) {
    const firstKey = formulaCache.keys().next().value;
    if (firstKey !== undefined) formulaCache.delete(firstKey);
  }
  formulaCache.set(formula, parsed);
  return parsed;
}

function evaluateFormulaNode(node: FormulaNode, variables: Readonly<Record<string, number>>): number {
  switch (node.type) {
    case "number":
      return node.value;
    case "variable": {
      if (!Object.hasOwn(variables, node.name)) throw new Error(`Unknown variable: ${node.name}`);
      const value = variables[node.name];
      if (!Number.isFinite(value)) throw new Error(`Variable ${node.name} is not a valid number: ${value}`);
      return value;
    }
    case "unary": {
      const value = evaluateFormulaNode(node.value, variables);
      return node.operator === "-" ? -value : value;
    }
    case "binary": {
      const left = evaluateFormulaNode(node.left, variables);
      const right = evaluateFormulaNode(node.right, variables);
      switch (node.operator) {
        case "+":
          return left + right;
        case "-":
          return left - right;
        case "*":
          return left * right;
        case "/":
          return left / right;
        case "**":
          return left ** right;
        default:
          throw new Error(`Unknown operator on node: ${node}`);
      }
    }
    default:
      throw new Error("Unknown formula node");
  }
}

class FormulaParser {
  private index = 0;

  constructor(private readonly source: string) {}

  parse(): FormulaNode {
    const expression = this.parseAdditive();
    this.skipWhitespace();
    if (!this.isEnd()) throw new Error(`Unexpected token '${this.source[this.index]}' at position ${this.index}`);
    return expression;
  }

  private parseAdditive(): FormulaNode {
    let node = this.parseMultiplicative();
    let operator = this.consumeAdditiveOperator();

    while (operator !== undefined) {
      node = { type: "binary", operator, left: node, right: this.parseMultiplicative() };
      operator = this.consumeAdditiveOperator();
    }

    return node;
  }

  private parseMultiplicative(): FormulaNode {
    let node = this.parseUnary();
    let operator = this.consumeMultiplicativeOperator();

    while (operator !== undefined) {
      node = { type: "binary", operator, left: node, right: this.parseUnary() };
      operator = this.consumeMultiplicativeOperator();
    }

    return node;
  }

  private consumeAdditiveOperator(): "+" | "-" | undefined {
    this.skipWhitespace();
    if (this.source.startsWith("+", this.index)) {
      this.index++;
      return "+";
    }
    if (this.source.startsWith("-", this.index)) {
      this.index++;
      return "-";
    }
    return undefined;
  }

  private consumeMultiplicativeOperator(): "*" | "/" | undefined {
    this.skipWhitespace();
    if (this.source.startsWith("**", this.index)) return undefined;
    if (this.source.startsWith("*", this.index)) {
      this.index++;
      return "*";
    }
    if (this.source.startsWith("/", this.index)) {
      this.index++;
      return "/";
    }
    return undefined;
  }

  private parseUnary(): FormulaNode {
    if (this.consumeOperator("+")) return { type: "unary", operator: "+", value: this.parseUnary() };
    if (this.consumeOperator("-")) return { type: "unary", operator: "-", value: this.parseUnary() };
    return this.parsePower();
  }

  private parsePower(): FormulaNode {
    let node = this.parsePrimary();
    if (this.consumeOperator("**")) {
      node = { type: "binary", operator: "**", left: node, right: this.parseUnary() };
    }
    return node;
  }

  private parsePrimary(): FormulaNode {
    this.skipWhitespace();
    if (this.isEnd()) throw new Error("Unexpected end of expression");

    const char = this.source[this.index];
    if (this.isDigit(char) || char === ".") return this.parseNumber();
    if (this.isVariableStart(char)) return this.parseVariable();
    if (this.consumeOperator("(")) {
      const expression = this.parseAdditive();
      if (!this.consumeOperator(")")) throw new Error(`Expected ')' at position ${this.index}`);
      return expression;
    }
    throw new Error(`Unexpected token '${char}' at position ${this.index}`);
  }

  private parseNumber(): FormulaNode {
    const start = this.index;
    let digits = 0;

    while (this.isDigit(this.source[this.index])) {
      this.index++;
      digits++;
    }
    if (this.source[this.index] === ".") {
      this.index++;
      while (this.isDigit(this.source[this.index])) {
        this.index++;
        digits++;
      }
    }
    if (digits === 0) throw new Error(`Invalid number at position ${start}`);

    if (this.source[this.index] === "e" || this.source[this.index] === "E") {
      const exponentStart = this.index;
      let exponentIndex = this.index + 1;
      if (this.source[exponentIndex] === "+" || this.source[exponentIndex] === "-") exponentIndex++;

      let exponentDigits = 0;
      while (this.isDigit(this.source[exponentIndex])) {
        exponentIndex++;
        exponentDigits++;
      }
      if (exponentDigits > 0) this.index = exponentIndex;
      else this.index = exponentStart;
    }

    const numberText = this.source.slice(start, this.index);
    const value = Number(numberText);
    if (!Number.isFinite(value)) throw new Error(`Invalid number: ${numberText}`);
    return { type: "number", value };
  }

  private parseVariable(): FormulaNode {
    const start = this.index;
    while (this.isVariablePart(this.source[this.index])) this.index++;
    return { type: "variable", name: this.source.slice(start, this.index) };
  }

  private consumeOperator(operator: string): boolean {
    this.skipWhitespace();
    if (!this.source.startsWith(operator, this.index)) return false;
    this.index += operator.length;
    return true;
  }

  private skipWhitespace(): void {
    while (/\s/.test(this.source[this.index] ?? "")) this.index++;
  }

  private isEnd(): boolean {
    return this.index >= this.source.length;
  }

  private isDigit(char: string | undefined): boolean {
    return char !== undefined && char >= "0" && char <= "9";
  }

  private isVariableStart(char: string | undefined): boolean {
    return char !== undefined && char >= "A" && char <= "Z";
  }

  private isVariablePart(char: string | undefined): boolean {
    return this.isVariableStart(char) || this.isDigit(char);
  }
}
