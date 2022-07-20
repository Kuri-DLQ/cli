import {Command} from '@oclif/core'
const axios = require('axios');
export default class World extends Command {

  async run(): Promise<void> {
    const response = await axios.get('http://localhost:3000/table/allMessages')
    await this.log(response.data);
  }
}
