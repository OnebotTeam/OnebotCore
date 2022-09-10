import { Client, InteractionType } from "discord.js";

export default class SelectMenuManager {
  public menus: Map<string, Function> = new Map();

  constructor(private client: Client) {
    this.client.on("interactionCreate", (menu) => {
      if (!menu.isSelectMenu()) return;

      const menuId = menu.customId;
      const menuFunc = this.menus.get(menuId);
      if (!menuFunc) return;
      menuFunc(menu);
    });
  }

  public registerMenu(id: string, callback: Function) {
    console.log(`Registering menu: ${id}`);
    this.menus.set(id, callback);
  }

  public unregisterMenu(id: string) {
    this.menus.delete(id);
  }
}
