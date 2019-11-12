import * as yaml from 'js-yaml';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as merge from 'lodash/merge';

export function readConfig() {
  const defaults = yaml.safeLoad(fs.readFileSync(
    path.resolve(__dirname, '..', 'config.defaults.yaml')
  ));
  const userConfig = yaml.safeLoad(fs.readFileSync(
    path.resolve(__dirname, '..', 'config.yaml')
  ));
  return merge(defaults, userConfig);
}
