import inquirer from 'inquirer';
import fs from 'fs-extra';
import { exec } from 'child_process';
import { getQueueName } from '../../sdk_infrastructure/aws/sqs/queueName.js';
import prependFile from 'prepend-file';

const src = './.env'
const serverDest = '../app_server_express/.env'
const infraDest = '../sdk_infrastructure/.env'
const clientDest = '../dashboard/.env'

async function moveEnvFile (source, destination) {
  try {
    await fs.move(source, destination)
  } catch (err) {
    console.error(err)
  };
}

export const init = async () => {
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
      message: `\nYou entered:\n${envFile}\n Please confirm these selections (y/n)`,
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
};