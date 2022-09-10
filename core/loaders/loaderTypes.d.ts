import Bot from "../bot";

export class BaseModuleType {
    constructor(bot: Bot) {}
    init: (bot: Bot) => Promise<void>;
}

export class Module {
    name: string;
    description: string;
    init: (bot: Bot) => promise<void>;
}