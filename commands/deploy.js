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
import inquirer from 'inquirer';
import fs from 'fs-extra';
import { exec } from 'child_process';
import { getQueueName } from '../../sdk_infrastructure/aws/sqs/queueName.js';
import prependFile from 'prepend-file';
import pkg from 'uuid';


const { v4: uuidv4 } = pkg;
const bucketName = `kuri-dlq-bucket-${uuidv4()}`

import log from '../utils/logger.js'
import dotenv from 'dotenv'
dotenv.config({path:'./.env'})

const src = './.env'
const serverDest = '../app_server_express/.env'
const infraDest = '../sdk_infrastructure/.env'
const clientDest = '../dashboard/.env'

async function moveEnvFile(source, destination) {
  try {
    await fs.move(source, destination)
  } catch (err) {
    console.error(err)
  };
}

const kuriLogo = "\n" +
"██╗  ██╗██╗   ██╗██████╗ ██╗\n" +
"██║ ██╔╝██║   ██║██╔══██╗██║\n" +
"█████╔╝ ██║   ██║██████╔╝██║\n" +
"██╔═██╗ ██║   ██║██╔══██╗██║\n" +
"██║  ██╗╚██████╔╝██║  ██║██║\n" +
"╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝\n"

export const deploy = async () => {
  let stackChoice = await inquirer.prompt([{
    name: 'stack',
    message: 'Choose a starting template',
    type: 'list',
    choices: [{name: 'Main Queue and DLQ'}, {name: 'DLQ only'}],
  }])
  stackChoice = stackChoice.stack
  
  let mainQueueUrl;
  if (stackChoice === 'DLQ only') {
    mainQueueUrl = await inquirer.prompt([{
      name: 'mainQueueUrl',
      message: 'Please provide your main queue url:',
      type: 'input'
    }])
    mainQueueUrl = mainQueueUrl.mainQueueUrl
  }

  let awsRegion = await inquirer.prompt([{
    name: 'region',
    type: 'input',
    message: 'What is your AWS region?',
  }])
  awsRegion = awsRegion.region;

  let slackPath = false
    const useSlack = await inquirer.prompt([{
      name: 'slack',
      type: 'confirm',
      message: 'Would you like to see DLQ notifications in Slack?',
    }])

    if (useSlack.slack === true) {
      slackPath = await inquirer.prompt([{
        name: 'slack_path',
        type: 'input',
        message: 'What is your slack path?'
      }])
      slackPath = slackPath.slack_path
    }

    let serverPort = await inquirer.prompt([{
      name: 'port',
      type: 'input',
      default: '5000',
      message: 'Which port would you like the Kuri server to run on?',
    }])
    serverPort = serverPort.port

    let clientPort = await inquirer.prompt([{
      name: 'port',
      type: 'input',
      default: '3000',
      message: 'Which port would you like the Kuri client to run on?',
    }])
    clientPort = clientPort.port

    let envFile = `STACK="${stackChoice}"\n` +
    `REGION="${awsRegion}"\nSLACK_PATH="${slackPath}"\nCLIENT_PORT=${clientPort}\nSERVER_PORT=${serverPort}\n`

    if (mainQueueUrl) envFile += `MAIN_QUEUE_URL="${mainQueueUrl}"\nMAIN_QUEUE_NAME="${getQueueName(mainQueueUrl)}"\n`

    const confirmation = await inquirer.prompt([{
      name: 'confirmation',
      type: 'confirm',
      message: `You entered:\n${envFile}\n Please confirm these selections (y/n)`,
    }])

    if (confirmation) {
      //  installClientDependencies when client dir is added
      // await fs.writeFile('.env', envFile, (err) => {
      //   console.log(err)
      // })
      exec("touch .env");
      await prependFile('.env', envFile);
      await moveEnvFile(src, serverDest);

      // await fs.writeFile('.env', envFile, (err) => {
      //   console.log(err)
      // })
      exec("touch .env");
      await prependFile('.env', envFile);
      await moveEnvFile(src, infraDest)

      // await fs.writeFile('.env', envFile, (err) => {
      //   console.log(err)
      // })
      exec("touch .env");
      await prependFile('.env', envFile);
      await moveEnvFile(src, clientDest)

      // await fs.writeFile('.env', envFile, (err) => {
      //   console.log(err)
      // })
      exec("touch .env");
      await prependFile('.env', envFile);

      await exec('npm run installAppDependencies')
      await exec('npm run installClientDependencies')
      await exec('npm run installInfraDependencies')
    }

  let spinner;

  try {
    spinner = log.spin('Creating IAM Role...')
    await createRole()
    spinner.succeed();

    if (stackChoice === 'Main Queue and DLQ') {
      spinner = log.spin('Creating Main Queue...')
      await createMainQueue().then(async (queueUrl) => {
        spinner.succeed();
        mainQueueUrl = queueUrl
      })
    }  

    spinner = log.spin('Creating DLQ...')
    await createDLQ()
    spinner.succeed();

    spinner = log.spin('Joining Main Queue and DLQ...')
    await joinDlqMain(mainQueueUrl)
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
    await setEnvVariables(awsRegion, slackPath, mainQueueUrl).then(() => spinner.succeed())

    spinner = log.spin('Creating Zip Files...')
    await createZipFiles().then(() => spinner.succeed())

    spinner = log.spin('Pushing Lambda Handlers to S3 Bucket...')
    await pushLambdasToS3(bucketName).then(() => spinner.succeed())

    spinner = log.spin('Creating all Lambdas...')
    await createLambdas(bucketName, awsRegion).then(() => spinner.succeed())

    spinner = log.spin('Setting Event Source Mapping for publishing to SNS...')
    await setEventSourceMapping(awsRegion)
    spinner.succeed()

    spinner = log.spin('Subscribing Lambdas to SNS...')
    await subscribeToSns(awsRegion)
    spinner.succeed();;

    spinner = log.spin('Adding permissions for SNS...')
    await addPermissions(awsRegion)
    spinner.succeed();
  } catch (err) {
    spinner.fail()
    console.log(err)
  } finally {
    console.log(kuriLogo)
  }
};