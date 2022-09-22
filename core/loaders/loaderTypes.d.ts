import Bot from "../bot";
import CustomMessageContextMenuCommandBuilder from "./objects/CustomMessageContextMenuCommandBuilder";
import CustomUserContextMenuCommandBuilder from "./objects/CustomUserContextMenuCommandBuilder";
import CustomSlashCommandBuilder from "./objects/customSlashCommandBuilder";


export class BaseModuleType {
    constructor(bot: Bot) {}
}

export class Module {
    name: string;
    description: string;
    onLoad: () => promise<void>;
    onUnload: () => promise<void>;
}

export type CustomCommandBuilder = CustomSlashCommandBuilder | CustomUserContextMenuCommandBuilder | CustomMessageContextMenuCommandBuilder