import fs from "fs"
import path from "path"
import Bot from "../bot";
import { Module } from "./loaderTypes";

export default class ModuleLoader {

    public modules: Map<string, Module> = new Map();

    constructor(private bot: Bot) {
        this.loadModules();
    }

    public addModule(module: Module) {
        this.modules.set(module.name, module);
    }

    public getModule(name: string): Module | undefined {
        return this.modules.get(name);
    }

    public loadModules() {
        const modulesPath = path.join(__dirname, "../modules");
        const modules = fs.readdirSync(modulesPath);
        for (const mod of modules) {
            const modulePath = path.join(modulesPath, mod);
            const moduleFile = require(modulePath);
            const m = new moduleFile.default(this.bot);
            this.addModule(m);
        }
    }
}