import {Command, CliUx} from '@oclif/core'
import { SetQueueAttributesCommand, SQSClient} from  "@aws-sdk/client-sqs";
const {exec} = require('child_process');
require("dotenv").config();

const kuriLogo = 
"██╗  ██╗██╗   ██╗██████╗ ██╗\n" +
"██║ ██╔╝██║   ██║██╔══██╗██║\n" +
"█████╔╝ ██║   ██║██████╔╝██║\n" +
"██╔═██╗ ██║   ██║██╔══██╗██║\n" +
"██║  ██╗╚██████╔╝██║  ██║██║\n" +
"╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝\n"

const infrastructureScript = process.env.STACK === 'DLQ only' ? 'deployDLQInfrastructure' : 'deployMainInfrastructure'

export default class Deploy extends Command {
  async run(): Promise<void> {
    await new Promise((resolve, reject) => { 
      CliUx.ux.action.start('Deploying AWS Infrastructure...')
      exec(`npm run ${infrastructureScript}`, (error:any, stdout:any, stderr:any) => {
      if (error) {
        console.log(`error: ${error.message}`)
        reject(error)
        return;
      }
      if (stderr) {
        // console.log(`stderr: ${stderr}`);
        return
      }
      // console.log(`stdout: ${stdout}`);      
      resolve('cdk deployed')
    })    
  }).then(() => {
    CliUx.ux.action.stop('AWS Infrastructure deployed.')
    this.log(kuriLogo)
  });
  }
}

// need to find a way to run the add_env_variables file AFTER the whole infrastructure has been deployed