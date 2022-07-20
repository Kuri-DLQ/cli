import {Command, CliUx} from '@oclif/core'
import { SetQueueAttributesCommand, SQSClient} from  "@aws-sdk/client-sqs";
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

export default class Join extends Command {
  async run(): Promise<void> {
    const mainURL = await CliUx.ux.prompt('What is your main queue URL?')
    const dlqARN = await CliUx.ux.prompt('What is the ARN of your newly provisioned DLQ?')
    await joinDLQtoMainQueue(mainURL, dlqARN).then(() => this.log("DLQ succesfully joined to main queue"))
  } 
}