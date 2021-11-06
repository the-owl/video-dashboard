import * as yaml from 'js-yaml';
import * as path from 'path';
import * as fs from 'fs-extra';
import merge from 'lodash/merge';

export function readConfig() {
  const defaults = yaml.load(fs.readFileSync(
    path.resolve(__dirname, '..', 'config.defaults.yaml'),
    { encoding: 'utf8' },
  ));
  const userConfig = yaml.load(fs.readFileSync(
    path.resolve(__dirname, '..', 'config.yaml'),
    { encoding: 'utf8' },
  ));
  return merge(defaults, userConfig) as any;
}
