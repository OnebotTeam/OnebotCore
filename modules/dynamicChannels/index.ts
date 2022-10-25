import { ChannelType } from "discord.js";
import { bot, db } from "../../core";
import Module from "../../core/base/module";
import ChannelNames from "./channelNames.json";

export default class DynamicChannelsModule extends Module {
  name = "dynamicChannels";
  description = "No description provided";

  getDynamicChannelsModule(): DynamicChannelsModule {
    return bot.moduleLoader.getModule("dynamicChannels") as DynamicChannelsModule;
  }

  override async onLoad(): Promise<boolean> {
    bot.client.on("voiceStateUpdate", async (oldState, newState) => {
      const lobbyChannel = await db.dynamicChannelsGuildSettings
        .findFirst({
          where: {
            guildId: newState.guild.id,
          },
          select: {
            lobbyChannelId: true,
          },
        })
        .then((res) => {
          if (res) return res.lobbyChannelId;
        });

      if (!lobbyChannel) return;

      if (newState.channel) {
        // User joined a voice channel

        if (newState.channel.id === lobbyChannel) {
          const vcLobbyChannelCategory = newState.guild.channels.cache.get(lobbyChannel)?.parent;
          if (!vcLobbyChannelCategory) return;

          await newState.guild.channels
            .create({
              name: `VC | ${getChannelName()}`,
              type: ChannelType.GuildVoice,
              parent: vcLobbyChannelCategory.id,
            })
            .then(async (channel) => {
              await newState.setChannel(channel);
            });
        }
      }

      if (oldState.channel) {
        // User left a voice channel or switched voice channels

        if (oldState.channel.name.startsWith("VC | ") && oldState.channel.members.size === 0) {
          await oldState.channel.delete();
        }
      }
    });

    return true;
  }
}

function getChannelName() {
  return ChannelNames[Math.floor(Math.random() * ChannelNames.length)];
}
