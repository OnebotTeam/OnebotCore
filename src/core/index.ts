import "dotenv/config"
import CoreObject from './core.js';
import GlobalLogger, { LogLevel } from "./utils/logger.js";

GlobalLogger.init({
    consoleLogLevel: LogLevel.INFO,
    debugEnabled: process.env.DEBUG === "true",
})

var Core = new CoreObject(process.env.TOKEN as string)

let bot = Core.bot;
let client = Core.Client;
let db = Core.db;

export default Core;
export { bot, client, db };

Core.init()
