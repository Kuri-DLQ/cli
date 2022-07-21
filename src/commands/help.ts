import {Command} from '@oclif/core'

export default class World extends Command {
  async run(): Promise<void> {
    this.log('Commands:')
    this.log("'init' -- initialize your Kuri application\n")
    this.log("'deploy' -- deploy your Krui infrastructure, after initializing it\n")
    this.log("'join' -- if you have selected 'DLQ Only' use this command after deploying to join your exising main queue to the new DLQ\n")
    this.log("'help' -- view list of commands\n")
    this.log('Note: All commands must be prefixed with "Kuri"')
  }
}
