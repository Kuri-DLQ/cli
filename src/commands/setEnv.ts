import {Command} from '@oclif/core'
const {exec, execFile} = require('child_process');

const kuriLogo = 
"██╗  ██╗██╗   ██╗██████╗ ██╗\n" +
"██║ ██╔╝██║   ██║██╔══██╗██║\n" +
"█████╔╝ ██║   ██║██████╔╝██║\n" +
"██╔═██╗ ██║   ██║██╔══██╗██║\n" +
"██║  ██╗╚██████╔╝██║  ██║██║\n" +
"╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝\n"

export default class SetEnv extends Command {

  async run(): Promise<void> {
    await exec('node add_env_variables', (error: any, stdout:any, stderr:any) => {
        if (error) {
          this.log('add_env_variables error: ', error)
        }
  
        if (stderr) {
          this.log('stderr: ', stderr)
        }
  
        this.log('stdout: ', stdout)
      }) 
      
    this.log(kuriLogo)
  }
}
