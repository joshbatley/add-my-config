#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import os from 'os';
import chalk from 'chalk';
import program from 'commander';
import { spawnSync } from 'child_process';

/**
 * TOOD:
 * - publish
 */

program
  .version('1.0')
  .option('-s, --src [src]', 'Folder of the files to add project')
  .option('-d, --dest [dest]', 'Destination folder')
  .option('-ni, --no-install', 'Update the package.json ')
  .option('-ny, --no-yarn', 'prevent use of yarn and only use npm')
  .parse(process.argv);

const homedir: string = os.homedir();

const srcFolder: string = program.src
  ? program.src
  : path.join(homedir, '.my-config');

const destFolder: string = program.dest ? program.dest : __dirname;

const destFriendlyName = (folder: string) =>
  folder.split('/')[folder.split('/').length - 1];

const destPackage = fs.readFileSync(path.join(destFolder, 'package.json'), 'utf8')

const useYarn =
  program.yarn && fs.existsSync(path.join(destFolder, 'yarn.lock'));

const errLog = (msg: string, err: Error | string) => {
  if (err) {
    console.log()
    console.log(chalk.bgRed('   ERROR   '))
    console.log(chalk.red(msg))
    console.log()
    console.log(err.toString())
  }
};
const infoLog = (str: string) => str && console.log(chalk.blue(str));
const successLog = (str: string) => str && console.log(chalk.green(str));

const command = useYarn ? 'yarn' : 'npm';
const args = useYarn ? [] : ['i'];

const formatData = (mergeData: any) => {
  let data: any;
  try {
    data = JSON.parse(destPackage)
    mergeData = JSON.parse(mergeData)
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
    errLog('Looks like we couldn\'t update your packages, make sure the file is valid and try again', err)
    throw err
  }
};

const allDone = () => {
  console.log();
  successLog('All done files copied, enjoy your setup 😘');
  console.log();
}


infoLog('Starting up')
const files = fs.readdirSync(srcFolder);
files.forEach((file) => {
  const srcFile = path.join(srcFolder, file);
  const destFile = path.join(destFolder, file);
  if (file !== 'package.json') {
    fs.copyFileSync(srcFile, destFile);
    infoLog(
      `- Copied ${file}${
        program.src ? ' from ' + program.src : ''
      } to ${destFriendlyName(destFolder)}`
    );
  } else if (program.install) {
    const data = fs.readFileSync(srcFile, 'utf8');
    console.log()
    infoLog('Merging and updateing package.json');
    try {
      fs.writeFileSync(
        path.join(destFolder, 'package.json'),
        formatData(data), 'utf8'
      );
      spawnSync(command, args, { stdio: 'inherit' });
      allDone();
    } catch (err) {
      throw err
    }
  } else {
    allDone();
  }
});
