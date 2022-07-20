import {Command, CliUx} from '@oclif/core'
const {exec} = require('child_process');
export default class World extends Command {

  async run(): Promise<void> {
    await new Promise((resolve, reject) => { 
      CliUx.ux.action.start('Deploying AWS Infrastructure...')
      exec('npm run deployInfrastructure', (error:any, stdout:any, stderr:any) => {
      if (error) {
        console.log(error)
        console.log(`error: ${error.message}`)
        reject(error)
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return
      }
      console.log(`stdout: ${stdout}`);
      CliUx.ux.action.stop('AWS Infrastructure deployed.')
      resolve('cdk deployed')
    })
  });
  }
}
