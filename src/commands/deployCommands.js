const {CliUx} = require('@oclif/core')
const {exec, execFile} = require('child_process');
require("dotenv").config();

const kuriLogo = 
"██╗  ██╗██╗   ██╗██████╗ ██╗\n" +
"██║ ██╔╝██║   ██║██╔══██╗██║\n" +
"█████╔╝ ██║   ██║██████╔╝██║\n" +
"██╔═██╗ ██║   ██║██╔══██╗██║\n" +
"██║  ██╗╚██████╔╝██║  ██║██║\n" +
"╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝\n"

const infrastructureScript = process.env.STACK === 'DLQ only' ? 'DlqOnlyStack' : 'deployMainInfrastructure'

const deployInfrastructure = () => {
  return new Promise((resolve, reject) => { 
    CliUx.ux.action.start('Deploying AWS Infrastructure...')
    exec(`npm run ${infrastructureScript}`, (error, stdout, stderr) => {
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
    CliUx.ux.action.stop('AWS Infrastructure deployed.')
    setTimeout(() => resolve('cdk deployed'), 120000)
  })    
  })
} 

const postDeploymentLogs = () => {
  return new Promise((resolve, reject) => {
    console.log(kuriLogo)
    resolve('AWS Infrastructure deployed!')
  })
}

const addEnvVariables = () => {
  return new Promise((resolve, reject) => {
    execFile('./add_env_variables.mjs', (error, stdout, stderr) => {
      if (error) {
        console.log('add_env_variables error: ', error)
      }

      if (stderr) {
        console.log('stderr: ', stderr)
      }

      console.log('stdout: ', stdout)
      setTimeout(() => resolve('add_env_variables complete'), 2000)
    })  
  })
}

const scriptsToRun = [deployInfrastructure, postDeploymentLogs]

const result = scriptsToRun.reduce((prevPr, currArg) => {
  return prevPr.then((acc) => {
    let promise = currArg()
    promise.then((resp) => {
      if (!acc) {
        acc = []
        acc.push(resp)
        return acc
      }
      console.log(acc)
      return [...acc, resp]
    })
  });
}, Promise.resolve([]))

result.then(console.log)