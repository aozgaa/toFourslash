import fs = require('fs');

const argv = process.argv;
if (argv.length < 4) {
    throw new Error("must provide path to directory to convert and output file");
}

let root = argv[2];
if (root[root.length - 1] != '/') {
    root = root.concat('/');
}

let uncheckedPaths = [root];
const checkedFiles: string[] = [];

// get all files under root.
while (uncheckedPaths.length > 0) {
    const nextPath = uncheckedPaths.pop();
    const nextPathStats = fs.statSync(nextPath);
    if (nextPathStats.isFile()) {
        checkedFiles.push(nextPath);
    }
    else if (nextPathStats.isDirectory()) {
        const children = fs.readdirSync(nextPath).map(item => `${nextPath}/${item}`);
        uncheckedPaths = uncheckedPaths.concat(children.reverse());
    }
}

const newLine = "\r\n";
const target = argv[3];
const fourslashTest = fs.writeFileSync(target, `/// <reference path='fourslash.ts'/>${newLine}`);

const rootLength = root.length;
for (const filePath of checkedFiles) {
    const fourslashPath = filePath.slice(rootLength);
    const fileHeader = `${newLine}${newLine}// @Filename: ${fourslashPath}${newLine}//// `;
    const fileContentsByLine = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
    const fourslashedContents = fileContentsByLine.join(`${newLine}//// `);
    fs.appendFileSync(target, fileHeader + fourslashedContents);
}