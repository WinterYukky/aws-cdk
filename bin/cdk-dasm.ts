import * as YAML from 'yaml-cfn';
import { dasmTypeScript } from '../lib';

let s = '';
process.stdin.resume();
process.stdin.on('data', data => {
  s += data.toString('utf-8');
});

process.stdin.on('end', () => {
  dasmTypeScript(YAML.yamlParse(s)).then(out => {
    process.stdout.write(out);
  });
});
