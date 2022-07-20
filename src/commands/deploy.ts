import {Command, CliUx} from '@oclif/core'
import { SetQueueAttributesCommand, SQSClient} from  "@aws-sdk/client-sqs";
const {exec} = require('child_process');
require("dotenv").config();

const joinDLQtoMainQueue = async (mainURL: string, dlqARN: string) => {
  const sqsClient = new SQSClient({ region: process.env.REGION });

  const params = {
    Attributes: {
      RedrivePolicy:
        `{"deadLetterTargetArn":"${dlqARN}",` +
        '"maxReceiveCount":"3"}',
    },
    QueueUrl: `${mainURL}`,
  };

  try {
    const data = await sqsClient.send(new SetQueueAttributesCommand(params));
    console.log("Success", data);
  } catch (err) {
    console.log("Error", err);
  }
}

const infrastructureScript = process.env.STACK === 'DLQ only' ? 'deployDLQInfrastructure' : 'deployMainInfrastructure'

export default class Deploy extends Command {
  async run(): Promise<void> {
    await new Promise((resolve, reject) => { 
      CliUx.ux.action.start('Deploying AWS Infrastructure...')
      exec(`npm run ${infrastructureScript}`, (error:any, stdout:any, stderr:any) => {
      if (error) {
        console.log(error)
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
      resolve('cdk deployed')
    })
  }).then(async () => {
    if (process.env.STACK === 'DLQ Only') {
      const mainQueueUrl = await CliUx.ux.prompt('What is the URL of your main queue?')
      const dlqQueueArn = await CliUx.ux.prompt('What is the ARN of your newly provisioned DLQ?')
      await joinDLQtoMainQueue(mainQueueUrl, dlqQueueArn)    
    }
  });
  }
}