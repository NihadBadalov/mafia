import fs from 'fs';
const { argv } = Bun;


const packageJson = JSON.parse(fs.readFileSync('../../package.json', 'utf-8').toString());
let currentVersion = packageJson?.version;

/** @type {number} */
let action;

switch (argv?.[2]) {
  case '-':
    action = -1;
    break;

  case '+':
  default:
    action = 1;
    break;
}

let newVersionParts = currentVersion.split('.').map(Number);

if (argv.find(arg => arg.includes('major'))) {
  newVersionParts[0] += action;
} else if (argv.find(arg => arg.includes('middle'))) {
  newVersionParts[1] += action;
} else {
  newVersionParts[newVersionParts.length - 1] += action;
}

packageJson['version'] = newVersionParts.join('.');

fs.writeFileSync('../../package.json', JSON.stringify(packageJson, null, 2));

