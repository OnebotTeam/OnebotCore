import fs from "fs"
import path from "path"
import Model from "./model";

export default class PrismaFileParser {

    public static parse() {
        const prismaPath = path.resolve("prisma/schema.prisma");
        const prismaFile = fs.readFileSync(prismaPath, "utf-8");
        const models: Model[] = [];

        // models start on line 13
        const lines = prismaFile.split("\n").slice(12);

        // find the start of each model
        const modelStarts: number[] = [];
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith("model ")) {
                modelStarts.push(i - 1);
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
            models.push(new Model(modelText));
        }

        return models;
        
    }

}   