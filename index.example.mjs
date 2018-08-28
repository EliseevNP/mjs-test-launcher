import createTestManager from './index'

createTestManager({
  env: {
    NODE_ENV: 'test',
    MYSQL_USER: 'root',
    MYSQL_PASSWORD: 'root',
    MYSQL_DATABASE: 'test',
    MYSQL_HOST: 'localhost'
  },
  db: false,
  dir: './src/tests',
  migrations_dir: './src/db'
});
