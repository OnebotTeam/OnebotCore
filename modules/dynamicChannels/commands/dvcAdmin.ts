import { ChannelType, PermissionFlagsBits } from "discord.js";
import { db } from "../../../core";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder";

const Command = new SlashCommandBuilder()
  .setName("dvcadmin")
  .setDescription("Dynamic voice channel admin settings")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDMPermission(false)
  .addSubcommand((subcommand) =>
    subcommand
      .setName("setlobby")
      .setDescription("Set the lobby channel")
      .addChannelOption((option) =>
        option
          .setName("channel")
          .setDescription("The channel to set as the lobby")
          .setRequired(true)
          .addChannelTypes(ChannelType.GuildVoice, ChannelType.GuildStageVoice)
      )
      .setFunction(async (interaction) => {
        const channel = interaction.options.getChannel("channel", true);
        await db.dynamicChannelsGuildSettings
          .upsert({
            where: {
              guildId: interaction.guildId as string,
            },
            create: {
              guildId: interaction.guildId as string,
              lobbyChannelId: channel.id,
            },
            update: {
              lobbyChannelId: channel.id,
            },
          })
          .catch((err) => {
            interaction.reply({
              content: `An error occured while setting the lobby channel: \n\`${err}\``,
            });

            return;
          })
          .finally(() => {
            interaction.reply({ content: `Set the lobby channel to <#${channel.id}>`, ephemeral: true });
          });
      })
  );
export default Command;
