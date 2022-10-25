import chalk from "chalk";
import { RESTPostAPIApplicationCommandsJSONBody, Routes, REST, Collection, Client } from "discord.js";
import { bot } from "..";
import { CustomCommandBuilder } from "./loaderTypes";
import CommandBuilder from "./objects/customSlashCommandBuilder";

interface Command {
  default: CommandBuilder;
}

export default class CommandLoader {
  public client: Client;
  public commands: Collection<string, CustomCommandBuilder> = new Collection();

  constructor(client: Client) {
    this.client = client;
  }

  async load(commands: CustomCommandBuilder[]) {
    const applicationId = this.client.application?.id ?? this.client.user?.id ?? "unknown";

    // find duplicate command names, and determine if they are the same module (tsc compiler bug), or different modules (ovelapping command names)

    const duplicateCommandNames = commands.filter((command, index, self) => {
      return self.findIndex((c) => c.getName() === command.getName()) !== index;
    });

    if (duplicateCommandNames.length > 0) {
      // check if the duplicate commands are from the same module

      const duplicateCommandNamesFromSameModule = commands.filter((command, index, self) => {
        return (
          self.findIndex(
            (c) => c.getModule() === command.getModule() && c.getName() === command.getName()
          ) !== index
        );
      });

      if (duplicateCommandNamesFromSameModule.length > 0) {
        console.log(
          chalk.red(
            `Duplicate command names found in module ${duplicateCommandNamesFromSameModule[0].getModule()}: ${duplicateCommandNamesFromSameModule}\nAttempting to remove duplicate commands...`
          )
        );

        // delete the `dist` folder and recompile the bot

        const { exec, spawn } = require("child_process");
        exec("rm -rf dist", () => {
          console.log("Deleted dist folder, recompiling...");
          exec("tsc", () => {
            console.log("Recompiled successfully, restarting...");

            bot.restart();
          });
        });
      } else {
        const duplicateCommandNamesString = duplicateCommandNames
          .map((command) => command.getName())
          .join(", ");
        console.log(
          chalk.red(
            `Duplicate command names found: ${duplicateCommandNamesString}. Please rename the commands to be unique.`
          )
        );
        return;
      }
    }

    //Collect list of command files
    let commandsToDeploy: RESTPostAPIApplicationCommandsJSONBody[] = [];

    console.log(`Deploying ${commands.length} commands`);

    //Import off of the commands as modules
    for (const command of commands) {
      this.commands.set(command.getName(), command);
      commandsToDeploy.push(command.toJSON());
    }

    const rest = new REST({ version: "10" }).setToken(
      (this.client.token as string) ?? (process.env.TOKEN as string)
    );

    this.client.application?.commands.set([]);

    //Push to Discord
    if (process.env.MODE == "guild") {
      rest
        .put(Routes.applicationGuildCommands(applicationId, process.env.GUILD_ID as string), {
          body: commandsToDeploy,
        })
        .then(() => {
          console.log(`${this.commands.size} commands deployed`);
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      rest
        .put(Routes.applicationCommands(applicationId), {
          body: commandsToDeploy,
        })
        .then(() => {
          console.log(`${this.commands.size} commands deployed`);
        })
        .catch((err) => {
          console.error(err);
        });
    }

    this.showLoadedCommandCount();

    //Handle running commands, and direct them to the correct handler function
    this.client.on("interactionCreate", (interaction) => {
      // handle autocomplete
      if (interaction.isAutocomplete()) {
        const command = this.commands.get(interaction.commandName);
        if (command && command.isChatInputCommandHandler()) command.handleAutocomplete(interaction);
      }

      if (!interaction.isCommand()) return; // Ignore non-command interactions
      if (interaction.replied) return; // Ignore interactions that have already been replied to

      const command = this.commands.get(interaction.commandName);
      if (!command) return;

      if (interaction.isChatInputCommand() && command.isChatInputCommandHandler())
        return command.run(interaction);
      if (!interaction.isChatInputCommand() && !command.isChatInputCommandHandler())
        return command.run(interaction);
    });
  }

  public unload(commands: CustomCommandBuilder[]) {
    for (const command of commands) {
      this.commands.delete(command.getName());
    }

    this.load(Array.from(this.commands.values()));
  }

  public showLoadedCommandCount() {
    const commands = Array.from(this.commands.values());

    const slashCommandCount = commands.filter((command) => command.getType() == "COMMAND").length;
    const userContextCommandCount = commands.filter((command) => command.getType() == "USER").length;
    const messageContextCommandCount = commands.filter((command) => command.getType() == "MESSAGE").length;

    const unusedSlashCommands = 100 - slashCommandCount;
    const unusedUserContextCommands = 5 - userContextCommandCount;
    const unusedMessageContextCommands = 5 - messageContextCommandCount;

    const char = "•";

    console.log(
      [
        chalk.blue("Command Limits"),
        `Chat Input Commands:      [${chalk.green(char.repeat(slashCommandCount))}${chalk.red(
          char.repeat(unusedSlashCommands)
        )}]`,
        `User Context Commands:    [${chalk.green(char.repeat(userContextCommandCount))}${chalk.red(
          char.repeat(unusedUserContextCommands)
        )}]`,
        `Message Context Commands: [${chalk.green(char.repeat(messageContextCommandCount))}${chalk.red(
          char.repeat(unusedMessageContextCommands)
        )}]`,
      ].join("\n")
    );
  }
}
