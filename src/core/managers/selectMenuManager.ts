import { Client, Colors, EmbedBuilder, InteractionType } from "discord.js";
import Core from "../index.js";

export default class SelectMenuManager {
  public menus: Map<string, Function> = new Map();

  constructor(private client: Client) {
    this.client.on("interactionCreate", (menu) => {
      if (!menu.isSelectMenu()) return;

      const menuId = menu.customId;
      const menuFunc = this.menus.get(menuId);
      if (!menuFunc) {
        if (Core.config.get("showInteractionHasExpired")) {
          menu.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle("Error")
                .setDescription(`This Select Menu has expired.`)
                .setColor(Colors.Red)
                .setFooter({ text: `selectMenuId: ${menu.customId}` }),
            ],
            ephemeral: true,
          });
        }
        return;
      }
      menuFunc(menu);
    });
  }

  public registerMenu(id: string, callback: Function) {
    this.menus.set(id, callback);
  }

  public unregisterMenu(id: string) {
    this.menus.delete(id);
  }
}
