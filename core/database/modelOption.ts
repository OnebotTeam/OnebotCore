import chalk from "chalk";

export default class ModelOption {
  public options: {
    id?: boolean;
    unique?: boolean;
    default?: string;
    relation?: string;
    ignore?: boolean;
    map?: string;
    updatedAt?: boolean;
  } = {};
  
  isArray: boolean = false;

  constructor(public name: string, public type: string, public optional: boolean, optionString?: string) {
    // optionstring
    // @id @default(autoincrement()) @unique @relation(fields: [id], references: [id])

    if (type.endsWith("[]")) {
        this.isArray = true;
        this.type = type.replace("[]", "");
    }  

    if (optionString) {
      const options = optionString.split("@");
      options.forEach((option) => {
        if (option.includes("id")) this.options.id = true;
        if (option.includes("unique")) this.options.unique = true;
        if (option.includes("default")) {
          const value = option.split("(")[1].replace(")", "");
          this.options.default = value;
        }
        if (option.includes("relation")) {
          const value = option.split("(")[1].replace(")", "");
          this.options.relation = value;
        }
        if (option.includes("ignore")) this.options.ignore = true;
        if (option.includes("map")) {
          const value = option.split("(")[1].replace(")", "");
          this.options.map = value;
        }
        if (option.includes("updatedAt")) this.options.updatedAt = true;
      });
    }
  }

    public toString() {
    return `  ${chalk.green.bold(this.name)} (${this.optional ? chalk.blueBright("optional") : chalk.redBright("required")} ${this.isArray ? chalk.green("array ") : ""}${chalk.yellow(this.type)})` + Object.entries(this.options).map(([key, value]) => {
      if (value === true) return ` ${chalk.blue("@")}${chalk.blue(key)}`;
      return ` ${chalk.blue("@")}${chalk.blue(key)}${chalk.yellow(`(${value})`)}`;
    }).join("");
  }
}
