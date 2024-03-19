import { Client } from "discord.js";
import ModuleLoader from "./loaders/moduleLoader";
import CommandLoader from "./loaders/commandLoader";
import ButtonManager from "./managers/buttonManager";
import SelectMenuManager from "./managers/selectMenuManager";
import ModalManager from "./managers/modalManager";
import { Logger } from "./utils/logger";

export default class Bot {
  public commandLoader: CommandLoader;
  public moduleLoader: ModuleLoader;

  public buttonManager: ButtonManager;
  public selectMenuManager: SelectMenuManager;
  public modalManager: ModalManager;

  public logger = new Logger("Bot");

  public loadStatus: {
    commands: boolean;
    modules: boolean;
  } = {
    commands: false,
    modules: false,
  };

  constructor(public client: Client) {
    this.client.on("ready", () => {
      this.logger.info(`Logged in as ${this.client.user?.tag}`);
      this.moduleLoader.onReady();
    });

    this.commandLoader = new CommandLoader(this.client);
    this.moduleLoader = new ModuleLoader(this);

    this.buttonManager = new ButtonManager(this.client);
    this.selectMenuManager = new SelectMenuManager(this.client);
    this.modalManager = new ModalManager(this.client);
  }

  public async init() {
    this.moduleLoader.loadModules();
  }

  public async restart() {
    const { spawn } = require("child_process");
    spawn("npm", ["run", "cli", "restart"], {
      stdio: "inherit",
    });
  }

  public updateLoadStatus() {
    if (this.loadStatus.commands && this.loadStatus.modules) {
      this.logger.info("All modules and commands loaded!");
    }
  }
}
