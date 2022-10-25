import {
  ChatInputCommandInteraction,
  Collection,
  GuildMember,
  OverwriteResolvable,
  PermissionsBitField,
  VoiceBasedChannel,
} from "discord.js";
import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder";

const Command = new SlashCommandBuilder()
  .setName("dvc")
  .setDescription("Manage dynamic voice channels")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("limit")
      .setDescription("Set the limit of your voice channel")
      .addIntegerOption((option) =>
        option
          .setName("limit")
          .setDescription("The limit of the voice channel (0 = unlimited)")
          .setRequired(true)
          .setMinValue(0)
          .setMaxValue(99)
      )
      .setFunction(async (interaction) => {
        const limit = interaction.options.getInteger("limit", true);
        const res = await runChecks(interaction);
        if (!res.pass) return;
        const { channel } = res;

        await channel.edit({
          userLimit: limit,
        });
        await interaction.reply({
          content: `Set the limit of **${channel.name}** to **${limit}**`,
          ephemeral: true,
        });
      })
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("name")
      .setDescription("Set the name of your voice channel")
      .addStringOption(
        (option) =>
          option
            .setName("name")
            .setDescription("The name of the voice channel")
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(95) // 100 - "VC | ".length
      )
      .setFunction(async (interaction) => {
        const name = interaction.options.getString("name", true);
        const res = await runChecks(interaction);
        if (!res.pass) return;
        const { channel } = res;
        await channel.edit({
          name: `VC | ${name}`,
        });

        await interaction.reply({
          content: `Renamed your VC to **VC | ${name}**`,
          ephemeral: true,
        });
      })
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("lock")
      .setDescription("Lock your voice channel")
      .setFunction(async (interaction) => {
        const res = await runChecks(interaction);
        if (!res.pass) return;
        const { channel } = res;

        const permissions: {
          id: string;
          allow?: bigint[];
          deny?: bigint[];
        }[] = channel.members.map((member) => ({
          id: member.id,
          allow: [PermissionsBitField.Flags.Connect],
        }));

        permissions.push({
          id: channel.guild.id,
          deny: [PermissionsBitField.Flags.Connect],
        });

        await channel.edit({
          permissionOverwrites: permissions,
        });

        await interaction.reply({
          content: `Locked **${channel.name}**`,
          ephemeral: true,
        });
      })
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("unlock")
      .setDescription("Unlock your voice channel")
      .setFunction(async (interaction) => {
        const res = await runChecks(interaction);
        if (!res.pass) return;
        const { channel } = res;

        await channel.edit({
          permissionOverwrites: channel.permissionOverwrites.cache.map((overwrite) => {
            if (overwrite.id === channel.guild.id) {
              return {
                id: overwrite.id,
                allow: [PermissionsBitField.Flags.Connect],
              };
            }
            return overwrite;
          }),
        });

        await interaction.reply({
          content: `Unlocked **${channel.name}**`,
          ephemeral: true,
        });
      })
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("hide")
      .setDescription("Hides and locks your voice channel")
      .setFunction(async (interaction) => {
        const res = await runChecks(interaction);
        if (!res.pass) return;
        const { channel } = res;

        const permissions: {
          id: string;
          allow?: bigint[];
          deny?: bigint[];
        }[] = channel.members.map((member) => ({
          id: member.id,
          allow: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.ViewChannel],
        }));

        permissions.push({
          id: channel.guild.id,
          deny: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.ViewChannel],
        });

        await channel.edit({
          permissionOverwrites: permissions,
        });

        await interaction.reply({
          content: `Hid and locked **${channel.name}**`,
          ephemeral: true,
        });
      })
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("show")
      .setDescription("Shows your voice channel (does not unlock)")
      .setFunction(async (interaction) => {
        const res = await runChecks(interaction);
        if (!res.pass) return;
        const { channel } = res;

        await channel.permissionOverwrites.set(
          new Collection<string, OverwriteResolvable>().set(channel.guildId, {
            allow: [PermissionsBitField.Flags.ViewChannel],
            id: channel.guildId,
          })
        );

        await interaction.reply({
          content: `Made **${channel.name}** visible`,
          ephemeral: true,
        });
      })
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("add")
      .setDescription("Allow a user to join your voice channel when locked/hidden")
      .addUserOption((option) =>
        option.setName("user").setDescription("The user to add to your voice channel.").setRequired(true)
      )
      .setFunction(async (interaction) => {
        const user = interaction.options.getUser("user", true);
        const res = await runChecks(interaction);
        if (!res.pass) return;
        const { channel } = res;

        await channel.permissionOverwrites.set(
          new Collection<string, OverwriteResolvable>().set(user.id, {
            allow: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.ViewChannel],
            id: user.id,
          })
        );

        await interaction.reply({
          content: `Allowed **${user.tag}** to join **${channel.name}**`,
          ephemeral: true,
        });
      })
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("remove")
      .setDescription("Remove a user from your voice channel")
      .addUserOption((option) =>
        option.setName("user").setDescription("The user to remove from your voice channel.").setRequired(true)
      )
      .setFunction(async (interaction) => {
        const user = interaction.options.getUser("user", true);
        const res = await runChecks(interaction);
        if (!res.pass) return;
        const { channel } = res;

        await channel.permissionOverwrites.delete(user.id);
        
        if (channel.members.has(user.id)) {
          await channel.members.get(user.id)?.voice.setChannel(null);
        }

        await interaction.reply({
          content: `Removed **${user.tag}** from **${channel.name}**`,
          ephemeral: true,
        });
      })
  );

export default Command;

function isTempChannel(channel: VoiceBasedChannel) {
  return channel.name.startsWith("VC | ");
}

async function runChecks(interaction: ChatInputCommandInteraction): Promise<
  | {
      channel: VoiceBasedChannel;
      member: GuildMember;
      pass: true;
    }
  | {
      pass: false;
    }
> {
  const member = interaction.member;
  if (!member || !(member instanceof GuildMember)) return { pass: false };

  const channel = member.voice.channel;
  if (!channel) {
    await interaction.reply({
      content: "You are not in a voice channel",
      ephemeral: true,
    });
    return { pass: false };
  }

  if (!isTempChannel(channel)) {
    await interaction.reply({
      content: "You can only show temporary voice channels",
      ephemeral: true,
    });
    return { pass: false };
  }

  return {
    channel,
    member,
    pass: true,
  };
}
