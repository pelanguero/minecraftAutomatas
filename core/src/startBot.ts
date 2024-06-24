import path from 'path'
import { exec } from "child_process"
import { autoRestart, environment } from "@/config";
import { Logger } from 'winston';



export const startBot = (botName: string, logsPath: string,logLevel: string,logger:Logger  ,password?: string) => {

    
    const command = environment === 'stage' ? `npm run ts ${botName} ${password ?? ''}` : `node ${path.join(__dirname, 'start_bot.js')} ${botName} ${logsPath} ${logLevel} ${password ?? ''}`

    exec(command, (err, stdout, stderr) => {
        if (err) {
            logger.info(`Bot broken: ${botName}`);
            logger.info(`Error: ${err}`);

            if (autoRestart) {
                setTimeout(() => {
                    startBot(botName,logsPath,logLevel, logger,password);
                }, 1000);
            }
            return;
        }

        if (stdout) {
            logger.info(`Stdout: ${stdout}`)
        }

        if (stderr) {
            logger.error(`Stderr: ${stderr}`)
        }
    })
}