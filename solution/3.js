import * as fs from "fs/promises";

const fileName = import.meta.url.match(/\/([^\/]+?)\.js$/)[1];
const input = fs.readFile(`./input/${fileName}.txt`, "utf-8");

input
    .then(input => { console.log(solution(input)) })
    .catch(error => { console.error(`Error occured\n${error}`); });

const solution = (input) => {
    const inputList = listFromInput(input);
    const duplicateList = inputList.map(e => getDuplicate(e));
    const charcodeList = duplicateList.map((e => e.charCodeAt(0)));
    const priorityList = charcodeList.map(e => e > 96 ? e - 96 : e - 38)
    const result = priorityList.reduce((sum, el) => sum + el);
    return result
}

const listFromInput = input => input
    .split(/((?:.+\n){3,3})/).filter(x => x != "").map(e => e
        .split(/\n/).filter(x => x != "").map(e => e
            .split("")))

const getDuplicate = list => {
    const [first, second, third] = list;
    const firstDict = {}, secondDict = {};
    first.forEach(element => { firstDict[element] = true });
    second.forEach(element => { firstDict[element] ? secondDict[element] = true : 1 });
    return third.reduce((duplicate, value) => secondDict[value]
        ? value
        : duplicate
    );
}

