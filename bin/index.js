#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const chalk_1 = __importDefault(require("chalk"));
const commander_1 = __importDefault(require("commander"));
const child_process_1 = require("child_process");
commander_1.default
    .version('1.0')
    .option('-s, --src [src]', 'Folder of the files to add project')
    .option('-d, --dest [dest]', 'Destination folder')
    .option('-ni, --no-install', 'Update the package.json ')
    .option('-ny, --no-yarn', 'prevent use of yarn and only use npm')
    .parse(process.argv);
const folder = {
    package: () => fs_1.default.readFileSync(path_1.default.join(folder.dest, 'package.json'), 'utf8'),
    src: commander_1.default.src ? commander_1.default.src : path_1.default.join(os_1.default.homedir(), '.my-config'),
    dest: commander_1.default.dest ? path_1.default.resolve(commander_1.default.dest) : path_1.default.resolve('./'),
};
const destFriendlyName = (folder) => folder.split('/')[folder.split('/').length - 1];
const useYarn = commander_1.default.yarn && fs_1.default.existsSync(path_1.default.join(folder.dest, 'yarn.lock'));
const usePackage = fs_1.default.existsSync(path_1.default.join(folder.dest, 'package.json'));
const command = useYarn ? 'yarn' : 'npm';
const args = useYarn ? [] : ['i'];
const spawn = () => child_process_1.spawnSync(command, args, { stdio: 'inherit' });
const formatData = (mergeData) => {
    let data;
    try {
        data = JSON.parse(folder.package());
        mergeData = JSON.parse(mergeData);
        return JSON.stringify(Object.assign({}, data, ...Object.keys(mergeData).map((section) => ({
            [section]: mergeData[section]
                ? Object.assign({}, mergeData[section], data[section])
                : data[section],
        }))), null, 2);
    }
    catch (err) {
        log.error("Looks like we couldn't update your packages, make sure the file is valid and try again", err);
        throw err;
    }
};
const log = {
    finish: () => {
        console.log();
        log.success('All done files copied, enjoy your setup 😘');
        console.log();
    },
    info: (str) => str && console.log(chalk_1.default.blue(str)),
    success: (str) => str && console.log(chalk_1.default.green(str)),
    error: (msg, err) => {
        if (err) {
            console.log();
            console.log(chalk_1.default.bgRed('   ERROR   '));
            console.log(chalk_1.default.red(msg));
            console.log();
            console.log(err.toString());
        }
    },
};
const ignoredFiles = ['.DS_Store'];
log.info('Starting up');
const files = fs_1.default.readdirSync(folder.src);
files.forEach((file) => {
    const srcFile = path_1.default.join(folder.src, file);
    const destFile = path_1.default.join(folder.dest, file);
    if (file !== 'package.json' && !ignoredFiles.includes(file)) {
        fs_1.default.copyFileSync(srcFile, destFile);
        log.info(`- Copied ${file}${commander_1.default.src ? ' from ' + commander_1.default.src : ''} to ${destFriendlyName(folder.dest)}`);
    }
    else if (commander_1.default.install && file === 'package.json' && usePackage) {
        const data = fs_1.default.readFileSync(srcFile, 'utf8');
        console.log();
        log.info('Merging and updateing package.json');
        try {
            fs_1.default.writeFileSync(path_1.default.join(folder.dest, 'package.json'), formatData(data), 'utf8');
            spawn();
        }
        catch (err) {
            throw err;
        }
    }
});
log.finish();
