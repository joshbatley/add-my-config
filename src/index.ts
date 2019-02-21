#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import os from 'os';
import chalk from 'chalk';
import program from 'commander';
import { spawnSync } from 'child_process';

program
  .version('1.0')
  .option('-s, --src [src]', 'Folder of the files to add project')
  .option('-d, --dest [dest]', 'Destination folder')
  .option('-ni, --no-install', 'Update the package.json ')
  .option('-ny, --no-yarn', 'prevent use of yarn and only use npm')
  .parse(process.argv);

const folder = {
  package: () =>
    fs.readFileSync(path.join(folder.dest, 'package.json'), 'utf8'),
  src: program.src ? program.src : path.join(os.homedir(), '.my-config'),
  dest: program.dest ? path.resolve(program.dest) : path.resolve('./'),
};

const destFriendlyName = (folder: string) =>
  folder.split('/')[folder.split('/').length - 1];

const useYarn =
  program.yarn && fs.existsSync(path.join(folder.dest, 'yarn.lock'));

const usePackage =
  fs.existsSync(path.join(folder.dest, 'package.json'))

const command = useYarn ? 'yarn' : 'npm';
const args = useYarn ? [] : ['i'];
const spawn = () => spawnSync(command, args, { stdio: 'inherit' });

const formatData = (mergeData: any) => {
  let data: any;
  try {
    data = JSON.parse(folder.package());
    mergeData = JSON.parse(mergeData);
    return JSON.stringify(
      Object.assign(
        {},
        data,
        ...Object.keys(mergeData).map((section: any) => ({
          [section]: mergeData[section]
            ? Object.assign({}, mergeData[section], data[section])
            : data[section],
        }))
      ),
      null,
      2
    );
  } catch (err) {
    log.error(
      "Looks like we couldn't update your packages, make sure the file is valid and try again",
      err
    );
    throw err;
  }
};

const log = {
  finish: () => {
    console.log();
    log.success('All done files copied, enjoy your setup 😘');
    console.log();
  },
  info: (str: string) => str && console.log(chalk.blue(str)),
  success: (str: string) => str && console.log(chalk.green(str)),
  error: (msg: string, err: Error | string) => {
    if (err) {
      console.log();
      console.log(chalk.bgRed('   ERROR   '));
      console.log(chalk.red(msg));
      console.log();
      console.log(err.toString());
    }
  },
};

const ignoredFiles: string[] = ['.DS_Store'];

log.info('Starting up');
const files = fs.readdirSync(folder.src);
files.forEach((file) => {
  const srcFile = path.join(folder.src, file);
  const destFile = path.join(folder.dest, file);
  if (file !== 'package.json' && !ignoredFiles.includes(file)) {
    fs.copyFileSync(srcFile, destFile);
    log.info(
      `- Copied ${file}${
        program.src ? ' from ' + program.src : ''
      } to ${destFriendlyName(folder.dest)}`
    );
  } else if (program.install && file === 'package.json' && usePackage) {
    const data = fs.readFileSync(srcFile, 'utf8');
    console.log();
    log.info('Merging and updateing package.json');
    try {
      fs.writeFileSync(
        path.join(folder.dest, 'package.json'),
        formatData(data),
        'utf8'
      );
      spawn();
    } catch (err) {
      throw err;
    }
  }
});

log.finish();
