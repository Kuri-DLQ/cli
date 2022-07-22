import {Command} from '@oclif/core'
import { throws } from 'assert';
import { Console } from 'console';
const express = require('express');

export default class WorlApid extends Command {
 
  async run(): Promise<void> {
    try {
      const app = express();
      app.get('/', (req: any, res: any) => {
        res.send('Hello world')
      })

      app.listen(5001, () => console.log('API server running on port 5001'))
    } catch (err) {
      this.log('Error from api: ', err)
    }
  }
}
