import chalk from 'chalk';
import fs from 'fs';
import DataBaseManager from './DataBaseManager';
import cp from '../util/cp';

import tce from '../util/tce';
import makePath from '../util/makePath';

export default class TestManager {
  constructor({ dir = './build/tests', migrations_dir = './src/db', db = false, env = {}, ext = ['mjs'] }) {
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
    this.ext = ext;
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
    const tests = fs.readdirSync(testsPath).filter(i => {
      return this.ext.some(ext => {
        return i.endsWith(`test.${ext}`);
      });
    });
    let successCount = 0;
    let failedCount = 0;

    await tce(Promise.all(tests.map(async (t) => {
      try {
        const { stdout } = await cp.exec(`${this.env} node --es-module-specifier-resolution=node --experimental-modules --no-warnings  ${this.dir}/${t}`);
        /* test passed successfully */
        successCount ++;
        console.log(stdout);
      } catch (e) {
        /* test failed */
        failedCount ++;
        console.log(e.stdout ? e.stdout : e, e.stderr ? e.stderr : '');
      }
    })));
    console.log(`${chalk.cyan('Tests count')}: ${successCount + failedCount}\n${chalk.green('Successfully passed')}: ${successCount}\n${chalk.red('Failed')}: ${failedCount}`)
    if (failedCount > 0) {
      process.exit(1);
    }
  }
}
