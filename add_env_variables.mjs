import fs from 'fs-extra';
import dotenv from "dotenv"
dotenv.config();
import { DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { SQSClient, ListQueuesCommand, GetQueueUrlCommand, GetQueueAttributesCommand } from  "@aws-sdk/client-sqs";
const REGION = process.env.REGION

const ddbClient = new DynamoDBClient({ region: REGION });
const sqsClient = new SQSClient({ region: REGION });

const tableRegex = new RegExp(/(DlqOnlyStack|MainQueueAndDLQStack)-kuriDB/);
const dlqURLRegex = new RegExp(/DlqOnlyStack-DLQ/);
const mainQueueURLRegex = new RegExp(/(MainQueueAndDLQStack|DlqOnlyStack)-DLQ/);

export const addEnvVariables = async () => {
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

  const envFile = `QUEUE_URL="${mainQueueURL}"\nDLQ_ARN="${dlqARN}"\nTABLE_NAME="${tableName}"`
  fs.appendFile('../../app_server_express/.env', envFile)
};
addEnvVariables();
