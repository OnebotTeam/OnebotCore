import CoreObject from './core';
import PrismaFileParser from './database/prismaFileParser';
import fs from "fs"

var Core = new CoreObject({
    token: 'token',
    mode: 'selfhost',
})

const models = PrismaFileParser.parse()
console.log(models.map(model => model.toString()).join("\n\n"))
fs.writeFileSync("models.txt", models.map(model => model.toString()).join("\n\n"))