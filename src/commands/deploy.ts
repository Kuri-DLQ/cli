import {Command, CliUx} from '@oclif/core'
import { SetQueueAttributesCommand, SQSClient} from  "@aws-sdk/client-sqs";
const {exec, execFile} = require('child_process');
require("dotenv").config();
import { AwsCdkExec } from 'aws-cdk-exec';

const kuriLogo = 
"██╗  ██╗██╗   ██╗██████╗ ██╗\n" +
"██║ ██╔╝██║   ██║██╔══██╗██║\n" +
"█████╔╝ ██║   ██║██████╔╝██║\n" +
"██╔═██╗ ██║   ██║██╔══██╗██║\n" +
"██║  ██╗╚██████╔╝██║  ██║██║\n" +
"╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝\n"

// const deployInfrastructure = (context: any) => {
//   return new Promise((resolve, reject) => { 
//     CliUx.ux.action.start('Deploying AWS Infrastructure...')
//     exec(`npm run ${infrastructureScript}`, (error:any, stdout:any, stderr:any) => {
//     if (error) {
//       context.log(`error: ${error.message}`)
//       reject(error)
//       return;
//     }
//     if (stderr) {
//       // console.log(`stderr: ${stderr}`);
//       return
//     }
//     // console.log(`stdout: ${stdout}`);      
//     CliUx.ux.action.stop('AWS Infrastructure deployed.')
//     setTimeout(() => resolve('cdk deployed'), 120000)
//   })    
//   })
// } 

// const postDeploymentLogs = (context: any) => {
//   return new Promise((resolve, reject) => {
//     context.log(kuriLogo)
//     resolve('AWS Infrastructure deployed!')
//   })
// }

// const addEnvVariables = (context: any) => {
//   return new Promise((resolve, reject) => {
//     execFile('./add_env_variables.mjs', (error: any, stdout:any, stderr:any) => {
//       if (error) {
//         context.log('add_env_variables error: ', error)
//       }

//       if (stderr) {
//         context.log('stderr: ', stderr)
//       }

//       context.log('stdout: ', stdout)
//       setTimeout(() => resolve('add_env_variables complete'), 2000)
//     })  
//   })
// }

// const scriptsToRun = [deployInfrastructure, postDeploymentLogs]
const stackName = process.env.STACK === 'DLQ only' ? 'DlqOnlyStack' : 'MainQueueAndDLQStack'
const infrastructureScript = process.env.STACK === 'DLQ only' ? 'deployDLQInfrastructure' : 'deployMainInfrastructure'

export default class Deploy extends Command {
  async run(): Promise<void> {
    const cdkApp = new AwsCdkExec({ appCommand: `"npm run ${infrastructureScript}"`});
    CliUx.ux.action.start('Deploying AWS Infrastructure...')
    await cdkApp.deploy(stackName);
    await CliUx.ux.action.stop('AWS Infrastructure deployed.')
    await this.log(kuriLogo)
  }

}

// need to find a way to run the add_env_variables file AFTER the whole infrastructure has been deployed