const fs = require("fs");

const files = [];
const docRoot = "./src/Tutorial/ui/doc";
const processDir = (dir) => {
  console.log(dir);
  for (const file of fs.readdirSync(dir)) {
    const path = `${dir}/${file}`;
    if (fs.lstatSync(`${dir}/${file}`).isDirectory()) {
      processDir(path);
      continue;
    }
    if (path.startsWith(docRoot + "/")) {
      files.push(path.slice(docRoot.length + 1));
    }
  }
};
processDir(docRoot);

const autogenfile = `// THIS FILE IS AUTOGENERATED
import { registerPage } from "./root"
${files.map((f, i) => `import file${i} from "!!raw-loader!./doc/${f}";`).join("\n")}

export const registerPages = () => {
${files.map((f, i) => `  registerPage("${f}", file${i});`).join("\n")}
};
`;

fs.writeFile(docRoot + "/../pages.ts", autogenfile, (err) => {
  if (err) {
    console.error(err);
  }
  // file written successfully
});
