import chalk from "chalk";
import Utils from "../utils/utils";
import ModelOption from "./modelOption";

export default class Model {
  public name: string;
  public module: string;
  public version: string;
  public cols: ModelOption[];

  constructor(public modelText: string) {
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
    const infoLine = lines[0]; // mCore,v1.0.0
    const modelLine = lines[1]; // model User {

    const info = infoLine.split(",");
    this.module = info[0].replace("// m", "");
    this.version = info[1].replace("v", "");
    this.name = modelLine.replace("model ", "").replace(" {", "");

    const dataLines = lines.slice(2, lines.length - 1);
    const dataLineRegex = new RegExp(
      /^  (?<name>[a-zA-Z]+) +(?<type>[a-zA-Z\[\]]+)(?<isOptional>\?)? *(?<options>(@.+))*/gm
    );
    this.cols = Utils.removeUndefined(
      dataLines.map((line) => {
        const match = dataLineRegex.exec(line);
        if (!match || !match.groups) return;
        const { name, type, isOptional, options } = match.groups;
        return new ModelOption(name, type, isOptional == "?", options);
      })
    );
  }

   public toString() {
    return `Model: ${chalk.yellow.bold(this.name)} (${chalk.green(this.module)}, ${chalk.blue("v" + this.version)})\n` + this.cols.map((col) => col.toString()).join("\n");
   }
}
