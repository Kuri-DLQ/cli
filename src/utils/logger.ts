import ora from 'ora';
import chalk from 'chalk';

class Logger {
  spin(msg: string) {
    const spinner = ora(msg)
    spinner.color = 'red'
    return spinner.start()
  }

  info(msg: string): void {
    ora().info(msg);
  }

  error(msg: string): void {
    ora().fail(chalk.bold.red(msg));
  }
}

const log = new Logger();

export default log