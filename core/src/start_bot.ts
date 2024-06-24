import config from "@/config";
const { server, port, customStart } = config

import { createNewBot, Props } from "./createNewBot"

const botConfig: Props = {
    server,
    port,
    customStart,
    botPassword: process.argv[5],
    botName: process.argv[2],
    logRoute: process.argv[3],
    logLevel: process.argv[4]
}

export const bot = createNewBot(botConfig)