import chalk from 'chalk';
import fs from 'fs';
import DataBaseManager from './DataBaseManager';
import cp from '../util/cp';

import tce from '../util/tce';
import makePath from '../util/makePath';

export default class TestManager {
  constructor({ dir = './build/tests', migrations_dir = './src/db', db = false, env = {} }) {
    this.dir = dir;
    this.db = db;
    this.config = {
      NODE_ENV: 'test',
      MYSQL_USER: 'root',
      MYSQL_PASSWORD: 'root',
      MYSQL_DATABASE: 'test',
      MYSQL_HOST: 'localhost',
      ...env
    };
    this.migrations_dir = migrations_dir
    this.env = Object.keys(this.config).map(k => `${k}=${this.config[k]}`).join(' ');
  }

  async prepareDb() {
    console.log(chalk.cyan('Preparing database...'));
    const dbManager = new DataBaseManager({ config: this.config, dir: this.migrations_dir });
    await tce(dbManager.migrate());
  }

  async launch() {
    if (this.db) {
      await this.prepareDb();
    }

    console.log(chalk.cyan('Preparing tests...'));

    const testsPath = makePath(this.dir);
    const tests = fs.readdirSync(testsPath).filter(i => i.endsWith('test.mjs'));
    let successCount = 0;
    let failedCount = 0;

    await tce(Promise.all(tests.map(async (t) => {
      try {
        const { stdout } = await cp.exec(`${this.env} node --experimental-modules --no-warnings  ${this.dir}/${t}`);
        /* test passed successfully */
        successCount ++;
        console.log(stdout);
      } catch (e) {
        const { stdout } = e;
        /* test failed */
        failedCount ++;
        console.log(stdout);
      }
    })));
    console.log(`${chalk.cyan('Tests count')}: ${successCount + failedCount}\n${chalk.green('Successfully passed')}: ${successCount}\n${chalk.red('Failed')}: ${failedCount}`)
    if (failedCount > 0) {
      process.exit(1);
    }
  }
}
