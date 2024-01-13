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

const newVersion = newVersionParts.join('.');

// package.json
packageJson['version'] = newVersion;
fs.writeFileSync('../../package.json', JSON.stringify(packageJson, null, 2));
console.log('- Version updated in package.json');

// hooks.client.ts
const hooksContent = fs.readFileSync('../hooks.client.ts').toString();
fs.writeFileSync('../hooks.client.ts', hooksContent.replace(/const npm_package_version \= \'.+/, `const npm_package_version = '${newVersion}';`));
console.log('- Version updated in hooks.client.ts');

console.log(`\nVersion set to ${newVersion}`);

