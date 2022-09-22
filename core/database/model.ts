import chalk from "chalk";
import Utils from "../utils/utils";
import ModelOption from "./modelOption";

export default class Model {
  public name: string;
  public module: string;
  public version: string;
  public cols: ModelOption[];

  constructor(public modelText: string, moduleInfo?: { name: string; version: string }) {
    /*

       // Example model:

      // mCore,v1.0.0
    model User {
        id        Int      @id @default(autoincrement())
        email     String   @unique
        password  String
        name      String?
        createdAt DateTime @default(now())
        updatedAt DateTime @updatedAt
    }
    */

    const lines = this.modelText.split("\n");

    if (moduleInfo) {
      const modelLine = lines[0]; // model User {
      this.name = modelLine.replace("model ", "").replace(" {", "");
      this.module = moduleInfo.name;
      this.version = moduleInfo.version;
    } else {
      const infoLine = lines[0]; // mCore,v1.0.0
      const modelLine = lines[1]; // model User {
      const info = infoLine.split(",");
      this.module = info[0].replace("// m", "");
      this.version = info[1].replace("v", "");
      this.name = modelLine.replace("model ", "").replace(" {", "");
    }

    const dataLines: string[] = []; 

    // add an empty line after each line (no idea why this is needed)
    lines.slice(moduleInfo ? 1 : 2, lines.length - 1).forEach((line) => {
      dataLines.push(line);
      dataLines.push("");
    })

    const dataLineRegex = new RegExp(
      / +(?<name>[a-zA-Z]+) +(?<type>[a-zA-Z\[\]]+)(?<isOptional>\?)? *(?<options>@.+)*/gm
    );

    const cols = 
      dataLines.map((line) => {
        const match = dataLineRegex.exec(line);
        if (!match || !match.groups) return;
        const { name, type, isOptional, options } = match.groups;
        return new ModelOption(name, type, isOptional == "?", options);
      })
    
      this.cols = Utils.removeUndefined(cols);
  }

  public toString() {
    return (
      `Model: ${chalk.yellow.bold(this.name)} (${chalk.green(this.module)}, ${chalk.blue(
        "v" + this.version
      )})\n` + this.cols.map((col) => col.toString()).join("\n")
    );
  }

  public toPrismaFile() {
    return `// m${this.module},v${this.version}\nmodel ${this.name} {\n${this.cols.map((col) => col.toPrismaFile()).join("\n")}\n}`;
  }
}
