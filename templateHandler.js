#!/usr/bin/env node

import inquirer from 'inquirer';
import * as http from 'http';
import * as fs from 'node:fs/promises';

const funcRegex = /(?<=\$\().*?(?=\))/;
const varRegex = /\$\(([^)]+)\)/g;

inquirer
  .prompt(
    [
        {
          type: 'input',
          name: 'htmlPath',
          message: 'HTML template path: '
        },
        {
          type: 'input',
          name: 'dataPath',
          message: 'Data file path: '
        }
      ]
  )
  .then((answers) => {
    const { htmlPath, dataPath } = answers;

    readFileData(htmlPath).then((html) => {
      const vars = html.match(varRegex);
      console.log('Variables: ', vars);

      readFileData(dataPath).then((file) => {
        file = JSON.parse(file);
        vars.forEach((v) => {
          const key = getVarKey(v);
          html = html.replace(v, file[key]);
        });
        runServer(html);
      });
    });
  })
  .catch((err) => console.log(err.message));

async function readFileData(path) {
    try {
        const data = await fs.readFile(path, { encoding: 'utf8' });
        return data;
    } catch (e) {
        console.log(e.message);
    }
}

function getVarKey(str) {
    console.log(str.match(funcRegex));
    return str.match(funcRegex)[0];
}

function runServer(html) {
    const server = http.createServer((_, res) => {
        res.writeHead(200, { 'content-type': 'text/html' });
        res.end(html);
    });
    const port = 3000;
    server.listen(port, () => {
      console.log(`Server run on port: ${port}.\nPress Ctrl + C to exit.`);
    });
  }