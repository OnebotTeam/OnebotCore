import Bot from "../bot";
import { BaseModuleType, CustomCommandBuilder } from "../loaders/loaderTypes";
import fs from "fs"
import path from "path"
import { Client } from "discord.js";

export default class Module implements BaseModuleType {
     name: string = ""
     description: string = ""

    private client?: Client
    private commands: Map<string, CustomCommandBuilder> = new Map();

    constructor(bot: Bot) {
        this.client = bot.client;
        this.client.on("ready", () => {
            console.info(`Loaded module ${this.constructor.name}`);
        })
    }

    /**
     * Override this method to run code when the module is loaded
     */
    async onLoad(): Promise<Boolean> {
        console.log(`Loaded module ${this.name}`);
        return true;
    }

    /**
     * Override this method to run code when the module is unloaded
     */
    async onUnload(): Promise<Boolean> {
        console.log(`Unloaded module ${this.name}`);
        return true;
    }
         
    public async loadCommands() {
        if (!fs.existsSync(path.resolve(`./dist/modules/${this.name}/commands`))) {
            console.log(`No commands found for module ${this.name}, skipping...`)
            return []
        }
        const commandFolder = fs.readdirSync(path.resolve(`./dist/modules/${this.name}/commands`));
        
        let commands: CustomCommandBuilder[] = [];
        this.commands = new Map();

        for (const commandFile of commandFolder) {
            if (!commandFile.endsWith(".js")) continue;
            const command = require(path.resolve(`./dist/modules/${this.name}/commands/${commandFile}`)).default as CustomCommandBuilder;
            command.setModule(this.name);            
            commands.push(command);

            this.commands.set(command.getName(), command);
        }

        return commands;
    }
}