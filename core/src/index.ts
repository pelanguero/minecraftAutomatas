import { botType } from "base-types";
import { startBot } from "@/startBot";
import { connectCore } from "@/modules";
import { botsToStart as botsToStartEnv, logsPath } from "@/config";
import { logLevel as logLevelEnv } from "@/config";
import { logsPath as logsPathEnv } from "@/config";
import { createLogger, format, transports,Logger } from "winston";
import path from 'path';

const index = () => {
  
  let logger:Logger = createLogger({
      level: logLevelEnv,
      format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message }) => {
          return `${timestamp} ${level}: ${message}`;
        })
      ),
      transports: [
        new transports.Console(),
        new transports.File({ filename: path.join(logsPathEnv??__dirname, 'controltower.log') })
      ],
    });
  

  connectCore()

  const botsToStart: botType[] = [];

  if (botsToStartEnv) {
    const botsToStartEnvArray = botsToStartEnv.split(',');
    botsToStartEnvArray.forEach((bot) => {
      botsToStart.push({ username: bot });
    });
  }

  let i = 0;
  function runNextBot() {
    const botToStart = botsToStart[i];
    i++;
    if (i <= botsToStart.length) {
      setTimeout(() => {
        startBot(botToStart.username,logsPathEnv??__dirname,logLevelEnv??"debug",logger);
        runNextBot();
      }, 7000);
    }
  }

  runNextBot();
};


index()