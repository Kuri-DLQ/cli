import orchestrator from '../../sdk_infrastructure/aws/orchestrator.js'
import log from '../utils/logger.js'

export const deploy = async () => {
  let spinner;

  try {
    spinner = log.spin('Creating IAM Role...')
    await orchestrator.createRole()
    spinner.succeed();
  } catch (err) {
    spinner.fail()
    console.log(err)
  }
};