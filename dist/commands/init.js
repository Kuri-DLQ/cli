"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const inquirer = require('inquirer');
const fs = require('fs-extra');
const { series } = require('async');
const { exec } = require('child_process');
require('dotenv').config();
const src = '.env';
const serverDest = '../app_server_express/.env';
const cdkDest = '../aws_infrastructure/.env';
async function moveEnvFile(source, destination) {
    try {
        await fs.move(source, destination);
        console.log('success!');
    }
    catch (error) {
        console.error(error);
    }
}
const runScripts = async () => {
    console.log("in run scripts");
    series([
        () => exec('npm run boot'),
    ]);
};
class Init extends core_1.Command {
    async run() {
        let stackChoice = await inquirer.prompt([{
                name: 'stack',
                message: 'Choose a starting template',
                type: 'list',
                choices: [{ name: 'Main Queue and DLQ' }, { name: 'DLQ only' }],
            }]);
        stackChoice = stackChoice.stack;
        const awsAccessKey = await core_1.CliUx.ux.prompt('What is your AWS ACCESS KEY?');
        const awsSecretKey = await core_1.CliUx.ux.prompt('What is your AWS SECRET KEY?');
        const awsRegion = await core_1.CliUx.ux.prompt('What is your AWS Region?');
        const awsAccountNumber = await core_1.CliUx.ux.prompt('What is your AWS account number?');
        let slackPath = false;
        const useSlack = await inquirer.prompt([{
                name: 'slack',
                type: 'confirm',
                message: 'Would you like to see DLQ notifications in Slack?',
            }]);
        if (useSlack.slack === true) {
            slackPath = await core_1.CliUx.ux.prompt('What is your Slack webhook path?');
        }
        let serverPort = await inquirer.prompt([{
                name: 'port',
                type: 'input',
                default: '5000',
                message: 'Which port would you like the Kuri server to run on?',
            }]);
        serverPort = serverPort.port;
        let clientPort = await inquirer.prompt([{
                name: 'port',
                type: 'input',
                default: '3000',
                message: 'Which port would you like the Kuri server to run on?',
            }]);
        clientPort = clientPort.port;
        const envFile = `STACK="${stackChoice}"\nACCESS_KEY="${awsAccessKey}"\nSECRET_KEY="${awsSecretKey}"\n` +
            `REGION="${awsRegion}"\nSLACK_PATH="${slackPath}"\nCLIENT_PORT=${clientPort}\nSERVER_PORT=${serverPort}\nAWS_ACCOUNT_NUMBER="${awsAccountNumber}"`;
        fs.writeFile('.env', envFile, (e) => {
            console.log(e);
        });
        await moveEnvFile(src, serverDest);
        fs.writeFile('.env', envFile, (e) => {
            console.log(e);
        });
        await moveEnvFile(src, cdkDest);
        runScripts();
    }
}
exports.default = Init;
Init.description = 'Initializes Kuri infrastructure';
