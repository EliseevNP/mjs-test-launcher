## Test launcher for mjs-mocha

### Configuration

- Create file, for example launcher.mjs

- Add script to your package.json:

```json
{
"test": "node --experimental-modules ./launcher.mjs"
}
```

- All variables in config are defined by default as in example below, override them if you want.

- launcher.mjs:

```js 
import launch from 'mjs-test-launcher';

launch({
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
```
