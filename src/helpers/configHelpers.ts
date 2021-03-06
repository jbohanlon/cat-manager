import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

export const loadOrmConfig = (nodeEnv: string) => {
  const fileContent = fs.readFileSync(path.resolve('./config/ormconfig.yml'), 'utf8');
  const dbConfig = yaml.load(fileContent) as Record<string, any>;
  const envDbConfig = dbConfig[nodeEnv];

  return envDbConfig;
};

export const ensureValidNodeEnv = () => {
  const nodeEnv = process.env.NODE_ENV;
  if (!['development', 'test', 'production'].includes(nodeEnv) || !nodeEnv) {
    throw new Error(`Invalid NODE_ENV specified. (Got NODE_ENV=${nodeEnv})`);
  }
};
