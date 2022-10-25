import fs from "fs";
import path from "path";
import Model from "../database/model";
import PrismaFileParser from "../database/prismaFileParser";
import { Manifest } from "./loaderTypes";
import child_process from "child_process";
import chalk from "chalk";

export default class DatabaseLoader {
  public static async load() {
    const modules = fs.readdirSync(path.join(__dirname, "../../../modules"));
    const models: Model[] = [];

    for (const mod of modules) {
      const modulePath = path.join(__dirname, "../../../modules", mod);
      const dbPath = path.join(modulePath, "schema.prisma");
      const manifest = JSON.parse(fs.readFileSync(path.join(modulePath, "manifest.json"), "utf-8")) as Manifest
      if (fs.existsSync(modulePath)) {
        models.push(...PrismaFileParser.parse(dbPath, manifest));
      }
    }

    const isDifferent = PrismaFileParser.toPrismaFile(models);

    if (isDifferent) {
        await this.generate().catch((err) => {
            console.log(`${chalk.bold.red("Failed to generate the Prisma Client.")}\n${chalk.red("This is likely due to not having any models defined.\nIf you have any models defined, please check the error above,\notherwise, you can ignore this message.")}`)
        }).finally(() => {
            console.log(`${chalk.bold.green("Successfully generated the Prisma Client.")}`)
        })
    } else {
        console.log("Prisma Client is up to date.")
    }
  }

    public static async generate() {
        console.log("Generating Prisma Client...")

        return new Promise<0 | 1>((resolve, reject) => {
            child_process.spawn("npx prisma db push", {
                shell: true,
                stdio: "ignore"
            }).on("exit", (code) => {
                if (code === 0) {
                    resolve(code)
                } else {
                    reject(code)
                }
            })
        })
    }

}
