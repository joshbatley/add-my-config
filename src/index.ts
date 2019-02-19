#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import os from 'os';
import chalk from 'chalk';
import program from 'commander';
const { spawn } = require('child_process');

const homedir: string = os.homedir();

/**
 * TOOD:
 * - If package.json merge files
 * - log all files movied
 * - log progress
 * - display options
 * - allow config changes
 * - fire off yarn/npm install
 */

program
  .option('-s', '--src', 'Folder of the files to add project')
  .option('-d', '--dest', 'Destination folder')
  .option('-u', '--update-packages', 'Update the package.json ')
  .parse(process.argv);

const configFolder: string = path.join(homedir, '.my-config');
const currentFolder: string = './';

const copyFilesFromfolder = (src?: string, dest?: string) => {
  fs.readdir(configFolder, (err: Error, files: string[]) => {
    if (err) {
      errLog(err);
    }

    files.forEach((file) => {
      const src = path.join(configFolder, file);
      const dest = path.join(currentFolder, file);
      if (file !== 'package.json') {
        fs.copyFile(src, dest, (err) => {
          errLog(err);
        });
      } else {
        fs.readFile(src, 'utf8', (err, data) => {
          mergePackage(JSON.parse(data));
        });
      }
    });
  });
};

const mergePackage = (mergeData: any) => {
  const src = path.join(currentFolder, 'package.json');
  fs.readFile(src, 'utf8', (err, d: any) => {
    const data = JSON.parse(d);
    const newData = JSON.stringify(Object.assign(
      {},
      ...Object.keys(data).map((sections: any) => ({
        [sections]: mergeData[sections]
          ? Object.assign({}, mergeData[sections], data[sections])
          : data[sections],
      }))
    ), null, 2);
    fs.writeFile(src, newData, 'utf8', (err) => {
      if(!err) {
        spawn('yarn', { stdio: 'inherit' })
        console.log(chalk.blue('done'))
      }
    });
  });
};

const errLog = (err: Error) => err && console.log(err);

copyFilesFromfolder();
