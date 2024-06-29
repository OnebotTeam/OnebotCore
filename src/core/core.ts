import { Client } from "discord.js";
import Bot from "./bot.js";
import ModuleLoader from "./loaders/moduleLoader.js";
import Logger from "./utils/logger.js";
import ConfigProvider from "./utils/configProvider.js";
import Database from "./database/index.js";

export interface CoreConfig {
  usingDatabase: boolean;
  commandRegisterMode: "global" | "guild";
  guildId: string;
  showCommandDeploymentInfo: boolean;
  showCommandCount: boolean;
  showModuleLoadInfo: boolean;
  showInteractionHasExpired: boolean;
}
export default class Core {
  public Client: Client;
  public bot: Bot;
  public config = ConfigProvider.getModuleAccessor<CoreConfig>("core");
  public db = new Database();

  constructor(private _token: string) {

    this.config.defaultConfig({
      usingDatabase: true,
      commandRegisterMode: "global",
      guildId: "",
      showCommandDeploymentInfo: true,
      showCommandCount: true,
      showModuleLoadInfo: true,
      showInteractionHasExpired: true,
    })

    const intents = ModuleLoader.getIntents();
    this.Client = new Client({ intents });
    this.bot = new Bot(this.Client);

    this.Client.setMaxListeners(0);
    this.Client.login(this._token);

    this.Client.on("debug", (info) => {
      Logger.debug("Discord", info);
    });

    this.Client.on("warn", (info) => {
      Logger.debug("Discord", info);
    })
  }

  public init() {
    if (this.config.get("usingDatabase")) {
      this.db.init();
    }

    this.bot.init();
  }
}
