import { createRole } from '../../sdk_infrastructure/aws/IAM/createRole.js'
import { createMainQueue } from "../../sdk_infrastructure/aws/sqs/createMainQueue.js"
import { createDLQ } from "../../sdk_infrastructure/aws/sqs/createDLQ.js"
import { joinDlqMain } from "../../sdk_infrastructure/aws/sqs/join-dlq-main.js"
import { createTopic } from "../../sdk_infrastructure/aws/sns/createTopic.js"
import { createTable } from "../../sdk_infrastructure/aws/dynamodb/createDynamoTable.js"
import { createBucket } from "../../sdk_infrastructure/aws/s3/createBucket.js"
import { setEnvVariables } from "../../sdk_infrastructure/utils/replaceEnvVariables.js"
import { createZipFiles } from "../../sdk_infrastructure/aws/lambda/createZipFile.js"
import { pushLambdasToS3 } from "../../sdk_infrastructure/aws/s3/pushLambdasToS3.js"
import { createLambdas } from "../../sdk_infrastructure/aws/lambda/createAllLambdas.js"
import { setEventSourceMapping } from "../../sdk_infrastructure/aws/lambda/lambdaEventSourceMapping.js"
import { subscribeToSns } from "../../sdk_infrastructure/aws/lambda/subscribeToSns.js"
import { addPermissions } from "../../sdk_infrastructure/aws/lambda/addPermissions.js"
const bucketName = 'kuri-dlq-bucket-arjun'
import log from '../utils/logger.js'

const kuriLogo = "\n" +
"██╗  ██╗██╗   ██╗██████╗ ██╗\n" +
"██║ ██╔╝██║   ██║██╔══██╗██║\n" +
"█████╔╝ ██║   ██║██████╔╝██║\n" +
"██╔═██╗ ██║   ██║██╔══██╗██║\n" +
"██║  ██╗╚██████╔╝██║  ██║██║\n" +
"╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝\n"

export const deploy = async () => {
  let spinner;

  try {
    spinner = log.spin('Creating IAM Role...')
    await createRole()
    spinner.succeed();

    if (process.env.STACK === 'Main Queue and DLQ') {
      spinner = log.spin('Creating Main Queue...')
      await createMainQueue()
      spinner.succeed();
    }

    spinner = log.spin('Creating DLQ...')
    await createDLQ()
    spinner.succeed();

    spinner = log.spin('Joining Main Queue and DLQ...')
    await joinDlqMain()
    spinner.succeed();

    spinner = log.spin('Creating SNS Topic...')
    await createTopic()
    spinner.succeed();

    spinner = log.spin('Creating Dynamo Table...')
    await createTable()
    spinner.succeed();

    spinner = log.spin('Creating S3 Bucket...')
    await createBucket(bucketName).then(() => spinner.succeed())

    spinner = log.spin('Replacing env variables...')
    await setEnvVariables().then(() => spinner.succeed())

    spinner = log.spin('Creating Zip Files...')
    await createZipFiles().then(() => spinner.succeed())

    spinner = log.spin('Pushing Lambda Handlers to S3 Bucket...')
    await pushLambdasToS3(bucketName).then(() => spinner.succeed())

    spinner = log.spin('Creating all Lambdas...')
    await createLambdas(bucketName).then(() => spinner.succeed())

    spinner = log.spin('Setting Event Source Mapping for publishing to SNS...')
    await setEventSourceMapping()
    spinner.succeed()

    spinner = log.spin('Subscribing Lambdas to SNS...')
    await subscribeToSns()
    spinner.succeed();;

    spinner = log.spin('Adding permissions for SNS...')
    await addPermissions()
    spinner.succeed();
  } catch (err) {
    spinner.fail()
    console.log(err)
  } finally {
    console.log(kuriLogo)
  }
};