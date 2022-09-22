import CoreObject from './core';
import PrismaFileParser from './database/prismaFileParser';
import fs from "fs"
import dotenv from "dotenv"


dotenv.config()

var Core = new CoreObject({
    token: process.env.TOKEN as string,
    mode: 'selfhost',
})

let bot = Core.bot;
let client = Core.Client;

export default Core;
export { bot, client };

module.exports = Core;
module.exports.default = Core;
module.exports.client = Core.Client;
module.exports.bot = Core.bot;