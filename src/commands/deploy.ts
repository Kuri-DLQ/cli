import {Command, CliUx} from '@oclif/core'
import orchestrator from '../../../sdk_infrastructure/aws/orchestrator.js'
// import log from "../utils/logger.js"


const kuriLogo = 
"██╗  ██╗██╗   ██╗██████╗ ██╗\n" +
"██║ ██╔╝██║   ██║██╔══██╗██║\n" +
"█████╔╝ ██║   ██║██████╔╝██║\n" +
"██╔═██╗ ██║   ██║██╔══██╗██║\n" +
"██║  ██╗╚██████╔╝██║  ██║██║\n" +
"╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝\n"

export default class Deploy extends Command {
  static description = 'Deploy the Kuri infrastructure on AWS.';
  async run(): Promise<void> {
    this.log(kuriLogo)
    try {
      CliUx.ux.action.start('Creating AWS Role...')
      await orchestrator.createRole();
      CliUx.ux.action.stop() 

    } catch (err: any) {
      this.log(err)
    }
  }
}