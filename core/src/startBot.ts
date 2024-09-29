import path from 'path'
import { exec } from "child_process";
import { spawn } from 'child_process';
import { autoRestart, environment } from "@/config";
import { Logger } from 'winston';
import { stringify } from 'uuid';



export const startBot = (botName: string, logsPath: string,logLevel: string,logger:Logger,online:boolean  ,password?: string) => {

    
    const process = environment === 'stage' ? spawn("npm",["run","ts",botName,password??""]) :  spawn("node",[path.join(__dirname, 'start_bot.js'),botName,logsPath,logLevel,String(online),password??""])
    
    //logger.info(command)
    

    process.stdout.on('data', (data) => {
        logger.info(`output from: ${botName} ${data}`)
    });
    
    process.stderr.on('data', (data) => {
        logger.error(`error from: ${botName} ${data}`)
    });
    
    process.on('close', (code) => {
        logger.info(`${botName} closed: ${code}`)
    });
}