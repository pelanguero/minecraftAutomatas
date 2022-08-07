import mineflayer from "mineflayer";
import customStartLoader from "@/custom_start/custom"

require("module-alias/register");

import botWebsocket from "@/modules/botWebsocket";
import mcDataLoader from 'minecraft-data'
import { Bot } from "./types";

export type Props = {
  botName?: string;
  botPassword?: string;
  server: string;
  port?: number;
  customStart?: boolean,
  version?: string
}


export const createNewBot = (props: Props): Bot => {
  const {
    botName = 'Legion',
    botPassword,
    server,
    port = 25565,
    customStart = false,
    version = undefined
  } = props

  const bot = mineflayer.createBot({
    username: botName,
    host: server,
    port: port,
    version
  }) as Bot;

  botWebsocket.loadBot(bot);
  bot.setMaxListeners(0);
  bot.once("inject_allowed", () => {
    bot.loadPlugin(require("mineflayer-pathfinder").pathfinder);
    const mcData = mcDataLoader(bot.version)
    mcData.blocksArray[826].hardness = 3 // hotfix until wait a final relase
    mcData.blocksArray[274].boundingBox = 'block' // hot fix for cross the portal of the end
    console.log('\x1b[33m%s\x1b[0m', 'Injected pathfinder');
  });

  bot.once("kicked", (reason: string) => {
    const reasonDecoded = JSON.parse(reason);
    console.log(reasonDecoded);
    process.exit();
  });

  bot.once("error", (error) => {
    botWebsocket.log("Error bot detected " + JSON.stringify(error));
    console.log(error);
    process.exit();
  });

  bot.once("spawn", () => {
    console.log('\x1b[33m%s\x1b[0m', bot.version);
    bot.chat(`/login ${botPassword}`)
    botWebsocket.connect();
    botWebsocket.log("Ready!");

    if (customStart) {
      const { start } = customStartLoader(bot);
      start().then(() => {
        require("@NestedStateModules/startStateMachine")(bot);
      });
    } else {
      require("@NestedStateModules/startStateMachine")(bot);
    }
  });

  return bot;
}
