import * as fs from "fs/promises";

const fileName = import.meta.url.match(/\/([^\/]+?)\.js$/)[1];
const input = fs.readFile(`./input/${fileName}.txt`, "utf-8");

input
    .then(input => { console.log(solution(input)) })
    .catch(error => { console.error(`Error occured\n${error}`); });

const solution = (input) => {
    let current = { length: 5, start: 0, unchecked: 1, counter: 0 };
    while (input[current.start] && current.unchecked != current.length) {
        current = checkGroup(input, current);
    }
    return current.start + current.length
}

const checkGroup = (input, args) => {
    const { length, start, unchecked, counter } = args;
    let lastDupe = start - 1;
    let newCounter = 0;
    for (let i = start; i < (start + length - 1); i++) {
        for (let k = (i - start) >= unchecked ? i + 1 : (start + unchecked); k < (start + length); k++) {
            lastDupe = input[i] == input[k] ? i : lastDupe;
            newCounter++;
        }
    }
    return { ...args, start: lastDupe + 1, unchecked: length - 1 - lastDupe + start, counter: counter + newCounter }
}