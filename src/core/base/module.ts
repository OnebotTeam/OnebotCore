import Bot from "../bot.js";
import { BaseModuleType, CustomCommandBuilder } from "../loaders/loaderTypes.js";
import fs from "fs";
import path from "path";
import { Client } from "discord.js";
import chalk from "chalk";
import InteractionHandler from "../loaders/interactionHandler.js";
import { Logger } from "../utils/logger.js";
import Core, { bot } from "../index.js";
import ConfigProvider from "../utils/configProvider.js";

export interface ModuleConstructorOptions {
  name: string;
  description?: string;
  location?: string;

}

export default class Module<Config extends {
  [key: string]: any;
} = {}> implements BaseModuleType {
  public name: string = "";
  public description: string = "";

  private client?: Client;
  private commands: Map<string, CustomCommandBuilder> = new Map();
  private interactions: Map<string, InteractionHandler> = new Map();
  protected logger: Logger
  public config: ConfigProvider<Config>
  public location: string = path.resolve("./dist/modules/");

  constructor(protected options: ModuleConstructorOptions) {

    this.name = options.name;
    this.description = options.description || "";
    this.location = options.location || this.location;

    this.client = bot.client;
    this.logger = new Logger(this.name);
    if (Core.config.get("showModuleLoadInfo")) {
      this.client.on("ready", () => {
        this.logger.log(`Loaded module.`);
      });
    }

    this.config = ConfigProvider.getModuleAccessor<Config>(this.name);
  }

  protected defaultConfig(defaultConfig: Config) {
    this.config.defaultConfig(defaultConfig);
  }

  /**
   * Override this method to run code when the module is loaded
   */
  async onLoad(): Promise<boolean> {
    return true;
  }

  /**
   * Override this method to run code when the module is unloaded
   */
  async onUnload(): Promise<Boolean> {
    this.logger.log(`Unloaded.`);
    return true;
  }

  public async loadCommands() {
    if (!fs.existsSync(path.resolve(this.location, `${this.name}/commands`))) {
      this.logger.log(`No commands found for this module, skipping...`);
      return [];
    }
    const commandFolder = fs.readdirSync(path.resolve(this.location, `${this.name}/commands`));

    let commands: CustomCommandBuilder[] = [];
    this.commands = new Map();

    await Promise.all(
      commandFolder.map(async (commandFile) => {
        if (!commandFile.endsWith(".js")) return;
        try {
          const command = (await import(path.resolve(this.location, `${this.name}/commands/${commandFile}`))).default as CustomCommandBuilder;

          command.setModule(this.name);
          commands.push(command as CustomCommandBuilder);

          this.commands.set(command.getName(), command);
        } catch (e) {
          this.logger.error("CommandLoader", `Error loading command ${commandFile}`);
          this.logger.error(e);
        }
      })
    );


    this.logger.debug(`Loaded ${commands.length} commands`);

    return commands;
  }

  public async loadInteractions() {
    if (!fs.existsSync(path.resolve(this.location, `${this.name}/interactions`))) {
      this.logger.log(`No interactions found for module this module, skipping...`);
      return [];
    }

    const interactionFolder = fs.readdirSync(path.resolve(`./dist/modules/${this.name}/interactions`));

    let interactions: InteractionHandler[] = [];
    this.interactions = new Map();

    for (const interactionFile of interactionFolder) {
      if (!interactionFile.endsWith(".js")) continue;
      try {
        const interaction = require(path.resolve(
          this.location, `${this.name}/interactions/${interactionFile}`
        )).default as InteractionHandler;
        interaction.module = this.name;
        interactions.push(interaction);

        this.interactions.set(interaction.id, interaction);
      } catch (e) {
        this.logger.error(
          "InteractionLoader",
          `Error loading interaction ${interactionFile}`
        );
      }
    }

    this.logger.debug(`Loaded ${interactions.length} interactions`);
  }
}
