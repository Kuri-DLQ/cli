import fs from 'fs-extra';
import dotenv from "dotenv"
dotenv.config();

import { DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { SQSClient, ListQueuesCommand } from  "@aws-sdk/client-sqs";
const REGION = process.env.REGION

ddbClient = new DynamoDBClient({ region: REGION });
sqsClient = new SQSClient({ region: REGION });

export const run = async () => {
  try {
    const data = await ddbClient.send(new ListTablesCommand({}));
    console.log(data);
    // console.log(data.TableNames.join("\n"));
    return data;
  } catch (err) {
    console.error(err);
  }
};
run();