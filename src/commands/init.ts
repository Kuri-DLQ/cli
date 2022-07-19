import {Command, CliUx} from '@oclif/core'
const inquirer = require('inquirer')
const fs = require('fs-extra')
const {series} = require('async');
const {exec, execFile} = require('child_process');
require("dotenv").config();

const src: string = '.env'
const serverDest: string = '../app_server_express/.env'
const cdkDest: string = '../aws_infrastructure/.env'
// import Ora from 'ora';

// function bootstrap() {
//   const child = spawn('npm run bootstrapAWS')
//   child.stdout.on('data', (data:any) => {
//     console.log(`stdout: ${data}`)
//   })
//   child.stderr.on('data', (data:any) => {
//     console.log(`stderr: ${data}`)
//   })
//   child.on('error', (error:any) => console.log(`error: ${error.message}`))
//   child.on('exit', (code:any, signal:any) => {
//     if (code) console.log(`process exit with code: ${code}`)
//     if (signal) console.log(`process killed with signal: ${signal}`)
//     console.log(`Done`)
//   })
// }
async function moveEnvFile (source: string, destination: string) {
  try {
    await fs.move(source, destination)
    console.log('success!')
  } catch (err) {
    console.error(err)
  };
}

// const deployCdk = (stackChoice: string | undefined) => {
//   if (stackChoice === 'DLQ Only') {
//     series([() => exec('cdk deploy <dlq only stack>')]);
//   } else {
//     series([() => exec('cdk deploy <main and dlq stack>')]);
//   }
// }

export default class Init extends Command {
  static description = 'Initializes Kuri infrastructure'

  async run(): Promise<void> {
    let stackChoice: any = await inquirer.prompt([{
      name: 'stack',
      message: 'Choose a starting template',
      type: 'list',
      choices: [{name: 'Main Queue and DLQ'}, {name: 'DLQ only'}],
    }])
    stackChoice = stackChoice.stack

    const awsAccessKey = await CliUx.ux.prompt('What is your AWS ACCESS KEY?')
    const awsSecretKey = await CliUx.ux.prompt('What is your AWS SECRET KEY?')
    const awsRegion = await CliUx.ux.prompt('What is your AWS Region?')
    let slackPath = false
    const useSlack: any = await inquirer.prompt([{
      name: 'slack',
      type: 'confirm',
      message: 'Would you like to see DLQ notifications in Slack?',
    }])

    if (useSlack.slack === true) {
      slackPath = await CliUx.ux.prompt('What is your Slack webhook path?')
    }

    let serverPort: any = await inquirer.prompt([{
      name: 'port',
      type: 'input',
      default: '5000',
      message: 'Which port would you like the Kuri server to run on?',
    }])
    serverPort = serverPort.port

    let clientPort: any = await inquirer.prompt([{
      name: 'port',
      type: 'input',
      default: '3000',
      message: 'Which port would you like the Kuri server to run on?',
    }])
    clientPort = clientPort.port

    this.log(stackChoice, awsAccessKey, awsSecretKey, awsRegion, slackPath, serverPort, clientPort)

    const envFile = `STACK="${stackChoice}"\nACCESS_KEY="${awsAccessKey}"\nSECRET_KEY="${awsSecretKey}"\n` +
    `REGION="${awsRegion}"\nSLACK_PATH="${slackPath}"\nCLIENT_PORT=${clientPort}\nSERVER_PORT=${serverPort}`

     // installClientDependencies when client dir is added
    
    // fs.writeFile('.env', envFile, (e: any) => {
    //   console.log(e)
    // })
    // await moveEnvFile(src, serverDest)


    fs.writeFile('.env', envFile, (e: any) => {
      console.log(e)
    })
    await moveEnvFile(src, cdkDest)
    // deployCdk(process.env.STACK)


    await exec('npm run installCdkDependencies')
    await new Promise((resolve, reject) => {
      exec('npm run bootstrapAWS', (error:any, stdout:any, stderr:any) => {
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
        resolve('environemnt bootstrapped')
      })
    }).then(async () => {
      await new Promise((resolve, reject) => { 
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
        resolve('cdk deployed')
      })
    });
    })
    // await exec('npm run deployInfrastructure', (error:any, stdout:any, stderr:any) => {
    //   if (error) {
    //     console.log(error)
    //     console.log(`error: ${error.message}`)
    //     return;
    //   }
    //   if (stderr) {
    //     console.log(`stderr: ${stderr}`);
    //     return
    //   }
    //   console.log(`stdout: ${stdout}`);
    // })
    // await exec('npm run installAppDependencies'), 
    // series([() => exec('npm run installCdkDependencies'),
    // () => exec('npm run bootstrapAWS', (error:any, stdout:any, stderr:any) => {
    //   if (error) {
    //     console.log(error)
    //     console.log(`error: ${error.message}`)
    //     return;
    //   }
    //   if (stderr) {
    //     console.log(`stderr: ${stderr}`);
    //     return
    //   }
    //   console.log(`stdout: ${stdout}`);
    // }),
    // () => exec('npm run deployInfrastructure', (error:any, stdout:any, stderr:any) => {
    //   if (error) {
    //     console.log(error)
    //     console.log(`error: ${error.message}`)
    //     return;
    //   }
    //   if (stderr) {
    //     console.log(`stderr: ${stderr}`);
    //     return
    //   }
    //   console.log(`stdout: ${stdout}`);
    // })])
  }
}