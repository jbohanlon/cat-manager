import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

const nodeEnv = process.env.NODE_ENV || 'development';
const fileContent = fs.readFileSync(path.resolve('./config/ormconfig.yml'), 'utf8');
const dbConfig = yaml.load(fileContent) as Record<string, any>;
const configForEnv = dbConfig[nodeEnv];

if (configForEnv === undefined) {
  throw new Error(`Invalid NODE_ENV: ${nodeEnv}`);
}

// eslint-disable-next-line no-console
console.log(`Running in environment: ${nodeEnv}`);

export default configForEnv;
