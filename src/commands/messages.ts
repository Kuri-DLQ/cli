import {Command} from '@oclif/core'
const axios = require('axios');
import { argv } from 'process';

export default class Message extends Command {
  static args = [
    {name: 'id'}
  ]

  async run(): Promise<void> {
    const response = await axios.get('http://localhost:3000/table/allMessages')
    // const {args}: any = this.parse(Message);
    // if (args.id) {
    //   response.data = response.data.filter((msg: any) => msg.id === args.id)
    //   if (response.data.length === 0) {
    //     this.log('There are no message with that id.')
    //     return
    //   }
    // }


    response.data.forEach((msg:any, idx: number) => {
      this.log(`Message #${idx + 1}:`)
      this.log('Message ID: ', msg.id)
      this.log('Message Body: ', msg.Message)
      this.log('Message Attributes: ', JSON.parse(msg.Attributes))
      this.log('-------------------------------------------------------\n')
    })
  }
}
