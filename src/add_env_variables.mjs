import fs from 'fs-extra';
import dotenv from "dotenv"
dotenv.config();

import { DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { SQSClient, ListQueuesCommand, GetQueueUrlCommand, GetQueueAttributesCommand } from  "@aws-sdk/client-sqs";
const REGION = process.env.REGION

const ddbClient = new DynamoDBClient({ region: REGION });
const sqsClient = new SQSClient({ region: REGION });

const tableRegex = new RegExp(/(DlqOnlyStack|MainQueueAndDLQStack)-kuriDB/);
const dlqURLRegex = new RegExp(/DlqOnlyStack-DLQ/); // change to DLQOnly
const mainQueueURLRegex = new RegExp(/(MainQueueAndDLQStack|DlqOnlyStack)-DLQ/);

export const run = async () => {
  try {
    const tableData = await ddbClient.send(new ListTablesCommand({}));
    const tableName = tableData.TableNames.find(name => {
      return tableRegex.test(name);
    })
    const queueData = await sqsClient.send(new ListQueuesCommand({}));
    const dlqURL = queueData.QueueUrls.find(url => {
      return dlqURLRegex.test(url);
    });
    const mainQueueURL = queueData.QueueUrls.find(url => {
      return mainQueueURLRegex.test(url);
    })
    const dlqARN = await (await sqsClient.send(new GetQueueAttributesCommand({ QueueUrl: dlqURL, AttributeNames: ['QueueArn']}))).Attributes.QueueArn;
    console.log(mainQueueURL);
  } catch (err) {
    console.error(err);
  }
};
run();

// const params = {
//   QueueUrl: 'https://sqs.us-east-1.amazonaws.com/316445519374/TestingQ',
//   AttributeNames: ['QueueArn']
// }

// const command = new GetQueueAttributesCommand(params);

// const run = async () => {
//   try {
//     const data = await sqsClient.send(command);
//     const arn = data.Attributes.QueueArn;
//     console.log('ARN:', arn)
//   } catch (e) {
//     console.log(e);
//   }
// }