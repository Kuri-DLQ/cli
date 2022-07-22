import {Command, CliUx} from '@oclif/core'
import { exec } from 'child_process';
const exec_options = {
  timeout: 0
}
export default class View extends Command {
  async run() {
    exec('npm run startServerAndDashboard', exec_options)
  }
}