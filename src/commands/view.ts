import {Command, CliUx} from '@oclif/core'
const {execSync} = require('child_process');
const axios = require('axios')
require("dotenv").config();


  // let killPorts = new Promise(async (reject, resolve) => {
  //   exec('npm run stopDashboard', (error:any, stdout:any, stderr:any) => {
  //     if (error) {
  //       console.log(`error: ${error.message}`)
  //       reject(error)
  //       return;
  //     }
  //     if (stderr) {
  //       // console.log(`stderr: ${stderr}`);
  //       return
  //     }
  //     // console.log(`stdout: ${stdout}`);
  //     setTimeout(() => resolve('ports killed'), 20000);
  //   })
  // })

  // let startServer = new Promise((reject, resolve) => {
  //   exec('npm run startServer', (error:any, stdout:any, stderr:any) => {
  //     if (error) {
  //       console.log(`error: ${error.message}`)
  //       reject(error)
  //       return;
  //     }
  //     if (stderr) {
  //       // console.log(`stderr: ${stderr}`);
  //       return
  //     }
  //     // console.log(`stdout: ${stdout}`);
  //     resolve('server started')
  //   })
  // })

  // let startDashboard = new Promise((reject, resolve) => {
  //   exec('npm run startDashboard', (error:any, stdout:any, stderr:any) => {
  //     if (error) {
  //       console.log(`error: ${error.message}`)
  //       reject(error)
  //       return;
  //     }
  //     if (stderr) {
  //       // console.log(`stderr: ${stderr}`);
  //       return
  //     }
  //     // console.log(`stdout: ${stdout}`);
  //     resolve('dashboard started')
  //   })
  // })

  const exec_options = {
    cwd: null,
    env: null,
    encoding: 'utf8',
    timeout: 30000,
    maxBuffer: 200 * 1024,
    killSignal: 'SIGTERM'
  }

export default class View extends Command {
  async run() {
    // try {
    //   await axios('http://localhost:3000/killServer')
    // } catch (err) {
    //   console.log('The server was not started');
    // }

    // execSync('npm run stopDashboard')
    try {
      execSync('npx kill-port 5001 && npx kill-port 3000', exec_options)
    } catch (err) {
      console.log('KILL SERVER ERROR', err)
    }

    try {
      execSync('npm run startDashboard', exec_options)
    } catch (err) {
      console.log('DASHBOARD ERROR', err)
    }

    try {
      execSync('npm run startServer', exec_options)
    } catch (err) {
      console.log('SERVER ERROR', err)
    }
    // await killPorts.then(async () => {
    //   await startServer.then(async () => {
    //     await startDashboard
    //   })
    // })
  }
}