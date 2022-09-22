import { Client } from "discord.js";
import ModuleLoader from "./loaders/moduleLoader";
import CommandLoader from "./loaders/commandLoader";
import ButtonManager from "./managers/buttonManager";
import SelectMenuManager from "./managers/selectMenuManager";
import ModalManager from "./managers/modalManager";

export default class Bot {

    commandLoader: CommandLoader
    moduleLoader: ModuleLoader

    buttonManager: ButtonManager
    selectMenuManager: SelectMenuManager
    modalManager: ModalManager
  
  constructor(public client: Client) {
    this.client
      .on("ready", () => {
        console.info(`Logged in as ${this.client.user?.tag}`);

      })
      
    this.commandLoader = new CommandLoader(this.client);
    this.moduleLoader = new ModuleLoader(this);
    
    this.buttonManager = new ButtonManager(this.client);
    this.selectMenuManager = new SelectMenuManager(this.client);
    this.modalManager = new ModalManager(this.client);
  }
}
