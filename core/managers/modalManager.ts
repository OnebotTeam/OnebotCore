import { Client, InteractionType } from "discord.js";

export default class ModalManager {
  public modals: Map<string, Function> = new Map();

  constructor(private client: Client) {
    this.client.on("interactionCreate", (modal) => {
      if (modal.type != InteractionType.ModalSubmit) return;

      const modalId = modal.customId;
      const modalFunc = this.modals.get(modalId);
      if (!modalFunc) return;
      modalFunc(modal);
    });
  }

  public registerModal(id: string, modal: Function) {
    this.modals.set(id, modal);
  }

  public unregisterModal(id: string) {
    this.modals.delete(id);
  }
}
