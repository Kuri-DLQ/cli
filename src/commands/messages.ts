import {Command} from '@oclif/core'
const axios = require('axios');

export default class Messages extends Command {
  static args = [
    {name: 'id'}
  ]

  async run(): Promise<void> {
    const response = await axios.get('http://localhost:3000/table/allMessages')
    const id =  process.argv[3]
    
    if (id) {
      response.data = response.data.filter((msg: any) => msg.id === id)
      if (response.data.length === 0) {
        this.log('There is no message with that id')
        return
      }
    }


    response.data.forEach((msg:any, idx: number) => {
      this.log('Message ID: ', msg.id)
      this.log('Message Body: ', msg.Message)
      this.log('Message Attributes: ', JSON.parse(msg.Attributes))
      this.log('-------------------------------------------------------\n')
    })
  }
}
