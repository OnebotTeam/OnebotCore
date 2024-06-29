import fs from "fs";
import path from "path";
import Bot from "../bot.js";
import Module from "../base/module.js";
import { CustomCommandBuilder, Manifest } from "./loaderTypes.js";
import { GatewayIntentsString } from "discord.js";
import GlobalLogger, { Logger } from "../utils/logger.js";

export default class ModuleLoader {
  public modules: Map<string, Module> = new Map();
  public logger = new Logger("ModuleLoader");

  constructor(private bot: Bot, public location: string = path.resolve("./dist/modules/")) { }

  public addModule(module: Module) {
    this.modules.set(module.name, module);
  }

  public getModule(name: string): Module | undefined {
    return this.modules.get(name);
  }

  public async loadModules() {
    const modules = fs.readdirSync(this.location);


    await Promise.all(
      modules.map(async (mod) => {
        const modulePath = path.join(this.location, mod);
        const moduleFile = await import(path.resolve(modulePath, "index.js"));
        const m = new moduleFile.default(this.bot) as Module;
        this.addModule(m);
      })
    )


    this.logger.log("Loaded modules: " + this.modules.size);

    this.bot.loadStatus.modules = true;

    //load commands on ready

    this.bot.client.once("ready", async () => {
      const promises: Promise<CustomCommandBuilder[]>[] = [];
      this.modules.forEach(async (module) => {
        promises.push(
          new Promise(async (resolve) => {
            const moduleCommands = await module.loadCommands();
            resolve(moduleCommands);
          })
        );
      });

      const commands: CustomCommandBuilder[] = [];
      (await Promise.all(promises)).forEach((moduleCommands) => {
        commands.push(...moduleCommands);
      });

      await this.bot.commandLoader.load(commands);
      this.bot.loadStatus.commands = true;

      this.bot.updateLoadStatus();
    });
  }

  public async getAllModules(): Promise<Module[]> {
    const modules = fs.readdirSync(this.location);

    const moduleObjects: Module[] = [];

    await Promise.all(
      modules.map(async (mod) => {
        const modulePath = path.join(this.location, mod);
        const moduleFile = await import(path.resolve(modulePath, "index.js"));
        const m = new moduleFile.default(this.bot) as Module;
        moduleObjects.push(m);
      })
    );

    return moduleObjects;
  }

  public getLoadedModules(): Module[] {
    return Array.from(this.modules.values());
  }

  public async getUnloadedModules(): Promise<Module[]> {
    const loadedModules = this.getLoadedModules();
    const allModules = await this.getAllModules();

    const unloadedModules: Module[] = [];
    allModules.forEach((module) => {
      if (!loadedModules.includes(module)) unloadedModules.push(module);
    });

    return unloadedModules;
  }

  public getModuleCommands(moduleName: string): CustomCommandBuilder[] {
    return Array.from(
      this.bot.commandLoader.commands.filter((command) => command.getModule() === moduleName).values()
    );
  }

  public isModuleLoaded(moduleName: string): boolean {
    return this.modules.has(moduleName);
  }

  public async loadModule(moduleName: string): Promise<boolean> {
    if (this.isModuleLoaded(moduleName)) return false;

    const modulePath = path.join(this.location, moduleName);
    const moduleFile = await import(path.resolve(modulePath, "index.js"));
    const m = new moduleFile.default(this.bot);
    this.addModule(m);

    const moduleCommands = await m.loadCommands();
    this.bot.commandLoader.load(moduleCommands);

    return true;
  }

  public async unloadModule(moduleName: string): Promise<boolean> {
    if (!this.isModuleLoaded(moduleName)) return false;

    const module = this.getModule(moduleName);
    if (!module) return false;

    const moduleCommands = this.getModuleCommands(moduleName);
    this.bot.commandLoader.unload(moduleCommands);

    this.modules.delete(moduleName);

    return true;
  }

  public async onReady() {
    const promises: Promise<{
      module: Module;
      success: boolean;
    }>[] = [];
    this.modules.forEach(async (module) => {
      promises.push(
        new Promise(async (resolve) => {
          const res = await module.onLoad();
          resolve({
            module,
            success: res,
          });
        })
      );
    });

    (await Promise.all(promises)).forEach((res) => {
      if (!res.success) this.logger.error(`Failed to load module ${res.module.name}`);
    });
  }

  public static getIntents(srcLocation: string = path.resolve("./src/modules")): GatewayIntentsString[] {
    const modules = fs.readdirSync(srcLocation);
    const intents = new Set<string>();

    for (const mod of modules) {
      const modulePath = path.join(srcLocation, mod);
      const manifest = JSON.parse(fs.readFileSync(path.join(modulePath, "manifest.json"), "utf-8"));
      if (manifest.intents) {
        manifest.intents.forEach((intent: string) => {
          intents.add(intent);
        });
      }
    }

    GlobalLogger.log("ModuleLoader", "Loaded intents: " + Array.from(intents.values()).join(", "));

    return Array.from(intents) as GatewayIntentsString[];
  }
}
