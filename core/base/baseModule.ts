import { Client } from "discord.js";
import Bot from "../bot";
import { BaseModuleType } from "../loaders/loaderTypes";

export default class BaseModule implements BaseModuleType {
    private client?: Client
    constructor(bot: Bot) {
        this.client = bot.client;
        this.client.on("ready", () => {
            console.info(`Loaded module ${this.constructor.name}`);
        })

        this.init(bot);
    }

    async init(bot: Bot) {}
}
