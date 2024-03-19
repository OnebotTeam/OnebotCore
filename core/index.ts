import dotenv from "dotenv"
import CoreObject from './core';
import GlobalLogger, { LogLevel } from "./utils/logger";

dotenv.config()

GlobalLogger.init({
    consoleLogLevel: LogLevel.INFO,
    debugEnabled: true
})

var Core = new CoreObject({
    token: process.env.TOKEN as string,
    mode: 'selfhost',
})

let bot = Core.bot;
let client = Core.Client;
let db = Core.db;

export default Core;
export { bot, client, db };

Core.init()
