//

import mysql from 'mysql';
import util from 'util';
import chalk from 'chalk';
import fs from 'fs';

import tce from '../util/tce';
import makePath from '../util/makePath';

export default class DataBaseManager {
  constructor({ dir = './src/db/migrations', config }) {
    this.dir = dir;
    this.config = config;
    this.connect();
  }

  connect() {
    const {
      MYSQL_USER: user = 'root', MYSQL_PASSWORD: password = 'root', MYSQL_HOST: host = 'localhost', MYSQL_DATABASE: database = 'test',
    } = this.config;

    const pool = mysql.createConnection({
      host,
      user,
      password,
      database,
      multipleStatements: true,
    });

    pool.query = util.promisify(pool.query);
    this.db = pool;
  }

  disconnect() {
    this.db.end(e => e && console.error(chalk.red(e.message)));
  }

  async migrate() {
    const migrationsDir = makePath(this.dir);

    if (!fs.existsSync(migrationsDir)) {
      console.log(chalk.red('Migrations directory not found'));
      return false;
    }

    console.log(chalk.cyan('Launching migrations...'));

    const success = await tce(this.db.query(fs
      .readdirSync(migrationsDir)
      .sort()
      .map(f => (fs.readFileSync(`${migrationsDir}/${f}`)).toString())
      .join('')));

    this.disconnect();

    if (success) {
      console.log(chalk.green('Done!🎉'));
      return true;
    }
    process.exit(1);
  }
}
