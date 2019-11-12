import * as yaml from 'js-yaml';
import * as path from 'path';
import * as fs from 'fs-extra';

export function readConfig() {
  const defaults = yaml.safeLoad(fs.readFileSync(
    path.resolve(__dirname, '..', 'config.defaults.yaml')
  ));
  const userConfig = yaml.safeLoad(fs.readFileSync(
    path.resolve(__dirname, '..', 'config.yaml')
  ));
  return Object.assign(defaults, userConfig);
}
