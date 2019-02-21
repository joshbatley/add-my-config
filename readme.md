# Add my config

To run `npx add-my-config`

A simple app to add config files to a project, simple add a folder in your home directory name `.my-config` and place any file you want to import into any projects. for example `.editorconfig`.

Another feature is if your config files require packages such as a eslint file, you can create a package.json in your `.my-config` this will be used merge your package.json. The package.json in the config folder doesn't need to be complete, just the infomartion you need to merge, for example:
```
{
  "devDependencies": {
    "@types/node": "^11.9.4",
  }
}
```

## Quick Help
```
Usage: index [options]

Options:
  -V, --version      output the version number
  -s, --src [src]    Folder of the files to add project
  -d, --dest [dest]  Destination folder
  -ni, --no-install  Update the package.json
  -ny, --no-yarn     prevent use of yarn and only use npm
  -h, --help         output usage information
```
