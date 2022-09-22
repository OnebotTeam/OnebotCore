import CoreObject from './core';
import dotenv from "dotenv"
import { PrismaClient } from '@prisma/client';


dotenv.config()

var Core = new CoreObject({
    token: process.env.TOKEN as string,
    mode: 'selfhost',
})

let bot = Core.bot;
let client = Core.Client;

export const db = new PrismaClient();

export default Core;
export { bot, client };

module.exports = Core;
module.exports.default = Core;
module.exports.client = Core.Client;
module.exports.bot = Core.bot;
module.exports.db = db;