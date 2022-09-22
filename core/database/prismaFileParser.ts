import fs from "fs"
import path from "path"
import DatabaseLoader from "../loaders/databaseLoader";
import Model from "./model";

export default class PrismaFileParser {

    public static parse(filePath: string = "prisma/schema.prisma", moduleInfo?: { name: string, version: string }): Model[] {
        const prismaPath = path.resolve(filePath || "prisma/schema.prisma");
        const prismaFile = fs.readFileSync(prismaPath, "utf-8");
        const models: Model[] = [];

        const startLine = prismaFile.split("\n").findIndex((line) => line.includes("model") && !line.includes("//"));

        // models start on line 14
        const lines = prismaFile.split("\n").slice(startLine);

        // find the start of each model
        const modelStarts: number[] = [];
        for (const [index, line] of lines.entries()) {
            if (line.trim().startsWith("model ")) {
                modelStarts.push(moduleInfo ? index : index - 1);
            }
        }

        // find the end of each model
        const modelEnds: number[] = [];
        for (let i = 0; i < modelStarts.length; i++) {
            const start = modelStarts[i];
            const end = lines.slice(start).findIndex((line) => line.startsWith("}"));
            modelEnds.push(start + end);
        }

        // get the model text
        for (let i = 0; i < modelStarts.length; i++) {
            const start = modelStarts[i];
            const end = modelEnds[i];
            const modelText = lines.slice(start, end + 1).join("\n");
            models.push(new Model(modelText, moduleInfo));
        }

        return models;
        
    }

    public static toPrismaFile(models: Model[]) {
        const prismaPath = path.resolve("prisma/schema.prisma");
        const prismaFile = fs.readFileSync(prismaPath, "utf-8");
        
        const header = prismaFile.split("\n").slice(0, 13).join("\n");

        const modelText = models.map((model) => model.toPrismaFile()).join("\n\n");

        fs.writeFileSync(prismaPath, `${header}\n${modelText}`);

        if (prismaFile != `${header}\n${modelText}`) {
            return true
        }

        return false
    }

}   