import TestManager from './managers/TestManager'
import chalk from 'chalk';

export default (config) => {
  const manager = new TestManager(config)
  manager.launch().catch(e => {
    console.error(chalk.red(e.message));
    process.exit(1);
  })
}
