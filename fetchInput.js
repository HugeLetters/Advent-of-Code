import 'dotenv/config';
import * as fs from "fs";

export const getInput = URL => fetch(URL, { headers: { cookie: process.env.cookie } }).then(x => x.text())

const range = [...Array(25).keys()];
range.forEach((element) => {
    const inputURL = `https://adventofcode.com/2022/day/${element + 1}/input`;
    const fileName = `${element + 1}`;
    getInput(inputURL)
        .then(input => input.replace(/\n$/, ""))
        .then(input => { fs.writeFileSync(`./input/${fileName}.txt`, input) })
        .catch(error => { console.error(`Error occured\n${error}`) });
});